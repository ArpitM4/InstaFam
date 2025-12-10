"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { fetchCreatorVaultItems, redeemVaultItem, fetchRedeemedItems, fetchFanRedemptions } from '@/actions/vaultActions';
import { useUser } from '@/context/UserContext';
import { emitPaymentSuccess } from '@/utils/eventBus';
import { FaGem, FaPlus, FaList, FaShoppingBag } from 'react-icons/fa';

// Components
import VaultItemCard from './vault/VaultItemCard';
import VaultRequests from './vault/VaultRequests';
import AddVaultItemModal from './vault/AddVaultItemModal';
import EditVaultItemModal from './vault/EditVaultItemModal';
import RedeemVaultModal from './vault/RedeemVaultModal';
import VaultSuccessModal from './vault/VaultSuccessModal';

const VaultSection = ({ currentUser, initialItems, isOwner, onPointsUpdate }) => {
  const { data: session } = useSession();
  const { updatePoints } = useUser();

  // State
  const [vaultItems, setVaultItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [redemptionsLoading, setRedemptionsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [redemptionStatuses, setRedemptionStatuses] = useState({});
  const [myRedemptions, setMyRedemptions] = useState([]);

  // Modals / View State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRedeemItem, setSelectedRedeemItem] = useState(null); // Item to redeem
  const [editItem, setEditItem] = useState(null); // Item to edit
  const [successData, setSuccessData] = useState(null); // { item, fanInput } for success modal
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'requests'
  const [infoExpanded, setInfoExpanded] = useState(false); // Expandable info section

  // ... (useEffect and load functions unchanged)

  // ... (handleRedeemSuccess unchanged)



  useEffect(() => {
    if (currentUser?.username) {
      if (!initialItems) loadVaultItems();
      if (session?.user?.name) loadFanData();
    }
  }, [currentUser, session]);

  const loadVaultItems = async () => {
    try {
      setLoading(true);
      const result = await fetchCreatorVaultItems(currentUser.username);
      if (result.success) setVaultItems(result.items || []);
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFanData = async () => {
    try {
      setRedemptionsLoading(true);

      // Run all API calls in parallel for faster loading
      const promises = [];

      if (currentUser?._id) {
        promises.push(
          fetch(`/api/points?creatorId=${currentUser._id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) setUserPoints(data.points || 0);
            })
        );
      }

      if (currentUser?.username) {
        promises.push(
          fetchRedeemedItems(currentUser.username)
            .then(redeemedRes => {
              if (redeemedRes.success) setRedeemedItems(redeemedRes.redeemedItems || []);
            })
        );

        promises.push(
          fetchFanRedemptions(currentUser.username)
            .then(redemptionsRes => {
              if (redemptionsRes.success) {
                setMyRedemptions(redemptionsRes.redemptions || []);
                const statusMap = {};
                redemptionsRes.redemptions.forEach(r => {
                  if (!r.vaultItemId) return;
                  const id = r.vaultItemId._id;
                  if (!statusMap[id]) {
                    statusMap[id] = { status: r.status, fanInput: r.fanInput, creatorResponse: r.creatorResponse, rejectionReason: r.rejectionReason, count: 0 };
                  }
                  if (r.status !== 'Rejected' && r.status !== 'Cancelled') {
                    statusMap[id].count += 1;
                  }
                });
                setRedemptionStatuses(statusMap);
              }
            })
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading fan data:', error);
    } finally {
      setRedemptionsLoading(false);
    }
  };

  // ... (handleRedeemSuccess updates)
  const handleRedeemSuccess = async (item, fanInput) => {
    try {
      const result = await redeemVaultItem(item._id, currentUser.username, fanInput);
      if (result.success) {
        // Use authoritative remaining points from API if available, else optimistic
        if (typeof result.pointsRemaining === 'number') {
          setUserPoints(result.pointsRemaining);
        } else {
          setUserPoints(prev => prev - item.pointCost);
        }

        // Notify parent to refresh FamPoints in header
        if (onPointsUpdate) {
          onPointsUpdate();
        }

        setRedeemedItems(prev => [...prev, item._id]);
        // Optimistically update Store Cards status
        setRedemptionStatuses(prev => {
          const current = prev[item._id] || { count: 0 };
          return {
            ...prev,
            [item._id]: { status: 'Pending', fanInput, count: current.count + 1 }
          };
        });

        // Optimistically update My Redemptions List (Instant UI)
        const isAutoFulfilled = item.type === 'file' || item.type === 'text';
        const newRedemption = {
          _id: result.redemption.id,
          vaultItemId: item,
          status: isAutoFulfilled ? 'Fulfilled' : 'Pending',
          fanInput: fanInput,
          creatorResponse: isAutoFulfilled ? item.fileUrl : null, // Store secret/file link immediately
          createdAt: result.redemption.redeemedAt
        };
        setMyRedemptions(prev => [newRedemption, ...prev]);

        if (updatePoints) updatePoints();
        emitPaymentSuccess({ pointsSpent: item.pointCost });
        setSelectedRedeemItem(null);
        setSuccessData({ item, fanInput });

        // Background refresh to ensure consistency (optional but good)
        loadFanData();
      } else {
        toast.error(result.error || "Redemption failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleView = (item, specificRedemption) => {
    // If specific redemption passed (from My Redemptions), use that directly
    if (specificRedemption) {
      setSuccessData({
        item,
        fanInput: specificRedemption.fanInput,
        creatorResponse: specificRedemption.creatorResponse,
        status: specificRedemption.status,
        rejectionReason: specificRedemption.rejectionReason
      });
      return;
    }

    // Fallback: Find cached redemption status from generic map
    const statusData = redemptionStatuses[item._id];

    if (statusData) {
      setSuccessData({
        item,
        fanInput: statusData.fanInput,
        creatorResponse: statusData.creatorResponse,
        status: statusData.status,
        rejectionReason: statusData.rejectionReason
      });
    } else {
      // Fallback for file/text if no status tracked
      setSuccessData({ item, fanInput: null });
    }
  };

  return (
    <div className="w-full max-w-5xl mt-4 p-4">
      {/* CREATOR INFO BUTTON */}
      {isOwner && (
        <div className="mb-6">
          <button
            onClick={() => setInfoExpanded(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-4 hover:border-primary/40 transition-all text-white font-bold"
          >
            <span className="text-lg">💡</span>
            How to earn using Vault Items
          </button>
        </div>
      )}

      {/* INFO MODAL */}
      {infoExpanded && (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1f] rounded-2xl w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="sticky top-0 bg-[#1a1a1f] p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">How to earn using Vault Items</h2>
              <button onClick={() => setInfoExpanded(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-white/80 space-y-4">
                <p>
                  Very soon, you'll be able to publish <span className="text-primary font-medium">paid Vault items</span> that cost FamPoints.
                  Fans will contribute to you to earn those points, and you'll finally have a clean and powerful way to monetize your real supporters.
                </p>
                <p>
                  But for the next 4 weeks (during beta), the smartest thing you can do is simple:
                  <span className="text-yellow-400 font-bold ml-1">Grow your Sygil audience first.</span>
                </p>
                <p className="text-white/60">
                  Fans follow you here for one reason: They don't want to miss out on your free drops.
                  Free items are limited, they're first-come-first-serve, and they disappear fast — so fans keep checking your Sygil page.
                  That's how they get used to visiting your Sygil, and later that same audience becomes your biggest earning base.
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xl font-bold text-white mb-4">3 Steps to Grow Fast</h4>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                      <div>
                        <h5 className="text-white font-bold mb-1">Create a Free Vault Item</h5>
                        <p className="text-white/60 text-sm">
                          Offer something small but meaningful — a message, shoutout, Q&A, or a limited digital reward.
                          Fans claim free drops instantly because supply is limited.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                      <div>
                        <h5 className="text-white font-bold mb-1">Tell Your Fans to Claim Before It's Gone</h5>
                        <p className="text-white/60 text-sm">
                          Share your Sygil link on Instagram / YouTube / Snapchat.
                          Make it clear: "Only limited spots. First come, first served."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                      <div>
                        <h5 className="text-white font-bold mb-1">Build a Fanbase That's Ready for Future Paid Rewards</h5>
                        <p className="text-white/60 text-sm">
                          Every fan who follows you gets FamPoints and becomes part of your inner circle.
                          When paid Vault items go live, this warmed-up audience will support you immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setInfoExpanded(false); setShowAddModal(true); }}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> Create Your First Vault Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER CONTROLS (Creator Only) */}
      {isOwner && (
        <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('items')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${viewMode === 'items' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              My Vault
            </button>
            <button
              onClick={() => setViewMode('requests')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${viewMode === 'requests' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
            >
              Requests
            </button>
          </div>

          {viewMode === 'items' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/10"
            >
              <FaPlus /> Add Item
            </button>
          )}
        </div>
      )}

      {/* FamPoints Balance is already shown in the header - removed duplicate box */}

      {/* CONTENT AREA */}
      {viewMode === 'requests' && isOwner ? (
        <VaultRequests creatorUsername={currentUser.username} />
      ) : (
        <>
          {loading ? (
            // Skeleton Loading Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#1a1a1f] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="p-4 pt-8 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg" />
                      <div className="h-5 bg-white/10 rounded w-20" />
                    </div>
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-full mb-1" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                  <div className="px-4 py-2 border-b border-white/5">
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                  <div className="p-4">
                    <div className="h-10 bg-white/10 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {vaultItems.length === 0 ? (
                <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10">
                  <FaGem className="text-5xl text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Vault Empty</h3>
                  <p className="text-white/50">{isOwner ? "Add your first reward item!" : "This creator hasn't added any rewards yet."}</p>
                  {isOwner && (
                    <button onClick={() => setShowAddModal(true)} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">
                      Create Reward
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vaultItems.map(item => (
                    <VaultItemCard
                      key={item._id}
                      item={item}
                      userPoints={userPoints}
                      isOwner={isOwner}
                      isRedeemed={redeemedItems.includes(item._id)}
                      userRedemptionCount={redemptionStatuses[item._id]?.count || 0}
                      status={redemptionStatuses[item._id]?.status}
                      onRedeem={(itm) => {
                        if (!session) {
                          window.dispatchEvent(new CustomEvent('open-auth-modal'));
                          return;
                        }
                        if (userPoints < itm.pointCost) { toast.error(`Need ${itm.pointCost - userPoints} more points`); return; }
                        setSelectedRedeemItem(itm);
                      }}
                      onEdit={(itm) => {
                        setEditItem(itm);
                      }}
                      onView={handleView}
                    />
                  ))}
                </div>
              )}

              {/* MY REDEMPTIONS SECTION */}
              {!isOwner && (
                <div className="mt-12 border-t border-white/10 pt-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaShoppingBag className="text-primary" /> My Redemptions
                  </h3>

                  {redemptionsLoading ? (
                    // Skeleton Loading for Redemptions
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-[#1a1a1f] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                          <div className="p-4 pt-8 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white/10 rounded-lg" />
                              <div className="h-5 bg-green-500/20 rounded w-16" />
                            </div>
                            <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-white/5 rounded w-full" />
                          </div>
                          <div className="px-4 py-2 border-b border-white/5">
                            <div className="h-3 bg-white/5 rounded w-1/3" />
                          </div>
                          <div className="p-4">
                            <div className="h-10 bg-white/10 rounded-xl w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : myRedemptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myRedemptions.map(r => (
                        r.vaultItemId ? (
                          <VaultItemCard
                            key={r._id}
                            item={r.vaultItemId}
                            isOwner={false}
                            isRedeemed={true}
                            status={r.status}
                            onView={() => handleView(r.vaultItemId, r)}
                            onRedeem={() => { }}
                            isRedemptionCard={true}
                          />
                        ) : null
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-center py-6">No redemptions yet. Unlock a reward above!</p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* MODALS */}
      {
        showAddModal && (
          <AddVaultItemModal
            onClose={() => setShowAddModal(false)}
            onSuccess={(newItem) => {
              setVaultItems(prev => [newItem, ...prev]);
            }}
          />
        )
      }

      {
        selectedRedeemItem && (
          <RedeemVaultModal
            item={selectedRedeemItem}
            userPoints={userPoints}
            onClose={() => setSelectedRedeemItem(null)}
            onRedeemSuccess={handleRedeemSuccess}
          />
        )
      }

      {
        successData && (
          <VaultSuccessModal
            item={successData.item}
            fanInput={successData.fanInput}
            status={successData.status}
            creatorResponse={successData.creatorResponse}
            rejectionReason={successData.rejectionReason}
            onClose={() => setSuccessData(null)}
          />
        )
      }

      {
        editItem && (
          <EditVaultItemModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSuccess={(updatedItem) => {
              setVaultItems(prev => prev.map(i => i._id === updatedItem._id ? updatedItem : i));
            }}
            onDelete={(deletedId) => {
              setVaultItems(prev => prev.filter(i => i._id !== deletedId));
            }}
          />
        )
      }

    </div >
  );
};

export default VaultSection;
