"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import ShareModal from "./ShareModal";

const LinksSection = ({ currentUser, onSocialsChange }) => {
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
                // Notify parent of social change for onboarding
                if (onSocialsChange) onSocialsChange(data.socials);
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
                // Notify parent of social change for onboarding
                if (onSocialsChange) onSocialsChange(data.socials);
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
            <div className="w-full max-w-5xl mt-8 px-4">
                {/* Skeleton for Share Button area */}
                <div className="flex justify-end mb-4">
                    <div className="w-32 h-10 bg-white/5 rounded-xl animate-pulse"></div>
                </div>

                {/* Skeleton for Socials Section */}
                <div className="mb-12">
                    <div className="w-24 h-8 bg-white/10 rounded-lg animate-pulse mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse border border-white/10"></div>
                        ))}
                    </div>
                </div>

                {/* Skeleton for Favourites Section */}
                <div>
                    <div className="w-48 h-8 bg-white/10 rounded-lg animate-pulse mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse border border-white/10"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mt-8 px-4">
            {/* Share Button - Positioned at top right - Only visible to owner */}
            {isOwner && (
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
            )}

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
                                link={social.link}
                                frontContent={
                                    <div className="flex flex-col items-center justify-center h-full p-2 relative">
                                        {isOwner && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(social._id, 'social');
                                                }}
                                                className="absolute top-2 right-2 text-white/30 hover:text-red-500 z-20 sm:hidden transition-colors"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        )}
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
                            link={fav.link}
                            frontContent={
                                <div className="flex flex-col items-center justify-center h-full overflow-hidden relative">
                                    {isOwner && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(fav._id, 'favourite');
                                            }}
                                            className="absolute top-2 right-2 bg-black/40 rounded-full p-1 text-white/50 hover:text-red-500 z-20 sm:hidden transition-colors"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    )}
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
                    {/* Header with gradient accent */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text">Add Social Link</h3>
                                <p className="text-sm text-text/50">Connect your social media profile</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAddSocial} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Platform Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Instagram, Twitter, YouTube"
                                value={socialForm.platform}
                                onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                                className="w-full px-4 py-3 text-text rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-text/30 transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Username</label>
                            <input
                                type="text"
                                placeholder="@yourhandle"
                                value={socialForm.username}
                                onChange={(e) => setSocialForm({ ...socialForm, username: e.target.value })}
                                className="w-full px-4 py-3 text-text rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-text/30 transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Profile URL</label>
                            <input
                                type="url"
                                placeholder="https://instagram.com/yourhandle"
                                value={socialForm.link}
                                onChange={(e) => setSocialForm({ ...socialForm, link: e.target.value })}
                                className="w-full px-4 py-3 text-text rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-text/30 transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowSocialModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 text-text rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 btn-gradient text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <FaPlus className="text-sm" />
                                Add Link
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                username={currentUser.username}
                title="Share Your Sygil Page"
            />

            {/* Modal for adding favourite */}
            {showFavouriteModal && (
                <Modal onClose={() => setShowFavouriteModal(false)}>
                    {/* Header with gradient accent */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                                <span className="text-xl">⭐</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text">Add Favourite / Affiliate</h3>
                                <p className="text-sm text-text/50">Showcase products you love</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAddFavourite} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g., My Favourite Camera"
                                value={favouriteForm.name}
                                onChange={(e) => setFavouriteForm({ ...favouriteForm, name: e.target.value })}
                                className="w-full px-4 py-3 text-text rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-text/30 transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Product / Affiliate Link</label>
                            <input
                                type="url"
                                placeholder="https://example.com/product"
                                value={favouriteForm.link}
                                onChange={(e) => setFavouriteForm({ ...favouriteForm, link: e.target.value })}
                                className="w-full px-4 py-3 text-text rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-text/30 transition-all duration-200"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}
                            />
                        </div>

                        {/* Image Upload Section - Redesigned */}
                        <div>
                            <label className="block text-sm font-medium text-text/80 mb-2">Product Image <span className="text-text/40">(Optional)</span></label>
                            {!favouriteForm.image ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-200">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadingImage ? (
                                            <>
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                                <p className="text-sm text-primary">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-text/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm text-text/50">Click to upload image</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
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
                                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500 transition-all duration-200 z-10"
                                    >
                                        <FaTimes className="text-sm" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowFavouriteModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 text-text rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploadingImage}
                                className="flex-1 px-4 py-3 btn-gradient text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPlus className="text-sm" />
                                Add Product
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// Flip Card Component with hover animation
const FlipCard = ({ frontContent, backContent, link }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardClick = (e) => {
        // Don't navigate if clicking on a button (like delete)
        if (e.target.closest('button')) {
            return;
        }
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            className="flip-card aspect-square cursor-pointer group"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={handleCardClick}
        >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Front of the card */}
                <div
                    className="flip-card-front rounded-xl border border-white/10 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:border-primary/30"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    {frontContent}
                </div>

                {/* Back of the card - matches front styling */}
                <div
                    className="flip-card-back rounded-xl border border-white/10 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:border-primary/30"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
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
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .flip-card:hover .flip-card-inner {
          transform: scale(1.03) rotateY(180deg);
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card:hover .flip-card-inner.flipped {
          transform: scale(1.03) rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
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



// Modal Component - Premium Design
const Modal = ({ children, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset'
                }}
            >
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-text/50 hover:bg-white/10 hover:text-text transition-all duration-200"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                    {children}
                </div>
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
