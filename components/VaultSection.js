// components/VaultSection.js
"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { fetchCreatorVaultItems, redeemVaultItem, fetchRedeemedItems, fetchFanRedemptions } from '@/actions/vaultActions';
import { fetchuser } from '@/actions/useractions';

const VaultSection = ({ currentUser }) => {
  const { data: session } = useSession();
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState({});
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState([]);
  const [redemptionStatuses, setRedemptionStatuses] = useState({});

  useEffect(() => {
    if (currentUser?.username) {
      loadVaultItems();
      if (session?.user?.name) {
        loadFanData();
      }
    }
  }, [currentUser, session]);

  const loadVaultItems = async () => {
    try {
      setLoading(true);
      const result = await fetchCreatorVaultItems(currentUser.username);
      if (result.success) {
        setVaultItems(result.items || []);
      }
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFanData = async () => {
    try {
      const user = await fetchuser(session.user.name);
      setUserPoints(user.points || 0);
      
      // Load redeemed items for this fan from this creator
      if (currentUser?.username) {
        const redeemedResult = await fetchRedeemedItems(currentUser.username);
        if (redeemedResult.success) {
          setRedeemedItems(redeemedResult.redeemedItems || []);
        }

        // Load detailed redemption statuses
        const redemptionsResult = await fetchFanRedemptions(currentUser.username);
        if (redemptionsResult.success) {
          const statusMap = {};
          redemptionsResult.redemptions.forEach(redemption => {
            statusMap[redemption.vaultItemId._id] = {
              status: redemption.status,
              redeemedAt: redemption.redeemedAt,
              fanInput: redemption.fanInput,
              fulfilledAt: redemption.fulfilledAt
            };
          });
          setRedemptionStatuses(statusMap);
        }
      }
    } catch (error) {
      console.error('Error loading fan data:', error);
    }
  };

  const handleRedeem = async (item) => {
    if (!session) {
      toast.error('Please login to redeem vault items');
      return;
    }

    if (userPoints < item.pointCost) {
      toast.error('Insufficient Fam Points!');
      return;
    }

    // Check if fan input is required
    if (item.requiresFanInput) {
      showInputModal(item);
      return;
    }

    // Proceed with direct redemption
    await processRedemption(item, null);
  };

  const showInputModal = (item) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    
    const getInputPlaceholder = (perkType) => {
      switch (perkType) {
        case 'Recognition':
          return 'Enter your name or message for the shout-out...';
        case 'Influence':
          return 'Submit your question or vote...';
        case 'AccessLink':
          return 'Provide any required details...';
        default:
          return 'Enter your input...';
      }
    };

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Input Required: ${item.title}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          ${item.description}
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Input:
          </label>
          <textarea 
            id="fanInput" 
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" 
            rows="3" 
            placeholder="${getInputPlaceholder(item.perkType)}"
            maxlength="1000"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1">
            <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              ${item.perkType}
            </span>
          </div>
        </div>
        <div class="flex gap-3">
          <button 
            onclick="this.closest('.fixed').remove()" 
            class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button 
            onclick="window.submitFanInput('${item._id}')" 
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Redeem (${item.pointCost} points)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add global function for form submission
    window.submitFanInput = async (itemId) => {
      const input = document.getElementById('fanInput').value.trim();
      if (!input) {
        toast.error('Please provide the required input');
        return;
      }
      
      modal.remove();
      await processRedemption(item, input);
      delete window.submitFanInput;
    };

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        delete window.submitFanInput;
      }
    });
  };

  const processRedemption = async (item, fanInput) => {
    try {
      setRedeeming(prev => ({ ...prev, [item._id]: true }));
      
      const result = await redeemVaultItem(item._id, currentUser.username, fanInput);
      
      if (result.success) {
        toast.success('Item redeemed successfully!');
        setUserPoints(prev => prev - item.pointCost);
        setRedeemedItems(prev => [...prev, item._id]);
        
        // Show appropriate modal based on file type
        if (item.fileType === 'text-reward') {
          showStatusModal(item, 'Pending');
        } else {
          showDownloadModal(item, result.downloadUrl || item.fileUrl);
        }
      } else {
        toast.error(result.error || 'Failed to redeem item');
      }
    } catch (error) {
      toast.error('Error redeeming item');
      console.error(error);
    } finally {
      setRedeeming(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const showStatusModal = (item, status) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    
    const statusInfo = {
      'Pending': {
        icon: '⏳',
        title: 'Request Submitted!',
        message: 'Your request has been sent to the creator. They will fulfill this perk soon.',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        textColor: 'text-yellow-800 dark:text-yellow-200'
      },
      'Fulfilled': {
        icon: '✅',
        title: 'Perk Fulfilled!',
        message: 'The creator has completed your requested perk.',
        bgColor: 'bg-green-100 dark:bg-green-900',
        textColor: 'text-green-800 dark:text-green-200'
      }
    };

    const info = statusInfo[status] || statusInfo['Pending'];

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4 text-center">
        <div class="flex items-center justify-center mb-4">
          <span class="text-3xl mr-2">${info.icon}</span>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">${info.title}</h3>
        </div>
        <h4 class="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">${item.title}</h4>
        <p class="text-gray-600 dark:text-gray-400 mb-4">${info.message}</p>
        
        <div class="mb-4">
          <span class="${info.bgColor} ${info.textColor} px-3 py-1 rounded-full text-sm font-medium">
            ${item.perkType} • ${status}
          </span>
        </div>
        
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          You can track the status of this and other redeemed items on your "My Fam Points" page.
        </p>
        
        <button 
          onclick="this.closest('.fixed').remove()" 
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Got it!
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 5000);
  };

  const showDownloadModal = (item, downloadUrl) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    
    if (item.fileType === 'text-reward') {
      // Special modal for text-based rewards
      modal.innerHTML = `
        <div class="bg-background p-6 rounded-lg max-w-md mx-4 text-center">
          <div class="flex items-center justify-center mb-4">
            <span class="text-3xl mr-2">⭐</span>
            <h3 class="text-xl font-bold text-text">Reward Unlocked!</h3>
          </div>
          <p class="mb-4 text-text/70">You've successfully unlocked:</p>
          <div class="bg-primary/20 p-4 rounded-lg mb-4">
            <h4 class="font-bold text-primary mb-2">${item.title}</h4>
            <p class="text-text/80 text-sm">${item.description}</p>
          </div>
          ${item.requiresFanInput ? 
            '<div class="bg-secondary/20 p-3 rounded-lg mb-4"><p class="text-xs text-secondary font-medium">📝 This reward requires your input! Please contact the creator to provide the necessary information.</p></div>' : 
            ''
          }
          <p class="text-xs text-text/60 mb-4">
            This is a text-based reward. Follow the instructions above or contact the creator for more details.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="block w-full bg-primary text-text px-4 py-2 rounded hover:bg-primary/80 transition">
            Got it!
          </button>
        </div>
      `;
    } else {
      // Regular file download modal
      modal.innerHTML = `
        <div class="bg-background p-6 rounded-lg max-w-md mx-4 text-center">
          <h3 class="text-xl font-bold mb-4 text-text">Content Unlocked!</h3>
          <p class="mb-4 text-text/70">You've successfully unlocked "${item.title}"</p>
          <div class="space-y-3">
            <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" 
               class="block bg-primary text-text px-4 py-2 rounded hover:bg-primary/80 transition">
              ${item.fileType === 'image' ? 'View Image' : 
                item.fileType === 'video' ? 'Watch Video' : 
                item.fileType === 'pdf' ? 'View PDF' : 
                item.fileType === 'audio' ? 'Listen Audio' : 'Download File'}
            </a>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    class="block w-full bg-text/10 text-text px-4 py-2 rounded hover:bg-text/20 transition">
              Close
            </button>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(modal);
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'audio': return '🎵';
      case 'document': return '📝';
      case 'text-reward': return '⭐';
      default: return '📁';
    }
  };

  const isItemRedeemed = (itemId) => {
    return redeemedItems.includes(itemId);
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mt-8 flex flex-col items-center justify-center text-center p-8">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mb-4"></div>
        <p className="text-text/60">Loading vault items...</p>
      </div>
    );
  }

  if (vaultItems.length === 0) {
    return (
      <div className="w-full max-w-5xl mt-8 flex flex-col items-center justify-center text-center p-8 text-text/60">
        <div className="text-6xl mb-4">🗃️</div>
        <h2 className="text-3xl font-bold text-secondary mb-4 uppercase tracking-wider">
          VAULT
        </h2>
        <p className="text-lg">
          {currentUser?.username || 'This creator'} hasn't added any exclusive content yet.
        </p>
        <p>Check back later for awesome digital goods!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mt-8 p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary mb-4 uppercase tracking-wider">
          🗃️ {currentUser?.username}'s VAULT
        </h2>
        <p className="text-text/70 mb-4">
          Exclusive digital content available for Fam Points
        </p>
        {session && (
          <div className="bg-primary/20 text-primary px-4 py-2 rounded-lg inline-block">
            💎 Your Fam Points: {userPoints}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaultItems.map((item) => {
          const isRedeemed = isItemRedeemed(item._id);
          const canAfford = userPoints >= item.pointCost;
          const isRedeeming = redeeming[item._id];

          return (
            <div key={item._id} className="bg-text/5 border border-text/10 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Item Header */}
              <div className="p-4 border-b border-text/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileTypeIcon(item.fileType)}</span>
                    {item.requiresFanInput && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                        Input Required
                      </span>
                    )}
                  </div>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-medium">
                    {item.pointCost} points
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1 text-text">{item.title}</h3>
                <p className="text-text/70 text-sm line-clamp-2">{item.description}</p>
              </div>

              {/* Item Content */}
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-text/60 mb-4">
                  <span>{item.fileType.toUpperCase()}</span>
                  <span>{item.unlockCount} unlocks</span>
                </div>

                {/* Action Button */}
                {!session ? (
                  <button
                    onClick={() => toast.info('Please login to redeem vault items')}
                    className="w-full bg-text/20 text-text/60 py-2 px-4 rounded hover:bg-text/30 transition cursor-pointer"
                  >
                    Login to Redeem
                  </button>
                ) : isRedeemed ? (
                  (() => {
                    const redemptionInfo = redemptionStatuses[item._id];
                    const isTextBasedReward = item.fileType === 'text-reward';
                    
                    if (!isTextBasedReward) {
                      // Digital files (upload/URL) show download button
                      return (
                        <button
                          onClick={() => showDownloadModal(item, item.fileUrl)}
                          className="w-full bg-green-500/20 text-green-400 py-2 px-4 rounded hover:bg-green-500/30 transition"
                        >
                          ✓ Download
                        </button>
                      );
                    } else {
                      // Text-based rewards (Recognition/Influence/AccessLink) show status
                      const status = redemptionInfo?.status || 'Pending';
                      const isPending = status === 'Pending';
                      
                      return (
                        <button
                          onClick={() => showStatusModal(item, status)}
                          className={`w-full py-2 px-4 rounded transition ${
                            isPending
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {isPending ? '⏳ Pending Fulfillment' : '✅ Fulfilled!'}
                        </button>
                      );
                    }
                  })()
                ) : !canAfford ? (
                  <button
                    className="w-full bg-red-500/20 text-red-400 py-2 px-4 rounded cursor-not-allowed"
                    disabled
                  >
                    Insufficient Points
                  </button>
                ) : (
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={isRedeeming}
                    className={`w-full py-2 px-4 rounded font-medium transition ${
                      isRedeeming
                        ? 'bg-primary/50 text-text/50 cursor-not-allowed'
                        : 'bg-primary text-text hover:bg-primary/80'
                    }`}
                  >
                    {isRedeeming ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin h-4 w-4 rounded-full border-2 border-text/50 border-t-transparent mr-2"></div>
                        Redeeming...
                      </span>
                    ) : (
                      `Redeem for ${item.pointCost} points`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {session && vaultItems.length > 0 && (
        <div className="mt-8 text-center p-4 bg-text/5 border border-text/10 rounded-lg">
          <p className="text-text/70 text-sm">
            💡 <strong>Tip:</strong> Support {currentUser?.username || 'this creator'} to earn more Fam Points and unlock exclusive content!
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultSection;
