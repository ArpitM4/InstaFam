"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

const BannerPickerModal = ({ onClose, onUpload, onSelectUnsplash, isUploading }) => {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'unsplash'
    const [searchQuery, setSearchQuery] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    // Featured categories for quick selection
    const categories = ['nature', 'abstract', 'minimal', 'gradient', 'space', 'city'];

    // Load featured images on mount
    useEffect(() => {
        if (activeTab === 'unsplash' && images.length === 0) {
            searchUnsplash('abstract backgrounds');
        }
    }, [activeTab]);

    const searchUnsplash = async (query) => {
        if (!UNSPLASH_ACCESS_KEY) {
            console.warn('Unsplash API key not configured');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
                {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                }
            );
            const data = await res.json();
            setImages(data.results || []);
        } catch (error) {
            console.error('Unsplash search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            searchUnsplash(searchQuery);
        }
    };

    const handleSelectImage = (image) => {
        setSelectedImage(image);
    };

    const handleConfirmSelection = async () => {
        if (selectedImage) {
            // Trigger download endpoint as per Unsplash API guidelines
            // This must be called when user chooses to use the image
            try {
                await fetch(selectedImage.links.download_location, {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                });
            } catch (error) {
                console.error('Failed to trigger Unsplash download:', error);
            }

            // Use the raw URL with custom parameters for high quality banner
            const highQualityUrl = `${selectedImage.urls.raw}&w=2560&q=85&auto=format&fit=crop`;

            // UTM parameters as required by Unsplash API guidelines
            const utmParams = '?utm_source=sygil&utm_medium=referral';

            onSelectUnsplash(highQualityUrl, {
                photographer: selectedImage.user.name,
                // Link to photographer's profile (not the photo) with UTM params
                photographerUrl: `${selectedImage.user.links.html}${utmParams}`,
                // Link to Unsplash with UTM params
                unsplashUrl: `https://unsplash.com${utmParams}`
            });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1f] rounded-2xl w-full max-w-3xl border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-white">Change Banner</h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white text-xl">
                        <FaTimes />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'upload'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FaUpload className="inline mr-2" />
                        Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('unsplash')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'unsplash'
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <svg className="inline w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
                        </svg>
                        Unsplash
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'upload' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className={`w-full max-w-md p-8 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
                                        <p className="text-white font-medium">Uploading...</p>
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="text-4xl text-white/40 mx-auto mb-4" />
                                        <p className="text-white font-medium mb-2">Click to upload an image</p>
                                        <p className="text-white/50 text-sm">Recommended: 1500 x 500 pixels</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'unsplash' && (
                        <div>
                            {!UNSPLASH_ACCESS_KEY ? (
                                <div className="text-center py-12">
                                    <p className="text-white/60 mb-2">Unsplash integration not configured</p>
                                    <p className="text-white/40 text-sm">Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your .env.local</p>
                                </div>
                            ) : (
                                <>
                                    {/* Search */}
                                    <form onSubmit={handleSearch} className="mb-4">
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search for images..."
                                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </form>

                                    {/* Quick Categories */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setSearchQuery(cat);
                                                    searchUnsplash(cat);
                                                }}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/70 hover:text-white transition-colors capitalize"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Image Grid */}
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <FaSpinner className="animate-spin text-2xl text-primary mr-2" />
                                            <span className="text-white/60">Loading images...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {images.map((image) => (
                                                <div
                                                    key={image.id}
                                                    onClick={() => handleSelectImage(image)}
                                                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group transition-all ${selectedImage?.id === image.id
                                                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1a1a1f]'
                                                        : 'hover:opacity-90'
                                                        }`}
                                                >
                                                    <Image
                                                        src={image.urls.small}
                                                        alt={image.alt_description || 'Unsplash image'}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                    {selectedImage?.id === image.id && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                Selected
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-white text-xs truncate">
                                                            by {image.user.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {images.length === 0 && !loading && (
                                        <p className="text-center text-white/50 py-8">
                                            No images found. Try a different search.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Only show when image selected in Unsplash tab */}
                {activeTab === 'unsplash' && selectedImage && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#1a1a1f]">
                        <p className="text-white/60 text-sm">
                            Photo by <span className="text-white">{selectedImage.user.name}</span> on Unsplash
                        </p>
                        <button
                            onClick={handleConfirmSelection}
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Use this image
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerPickerModal;
