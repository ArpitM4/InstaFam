// Client-side vault operations
export const addVaultItem = async (vaultItem) => {
  try {
    const response = await fetch('/api/vault/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vaultItem),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding vault item:', error);
    return { success: false, error: 'Failed to add vault item' };
  }
};

export const fetchMyVaultItems = async () => {
  try {
    const response = await fetch('/api/vault/add');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching vault items:', error);
    return { success: false, error: 'Failed to fetch vault items' };
  }
};

export const fetchCreatorVaultItems = async (creatorUsername) => {
  try {
    const response = await fetch(`/api/vault/${creatorUsername}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching creator vault items:', error);
    return { success: false, error: 'Failed to fetch creator vault items' };
  }
};

export const redeemVaultItem = async (itemId, creatorUsername, fanInput = null) => {
  try {
    const response = await fetch('/api/vault/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, creatorUsername, fanInput }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error redeeming vault item:', error);
    return { success: false, error: 'Failed to redeem vault item' };
  }
};

export const deleteVaultItem = async (itemId) => {
  try {
    const response = await fetch(`/api/vault/delete/${itemId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error expiring vault item:', error);
    return { success: false, error: 'Failed to expire vault item' };
  }
};

export const fetchVaultHistory = async () => {
  try {
    const response = await fetch('/api/vault/history');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching vault history:', error);
    return { success: false, error: 'Failed to fetch vault history' };
  }
};

export const fetchPendingRedemptions = async () => {
  try {
    const response = await fetch('/api/redemptions/pending');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching pending redemptions:', error);
    return { success: false, error: 'Failed to fetch pending redemptions' };
  }
};

export const fulfillRedemption = async (redemptionId) => {
  try {
    const response = await fetch(`/api/redemptions/${redemptionId}/fulfill`, {
      method: 'PUT',
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fulfilling redemption:', error);
    return { success: false, error: 'Failed to fulfill redemption' };
  }
};

export const fetchFanRedemptions = async (creatorUsername) => {
  try {
    const response = await fetch(`/api/redemptions/fan/${creatorUsername}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching fan redemptions:', error);
    return { success: false, error: 'Failed to fetch fan redemptions' };
  }
};

export const fetchRedeemedItems = async (creatorUsername) => {
  try {
    const response = await fetch(`/api/vault/redeemed/${creatorUsername}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching redeemed items:', error);
    return { success: false, error: 'Failed to fetch redeemed items' };
  }
};

export const fetchMyRedemptions = async () => {
  try {
    const response = await fetch('/api/redemptions/my-redemptions');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching my redemptions:', error);
    return { success: false, error: 'Failed to fetch my redemptions' };
  }
};

export const submitCreatorAnswer = async (redemptionId, creatorResponse) => {
  try {
    const response = await fetch(`/api/redemptions/${redemptionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorResponse }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting creator answer:', error);
    return { success: false, error: 'Failed to submit answer' };
  }
};

export const fetchFulfilledRedemptions = async () => {
  try {
    const response = await fetch('/api/redemptions/fulfilled');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching fulfilled redemptions:', error);
    return { success: false, error: 'Failed to fetch fulfilled redemptions' };
  }
};
