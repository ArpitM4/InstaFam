"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { fetchCreatorVaultItems, redeemVaultItem, fetchRedeemedItems, fetchFanRedemptions } from '@/actions/vaultActions';
import { useUser } from '@/context/UserContext';
import { emitPaymentSuccess } from '@/utils/eventBus';
import { FaGem, FaPlus, FaList } from 'react-icons/fa';

// Components
import VaultItemCard from './vault/VaultItemCard';
import VaultRequests from './vault/VaultRequests';
import AddVaultItemModal from './vault/AddVaultItemModal';
import RedeemVaultModal from './vault/RedeemVaultModal';

const VaultSection = ({ currentUser, initialItems, isOwner }) => {
  const { data: session } = useSession();
  const { updatePoints } = useUser();

  // State
  const [vaultItems, setVaultItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [redemptionStatuses, setRedemptionStatuses] = useState({});

  // Modals / View State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRedeemItem, setSelectedRedeemItem] = useState(null); // Item to redeem
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'requests'

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
      if (currentUser?._id) {
        const res = await fetch(`/api/points?creatorId=${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setUserPoints(data.points || 0);
        }
      }
      if (currentUser?.username) {
        const redeemedRes = await fetchRedeemedItems(currentUser.username);
        if (redeemedRes.success) setRedeemedItems(redeemedRes.redeemedItems || []);

        const redemptionsRes = await fetchFanRedemptions(currentUser.username);
        if (redemptionsRes.success) {
          const statusMap = {};
          redemptionsRes.redemptions.forEach(r => {
            statusMap[r.vaultItemId._id] = { status: r.status, fanInput: r.fanInput, creatorResponse: r.creatorResponse };
          });
          setRedemptionStatuses(statusMap);
        }
      }
    } catch (error) {
      console.error('Error loading fan data:', error);
    }
  };

  const handleRedeemSuccess = async (item, fanInput) => {
    try {
      const result = await redeemVaultItem(item._id, currentUser.username, fanInput);
      if (result.success) {
        toast.success("Redeemed successfully!");
        setUserPoints(prev => prev - item.pointCost);
        setRedeemedItems(prev => [...prev, item._id]);
        setRedemptionStatuses(prev => ({
          ...prev,
          [item._id]: { status: 'Pending', fanInput } // Optimistic update
        }));

        if (updatePoints) updatePoints();
        emitPaymentSuccess({ pointsSpent: item.pointCost });

        setSelectedRedeemItem(null); // Close modal

        // If it's a file, we could show download immediately, but user can just click 'Unlocked'
        if (item.type === 'file' || item.type === 'text') {
          // Reload fan data to ensure we get true status/urls if any
          loadFanData();
        }
      } else {
        toast.error(result.error || "Redemption failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-5xl mt-4 p-4">
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
              {/* Could add badge count here if we fetched pending count */}
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

      {/* HEADER (Public View) */}
      {!isOwner && (
        <div className="text-center mb-6">
          <p className="text-text/60 mb-4">Exclusive digital content available for Fam Points</p>
          {session && (
            <div className="bg-gradient-primary-soft text-primary px-4 py-2 rounded-xl inline-block border border-primary/20">
              Your Fam Points: {userPoints}
            </div>
          )}
        </div>
      )}

      {/* CONTENT AREA */}
      {viewMode === 'requests' && isOwner ? (
        <VaultRequests creatorUsername={currentUser.username} />
      ) : (
        <>
          {loading ? (
            <div className="text-center p-8"><div className="animate-spin h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : vaultItems.length === 0 ? (
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
                  isOwner={isOwner}
                  isRedeemed={redeemedItems.includes(item._id)}
                  status={redemptionStatuses[item._id]?.status}
                  onRedeem={(itm) => {
                    if (!session) { toast.error("Please login first"); return; }
                    if (userPoints < itm.pointCost) { toast.error(`Need ${itm.pointCost - userPoints} more points`); return; }
                    setSelectedRedeemItem(itm);
                  }}
                  onEdit={() => toast.info("Editing coming soon!")}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {showAddModal && (
        <AddVaultItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newItem) => {
            setVaultItems(prev => [newItem, ...prev]);
          }}
        />
      )}

      {selectedRedeemItem && (
        <RedeemVaultModal
          item={selectedRedeemItem}
          userPoints={userPoints}
          onClose={() => setSelectedRedeemItem(null)}
          onRedeemSuccess={handleRedeemSuccess}
        />
      )}

    </div>
  );
};

export default VaultSection;
