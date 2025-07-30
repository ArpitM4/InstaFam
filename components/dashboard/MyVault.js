"use client";

import { useState, useEffect } from "react";
import { fetchMyVaultItems, addVaultItem, deleteVaultItem, fetchVaultHistory } from "@/actions/vaultActions";
import { toast } from 'react-toastify';

const MyVault = () => {
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultHistoryItems, setVaultHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState('active');
  const [newVaultItem, setNewVaultItem] = useState({
    title: '',
    description: '',
    pointCost: '',
    fileUrl: '',
    fileType: 'image',
    perkType: 'DigitalFile',
    requiresFanInput: false
  });
  const [uploadMethod, setUploadMethod] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadVaultItems();
  }, []);

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    
    let perkType = 'DigitalFile';
    let fileType = newVaultItem.fileType;
    
    if (method === 'none') {
      perkType = 'Recognition';
      fileType = 'text-reward';
    }
    
    setNewVaultItem(prev => ({
      ...prev,
      perkType,
      fileType,
      requiresFanInput: method === 'none'
    }));
  };

  const loadVaultItems = async () => {
    try {
      setVaultLoading(true);
      const result = await fetchMyVaultItems();
      if (result.success) {
        setVaultItems(result.items);
      }
    } catch (error) {
      console.error('Error loading vault items:', error);
    } finally {
      setVaultLoading(false);
    }
  };

  const loadVaultHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await fetchVaultHistory();
      if (result.success) {
        setVaultHistoryItems(result.items);
      }
    } catch (error) {
      console.error('Error loading vault history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVaultItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVaultItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddVaultItem = async (e) => {
    e.preventDefault();
    
    if (!newVaultItem.title || !newVaultItem.description || !newVaultItem.pointCost) {
      toast.error('Please fill in all required fields');
      return;
    }

    let finalFileUrl = newVaultItem.fileUrl;
    let finalFileType = newVaultItem.fileType;

    try {
      setVaultLoading(true);

      if (uploadMethod === 'upload' && selectedFile) {
        // Handle file upload logic here if needed
        // For now, we'll use the existing file URL approach
      }

      const result = await addVaultItem({
        ...newVaultItem,
        fileUrl: finalFileUrl,
        fileType: finalFileType
      });

      if (result.success) {
        toast.success('Vault item added successfully!');
        setNewVaultItem({
          title: '',
          description: '',
          pointCost: '',
          fileUrl: '',
          fileType: 'image',
          perkType: 'DigitalFile',
          requiresFanInput: false
        });
        setSelectedFile(null);
        setUploadMethod('upload');
        await loadVaultItems();
      } else {
        toast.error(result.error || 'Failed to add vault item');
      }
    } catch (error) {
      toast.error('Error adding vault item');
      console.error(error);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleDeleteVaultItem = async (itemId) => {
    if (!confirm('Are you sure you want to expire this vault item? It will be moved to history.')) {
      return;
    }

    try {
      const result = await deleteVaultItem(itemId);
      if (result.success) {
        toast.success('Vault item expired and moved to history');
        await loadVaultItems();
      } else {
        toast.error(result.error || 'Failed to expire vault item');
      }
    } catch (error) {
      toast.error('Error expiring vault item');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-text/20 pb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">My Vault</h1>
        <p className="text-text/70">Manage exclusive content for your fans to unlock with Fam Points</p>
      </div>

      {/* Add New Vault Item Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4">Add New Vault Item</h3>
        <form onSubmit={handleAddVaultItem} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-text/80 font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={newVaultItem.title}
                onChange={handleVaultItemChange}
                className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Exclusive Wallpaper Pack"
                maxLength="100"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-text/80 font-medium">Point Cost *</label>
              <input
                type="number"
                name="pointCost"
                value={newVaultItem.pointCost}
                onChange={handleVaultItemChange}
                className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                placeholder="500"
                min="1"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-text/80 font-medium">Description *</label>
            <textarea
              name="description"
              value={newVaultItem.description}
              onChange={handleVaultItemChange}
              className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
              placeholder={uploadMethod === 'none' 
                ? "Describe the reward/perk fans will receive (e.g., 'Your name will be featured in my next video credits')" 
                : "Describe what fans will get when they unlock this item..."
              }
              rows="3"
              maxLength="500"
              required
            />
          </div>

          {/* Content Source Selection */}
          <div className="mb-4">
            <label className="block mb-3 text-text/80 font-medium">Content Source</label>
            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="upload"
                  checked={uploadMethod === 'upload'}
                  onChange={() => handleUploadMethodChange('upload')}
                  className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                />
                <span className="text-text/80">📁 Upload File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={() => handleUploadMethodChange('url')}
                  className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                />
                <span className="text-text/80">🔗 Link from URL</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="none"
                  checked={uploadMethod === 'none'}
                  onChange={() => handleUploadMethodChange('none')}
                  className="w-4 h-4 text-primary bg-text border-text/30 focus:ring-primary focus:ring-2"
                />
                <span className="text-text/80">⭐ Text-Based Reward</span>
              </label>
            </div>

            {/* Upload Method Content */}
            {uploadMethod === 'upload' ? (
              <div>
                <label className="block mb-2 text-text/80 font-medium">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="w-full text-sm text-text/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-text hover:file:bg-primary/80 file:cursor-pointer cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-primary/10 rounded-md text-sm">
                    <span className="text-primary font-medium">Selected: </span>
                    <span className="text-text/70">{selectedFile.name}</span>
                    <span className="text-text/50 ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            ) : uploadMethod === 'url' ? (
              <div>
                <label className="block mb-2 text-text/80 font-medium">File URL</label>
                <input
                  type="url"
                  name="fileUrl"
                  value={newVaultItem.fileUrl}
                  onChange={handleVaultItemChange}
                  className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
            ) : (
              <div className="p-4 bg-primary/10 rounded-md border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">⭐</span>
                  <span className="font-medium text-primary">Text-Based Reward</span>
                </div>
                <p className="text-text/70 text-sm mb-3">
                  Perfect for recognition, influence, or access rewards that don't require file attachments.
                </p>
                
                <div>
                  <label className="block mb-2 text-text/80 font-medium">Reward Type</label>
                  <select
                    name="perkType"
                    value={newVaultItem.perkType}
                    onChange={handleVaultItemChange}
                    className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Recognition">🏆 Recognition</option>
                    <option value="Influence">🗳️ Influence</option>
                    <option value="AccessLink">🔗 Access Link</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {uploadMethod !== 'none' && (
            <div>
              <label className="block mb-2 text-text/80 font-medium">File Type</label>
              <select
                name="fileType"
                value={newVaultItem.fileType}
                onChange={handleVaultItemChange}
                className="w-full p-3 rounded-md bg-text text-background border border-text/20 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </div>
          )}

          {uploadMethod === 'none' && (
            <div className="p-4 bg-text/5 border border-text/10 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresFanInput"
                  checked={newVaultItem.requiresFanInput}
                  onChange={handleVaultItemChange}
                  className="mt-1 w-4 h-4 text-primary bg-text border-text/30 rounded focus:ring-primary focus:ring-2"
                />
                <div>
                  <span className="text-text/80 font-medium">This perk requires input from the fan</span>
                  <p className="text-text/60 text-sm mt-1">
                    Check this if fans need to provide information (like their name for credits, question for Q&A, etc.)
                  </p>
                </div>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={vaultLoading}
            className={`px-6 py-3 rounded-md text-text font-medium transition ${
              vaultLoading
                ? "bg-text/30 cursor-not-allowed"
                : "bg-primary hover:bg-primary/80"
            }`}
          >
            {vaultLoading ? "Adding..." : "Add to Vault"}
          </button>
        </form>
      </section>

      {/* Vault Management Section */}
      <section className="bg-text/5 border border-text/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">Your Vault Management</h3>
          
          <div className="flex bg-text/10 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveVaultTab('active');
                loadVaultItems();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeVaultTab === 'active'
                  ? 'bg-primary text-text shadow-sm'
                  : 'text-text/70 hover:text-text hover:bg-text/5'
              }`}
            >
              Active Items ({vaultItems.length})
            </button>
            <button
              onClick={() => {
                setActiveVaultTab('history');
                loadVaultHistory();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeVaultTab === 'history'
                  ? 'bg-primary text-text shadow-sm'
                  : 'text-text/70 hover:text-text hover:bg-text/5'
              }`}
            >
              Vault History ({vaultHistoryItems.length})
            </button>
          </div>
        </div>

        {/* Active Items */}
        {activeVaultTab === 'active' && (
          <>
            {vaultLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p className="text-text/60">Loading active vault items...</p>
              </div>
            ) : vaultItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🗃️</div>
                <p className="text-text/60">No active vault items yet. Add your first exclusive content above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaultItems.map((item) => (
                  <div key={item._id} className="bg-background/50 border border-text/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-lg truncate flex-1 mr-2">{item.title}</h4>
                      <button
                        onClick={() => handleDeleteVaultItem(item._id)}
                        className="text-orange-500 hover:text-orange-400 text-sm px-2 py-1 rounded"
                        title="Expire item (move to history)"
                      >
                        ⏰
                      </button>
                    </div>
                    
                    <p className="text-text/70 text-sm line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded">
                        {item.pointCost} points
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-text/60">
                          {item.fileType.toUpperCase()}
                        </span>
                        {item.requiresFanInput && (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs" title="Requires fan input">
                            📝
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-text/60 flex justify-between">
                      <span>{item.unlockCount} unlocks</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History Items */}
        {activeVaultTab === 'history' && (
          <>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p className="text-text/60">Loading vault history...</p>
              </div>
            ) : vaultHistoryItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-text/60">No expired vault items yet. Items you expire will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaultHistoryItems.map((item) => (
                  <div key={item._id} className="bg-background/30 border border-text/10 rounded-lg p-4 space-y-3 opacity-75">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-lg truncate flex-1 mr-2">{item.title}</h4>
                      <span className="text-red-400 text-sm px-2 py-1 rounded" title="Expired">
                        ❌
                      </span>
                    </div>
                    
                    <p className="text-text/70 text-sm line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-text/20 text-text/60 px-2 py-1 rounded">
                        {item.pointCost} points
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-text/60">
                          {item.fileType.toUpperCase()}
                        </span>
                        {item.requiresFanInput && (
                          <span className="bg-text/20 text-text/60 px-2 py-1 rounded text-xs" title="Required fan input">
                            📝
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-text/60 flex justify-between">
                      <span>{item.unlockCount} total unlocks</span>
                      <div className="text-right">
                        <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                        <div>Expired: {item.expiredAt ? new Date(item.expiredAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MyVault;
