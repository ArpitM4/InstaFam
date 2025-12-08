"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import Image from 'next/image';

const LinksSection = ({ currentUser }) => {
  const { data: session } = useSession();
  const [socials, setSocials] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showFavouriteModal, setShowFavouriteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states for adding new items
  const [socialForm, setSocialForm] = useState({ platform: '', username: '', link: '' });
  const [favouriteForm, setFavouriteForm] = useState({ name: '', link: '', image: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if the current user is the owner of this page
  const isOwner = session?.user?.name === currentUser?.username;

  // Fetch socials and favourites on component mount
  useEffect(() => {
    if (currentUser?.username) {
      fetchLinks();
    }
  }, [currentUser?.username]);

  // Fetch links from the API
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/links?username=${currentUser.username}`);
      const data = await response.json();

      if (response.ok) {
        setSocials(data.socials || []);
        setFavourites(data.favourites || []);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Copy creator page link to clipboard
  const handleCopyLink = () => {
    const pageUrl = `${window.location.origin}/${currentUser.username}`;
    navigator.clipboard.writeText(pageUrl).then(() => {
      toast.success('Link copied to clipboard!');
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Add a new social link
  const handleAddSocial = async (e) => {
    e.preventDefault();

    if (!socialForm.platform || !socialForm.username || !socialForm.link) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social',
          ...socialForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSocials(data.socials);
        setSocialForm({ platform: '', username: '', link: '' });
        setShowSocialModal(false);
        toast.success('Social link added!');
      } else {
        toast.error(data.error || 'Failed to add social');
      }
    } catch (error) {
      console.error('Error adding social:', error);
      toast.error('Failed to add social');
    }
  };

  // Add a new favourite product
  const handleAddFavourite = async (e) => {
    e.preventDefault();

    if (!favouriteForm.name || !favouriteForm.link) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'favourite',
          ...favouriteForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFavourites(data.favourites);
        setFavouriteForm({ name: '', link: '', image: '' });
        setShowFavouriteModal(false);
        toast.success('Favourite added!');
      } else {
        toast.error(data.error || 'Failed to add favourite');
      }
    } catch (error) {
      console.error('Error adding favourite:', error);
      toast.error('Failed to add favourite');
    }
  };

  // Handle image upload for favourites
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'favourite');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && (data.url || data.secure_url)) {
        setFavouriteForm({ ...favouriteForm, image: data.url || data.secure_url });
        toast.success('Image uploaded!');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete a social or favourite
  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      const response = await fetch(`/api/links?type=${type}&id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSocials(data.socials);
        setFavourites(data.favourites);
        toast.success('Deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mt-8 px-4">
      {/* Share Button - Positioned at top right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowShareModal(true)}
          className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:scale-105 border-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Page
        </button>
      </div>

      {/* Socials Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
          Socials
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display existing social cards */}
          {socials.map((social) => {
            const platformData = detectPlatform(social.link, social.platform);
            return (
              <FlipCard
                key={social._id}
                frontContent={
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <div className="w-12 h-12 mb-2 flex items-center justify-center relative">
                      <Image
                        src={platformData.logo}
                        alt={platformData.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="font-medium text-text text-xs text-center">{platformData.name}</p>
                  </div>
                }
                backContent={
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium text-sm text-center break-all"
                    >
                      {social.username}
                    </a>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(social._id, 'social');
                        }}
                        className="mt-2 text-red-500 hover:text-red-600 text-xs"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                }
              />
            );
          })}

          {/* Add button - only visible to owner */}
          {isOwner && (
            <button
              onClick={() => setShowSocialModal(true)}
              className="aspect-square border-2 border-dashed border-white/20 rounded-xl hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center group" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}
            >
              <FaPlus className="text-3xl text-text/40 group-hover:text-primary transition-colors" />
              <p className="text-text/60 text-xs mt-2 group-hover:text-primary transition-colors">Add Social</p>
            </button>
          )}
        </div>
      </div>

      {/* Favourites Section */}
      <div>
        <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
          <span className="text-3xl">⭐</span>
          Favourites/ Affiliates
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display existing favourite cards */}
          {favourites.map((fav) => (
            <FlipCard
              key={fav._id}
              frontContent={
                <div className="flex flex-col items-center justify-center h-full overflow-hidden relative">
                  {fav.image ? (
                    <Image
                      src={fav.image}
                      alt={fav.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="font-medium text-text text-sm text-center line-clamp-2">{fav.name}</p>
                    </div>
                  )}
                </div>
              }
              backContent={
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <p className="font-medium text-text text-sm text-center mb-2 line-clamp-2">{fav.name}</p>
                  <a
                    href={fav.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium text-xs text-center px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Visit Link
                  </a>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(fav._id, 'favourite');
                      }}
                      className="mt-2 text-red-500 hover:text-red-600 text-xs"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              }
            />
          ))}

          {/* Add button - only visible to owner */}
          {isOwner && (
            <button
              onClick={() => setShowFavouriteModal(true)}
              className="aspect-square border-2 border-dashed border-white/20 rounded-xl hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center group" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}
            >
              <FaPlus className="text-3xl text-text/40 group-hover:text-primary transition-colors" />
              <p className="text-text/60 text-xs mt-2 group-hover:text-primary transition-colors">Add Favourite</p>
            </button>
          )}
        </div>
      </div>

      {/* Empty state if no links */}
      {!isOwner && socials.length === 0 && favourites.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text/60">No links added yet</p>
        </div>
      )}

      {/* Modal for adding social */}
      {showSocialModal && (
        <Modal onClose={() => setShowSocialModal(false)}>
          <h3 className="text-xl font-bold text-text mb-4">Add Social Link</h3>
          <form onSubmit={handleAddSocial} className="space-y-4">
            <input
              type="text"
              placeholder="Platform Name (e.g., Instagram, Twitter)"
              value={socialForm.platform}
              onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
              className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10"
            />
            <input
              type="text"
              placeholder="Username (e.g., @yourname)"
              value={socialForm.username}
              onChange={(e) => setSocialForm({ ...socialForm, username: e.target.value })}
              className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10"
            />
            <input
              type="url"
              placeholder="Full Link (e.g., https://instagram.com/yourname)"
              value={socialForm.link}
              onChange={(e) => setSocialForm({ ...socialForm, link: e.target.value })}
              className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="flex-1 px-4 py-2 bg-text/10 text-text rounded-lg hover:bg-text/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)}>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">Share {currentUser.username || currentUser.name}'s Page</h3>
            <p className="text-text/60 mb-6">Copy the link below to share</p>

            <div className="bg-dropdown-hover border border-text/10 rounded-lg p-4 mb-4">
              <p className="text-text font-mono text-sm break-all">
                {typeof window !== 'undefined' && `${window.location.origin}/${currentUser.username}`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-text/10 text-text rounded-lg hover:bg-text/20 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal for adding favourite */}
      {showFavouriteModal && (
        <Modal onClose={() => setShowFavouriteModal(false)}>
          <h3 className="text-xl font-bold text-text mb-4">Add Favourite Product</h3>
          <form onSubmit={handleAddFavourite} className="space-y-4">
            <input
              type="text"
              placeholder="Product/Affiliate Name"
              value={favouriteForm.name}
              onChange={(e) => setFavouriteForm({ ...favouriteForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10"
            />
            <input
              type="url"
              placeholder="Affiliate/Product Link"
              value={favouriteForm.link}
              onChange={(e) => setFavouriteForm({ ...favouriteForm, link: e.target.value })}
              className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10"
            />

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Product Image (Optional)</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 bg-background text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-text/10 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Uploading...</span>
                  </div>
                )}
                {favouriteForm.image && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-text/10">
                    <Image
                      src={favouriteForm.image}
                      alt="Preview"
                      fill
                      sizes="100%"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFavouriteForm({ ...favouriteForm, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFavouriteModal(false)}
                className="flex-1 px-4 py-2 bg-text/10 text-text rounded-lg hover:bg-text/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Flip Card Component with hover animation
const FlipCard = ({ frontContent, backContent }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flip-card aspect-square cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of the card */}
        <div className="flip-card-front rounded-xl border border-white/10 shadow-lg transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(8px)' }}>
          {frontContent}
        </div>

        {/* Back of the card */}
        <div className="flip-card-back rounded-xl border border-primary/30 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.15) 0%, rgba(99,102,241,0.15) 100%)' }}>
          {backContent}
        </div>
      </div>

      {/* CSS for flip animation - injected inline */}
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-dropdown-hover rounded-2xl border border-text/10 shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
        {children}
      </div>
    </div>
  );
};

// Social Media Platform Data - Contains logos and brand colors
const socialPlatforms = {
  instagram: {
    name: 'Instagram',
    logo: 'https://cdn.simpleicons.org/instagram/E4405F',
    color: '#E4405F',
    pattern: /instagram\.com|instagr\.am/i
  },
  twitter: {
    name: 'Twitter',
    logo: 'https://cdn.simpleicons.org/twitter/1DA1F2',
    color: '#1DA1F2',
    pattern: /twitter\.com|t\.co/i
  },
  x: {
    name: 'X',
    logo: 'https://cdn.simpleicons.org/x/000000',
    color: '#000000',
    pattern: /x\.com/i
  },
  youtube: {
    name: 'YouTube',
    logo: 'https://cdn.simpleicons.org/youtube/FF0000',
    color: '#FF0000',
    pattern: /youtube\.com|youtu\.be/i
  },
  tiktok: {
    name: 'TikTok',
    logo: 'https://cdn.simpleicons.org/tiktok/000000',
    color: '#000000',
    pattern: /tiktok\.com/i
  },
  facebook: {
    name: 'Facebook',
    logo: 'https://cdn.simpleicons.org/facebook/1877F2',
    color: '#1877F2',
    pattern: /facebook\.com|fb\.com/i
  },
  linkedin: {
    name: 'LinkedIn',
    logo: 'https://cdn.simpleicons.org/linkedin/0A66C2',
    color: '#0A66C2',
    pattern: /linkedin\.com/i
  },
  snapchat: {
    name: 'Snapchat',
    logo: 'https://cdn.simpleicons.org/snapchat/FFFC00',
    color: '#FFFC00',
    pattern: /snapchat\.com/i
  },
  discord: {
    name: 'Discord',
    logo: 'https://cdn.simpleicons.org/discord/5865F2',
    color: '#5865F2',
    pattern: /discord\.gg|discord\.com/i
  },
  twitch: {
    name: 'Twitch',
    logo: 'https://cdn.simpleicons.org/twitch/9146FF',
    color: '#9146FF',
    pattern: /twitch\.tv/i
  },
  reddit: {
    name: 'Reddit',
    logo: 'https://cdn.simpleicons.org/reddit/FF4500',
    color: '#FF4500',
    pattern: /reddit\.com/i
  },
  pinterest: {
    name: 'Pinterest',
    logo: 'https://cdn.simpleicons.org/pinterest/E60023',
    color: '#E60023',
    pattern: /pinterest\.com/i
  },
  github: {
    name: 'GitHub',
    logo: 'https://cdn.simpleicons.org/github/181717',
    color: '#181717',
    pattern: /github\.com/i
  },
  telegram: {
    name: 'Telegram',
    logo: 'https://cdn.simpleicons.org/telegram/26A5E4',
    color: '#26A5E4',
    pattern: /t\.me|telegram\.org/i
  },
  whatsapp: {
    name: 'WhatsApp',
    logo: 'https://cdn.simpleicons.org/whatsapp/25D366',
    color: '#25D366',
    pattern: /whatsapp\.com|wa\.me/i
  },
  spotify: {
    name: 'Spotify',
    logo: 'https://cdn.simpleicons.org/spotify/1DB954',
    color: '#1DB954',
    pattern: /spotify\.com/i
  },
  medium: {
    name: 'Medium',
    logo: 'https://cdn.simpleicons.org/medium/000000',
    color: '#000000',
    pattern: /medium\.com/i
  },
  threads: {
    name: 'Threads',
    logo: 'https://cdn.simpleicons.org/threads/000000',
    color: '#000000',
    pattern: /threads\.net/i
  }
};

// Auto-detect platform from URL and platform name
const detectPlatform = (url, platformName) => {
  // Normalize the platform name for better matching
  const normalizedName = platformName?.toLowerCase().replace(/\s+/g, '') || '';

  // First priority: Try to match platform name with fuzzy matching
  if (normalizedName) {
    for (const [key, platform] of Object.entries(socialPlatforms)) {
      const platformNameLower = platform.name.toLowerCase().replace(/\s+/g, '');

      // Exact match (case-insensitive, space-insensitive)
      if (normalizedName === platformNameLower || normalizedName === key) {
        return platform;
      }

      // Contains match - handles typos and partial matches
      if (normalizedName.includes(platformNameLower) || platformNameLower.includes(normalizedName)) {
        return platform;
      }

      // Check for common variations and typos
      // Handle "snap" for snapchat, "insta" for instagram, etc.
      if (normalizedName.length >= 4) {
        if (platformNameLower.startsWith(normalizedName) || normalizedName.startsWith(platformNameLower)) {
          return platform;
        }
      }
    }
  }

  // Second priority: Try to detect from URL
  for (const [key, platform] of Object.entries(socialPlatforms)) {
    if (platform.pattern.test(url)) {
      return platform;
    }
  }

  // Default fallback
  return {
    name: platformName || 'Link',
    logo: 'https://cdn.simpleicons.org/link/666666',
    color: '#666666'
  };
};

export default LinksSection;
