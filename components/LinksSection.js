"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
    FaPlus, FaTimes, FaTrash, FaShoppingBag, FaLink, FaGlobe, FaPen, FaChevronDown,
    FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaLinkedin,
    FaSnapchat, FaDiscord, FaTwitch, FaReddit, FaPinterest, FaSpotify,
    FaGithub, FaBriefcase, FaEnvelope, FaLaptop, FaMobile, FaMusic,
    FaGamepad, FaCamera, FaHeart, FaStar, FaFire, FaCode, FaCoffee,
    FaPlane, FaCar, FaHome, FaBolt, FaCrown, FaGem, FaCircle, FaCopy,
    FaGripVertical, FaTh, FaList,
    // New icons for Other Links
    FaAddressCard, FaBlog, FaNewspaper, FaVideo, FaPodcast,
    FaStore, FaShoppingCart, FaTags, FaGift, FaTicketAlt, FaCreditCard, FaCoins, FaHandHoldingUsd,
    FaGraduationCap, FaBook, FaFileAlt, FaChalkboardTeacher,
    FaUsers, FaComments, FaPhone, FaCalendar,
    FaDownload, FaFileDownload, FaExternalLinkAlt, FaShareAlt
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Image from 'next/image';
import ShareModal from "./ShareModal";

// @dnd-kit imports for drag and drop reordering
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- Helpers ---

const optimizeCloudinaryImage = (src, width = 640) => {
    if (!src) return '';
    if (!src.includes('res.cloudinary.com')) return src;
    const [baseUrl, finalPath] = src.split('/upload/');
    if (!finalPath) return src;
    return `${baseUrl}/upload/f_auto,q_auto,w_${width}/${finalPath}`;
};

// Convert Hex to RGBA for preview
const hexToRgba = (hex, alpha = 1) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
};

// Parse color string to { hex, opacity }
const parseColor = (colorStr) => {
    if (!colorStr) return { hex: '#1a1a1a', opacity: 100 };
    if (colorStr.startsWith('#')) return { hex: colorStr, opacity: 100 };
    if (colorStr.startsWith('rgba')) {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            const a = match[4] ? parseFloat(match[4]) : 1;
            return { hex: `#${r}${g}${b}`, opacity: Math.round(a * 100) };
        }
    }
    return { hex: '#1a1a1a', opacity: 100 };
};


// Social Platforms Config
const socialPlatforms = {
    instagram: { name: 'Instagram', icon: <FaInstagram />, color: '#E4405F' },
    twitter: { name: 'X (Twitter)', icon: <FaXTwitter />, color: '#000000' },
    youtube: { name: 'YouTube', icon: <FaYoutube />, color: '#FF0000' },
    tiktok: { name: 'TikTok', icon: <FaTiktok />, color: '#000000' },
    facebook: { name: 'Facebook', icon: <FaFacebook />, color: '#1877F2' },
    linkedin: { name: 'LinkedIn', icon: <FaLinkedin />, color: '#0A66C2' },
    snapchat: { name: 'Snapchat', icon: <FaSnapchat />, color: '#FFFC00' },
    discord: { name: 'Discord', icon: <FaDiscord />, color: '#5865F2' },
    twitch: { name: 'Twitch', icon: <FaTwitch />, color: '#9146FF' },
    reddit: { name: 'Reddit', icon: <FaReddit />, color: '#FF4500' },
    pinterest: { name: 'Pinterest', icon: <FaPinterest />, color: '#E60023' },
    spotify: { name: 'Spotify', icon: <FaSpotify />, color: '#1DB954' },
    github: { name: 'GitHub', icon: <FaGithub />, color: '#181717' },
};

const iconMap = {
    // Core / Generic
    'globe': <FaGlobe />, 'link': <FaLink />, 'home': <FaHome />,
    'briefcase': <FaBriefcase />, 'address-card': <FaAddressCard />,

    // Content & Creation
    'blog': <FaBlog />, 'newspaper': <FaNewspaper />, 'video': <FaVideo />,
    'podcast': <FaPodcast />, 'camera': <FaCamera />, 'music': <FaMusic />,

    // Monetization / Business
    'store': <FaStore />, 'cart': <FaShoppingCart />, 'tags': <FaTags />,
    'gift': <FaGift />, 'ticket': <FaTicketAlt />, 'credit-card': <FaCreditCard />,
    'coins': <FaCoins />, 'donate': <FaHandHoldingUsd />,

    // Learning / Professional
    'graduation': <FaGraduationCap />, 'book': <FaBook />,
    'file': <FaFileAlt />, 'teacher': <FaChalkboardTeacher />,

    // Community / Communication
    'users': <FaUsers />, 'comments': <FaComments />, 'envelope': <FaEnvelope />,
    'phone': <FaPhone />, 'calendar': <FaCalendar />,

    // Download / External
    'download': <FaDownload />, 'file-download': <FaFileDownload />,
    'external': <FaExternalLinkAlt />, 'share': <FaShareAlt />,

    // Creator-style / Highlight
    'star': <FaStar />, 'fire': <FaFire />, 'bolt': <FaBolt />,
    'heart': <FaHeart />, 'crown': <FaCrown />, 'gem': <FaGem />,

    // Extra - Tech & Lifestyle
    'code': <FaCode />, 'laptop': <FaLaptop />, 'mobile': <FaMobile />,
    'gamepad': <FaGamepad />, 'coffee': <FaCoffee />, 'plane': <FaPlane />, 'car': <FaCar />
};

// Vibrant Colors (Not shaded)
const vibrantColors = [
    '#1a1a1a', // Black
    '#FFFFFF', // White
    '#e20b00ff', // Red
    '#ff6600ff', // Orange
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#34C759', // Green
    '#00C7BE', // Teal
    '#32ADE6', // Blue
    '#1a73e8', // Light Blue
    '#0400ffff', // Dark Blue
    '#4800ffff', // Purple
    '#AF52DE', // Purple
    '#FF0090', // Hot Pink (New)
    '#A2845E', // Brown
    '#8E8E93',  // Gray

];


// --- Components ---

const CustomSelect = ({ value, options, onChange, placeholder = "Select" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:bg-white/10 transition-colors focus:border-primary focus:outline-none"
            >
                <span className={selectedOption ? "text-white" : "text-white/40"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`text-xs text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${value === option.value ? 'bg-primary/20 text-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                            {option.icon && <span className="text-lg">{option.icon}</span>}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ColorControl = ({ hex, opacity, onHexChange, onOpacityChange }) => (
    <div className="space-y-2">
        <label className="text-xs text-white/60 block">Card Background & Opacity</label>
        <div className="flex gap-1.5 flex-wrap">
            {vibrantColors.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onHexChange(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 relative flex items-center justify-center ${hex === color ? 'border-primary scale-110' : 'border-white/10 hover:border-white/30'}`}
                    style={{ backgroundColor: color }}
                >
                    {hex === color && <div className={`w-1.5 h-1.5 rounded-full ${color === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />}
                </button>
            ))}
        </div>
        <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Opacity</span>
                <span>{opacity}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {/* Preview Strip */}
            <div
                className="w-full h-6 rounded-lg mt-2 border border-white/10 flex items-center justify-center text-[10px] text-white"
                style={{ backgroundColor: hexToRgba(hex, opacity / 100) }}
            >
                Card Preview
            </div>
        </div>
    </div>
);

const IconPicker = ({ selected, onSelect }) => (
    <div className="grid grid-cols-8 gap-1.5 p-2 bg-white/5 rounded-xl border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
        {Object.entries(iconMap).map(([name, icon]) => (
            <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={`aspect-square flex items-center justify-center rounded-md border transition-all hover:scale-105 ${selected === name ? 'bg-primary border-primary text-black' : 'bg-transparent border-transparent text-white/50 hover:bg-white/10 hover:text-white'}`}
                title={name}
            >
                <span className="text-base">{icon}</span>
            </button>
        ))}
    </div>
);

const LinkCard = ({ data, isOwner, onEdit, onDelete }) => {
    const isSocial = data.type === 'social';
    const platform = isSocial ? socialPlatforms[data.platform?.toLowerCase()] || {} : {};
    const icon = isSocial ? platform.icon : (iconMap[data.icon] || <FaLink />);
    const bgColor = data.color || '#1a1a1a';

    const handleClick = (e) => {
        if (isOwner) {
            e.preventDefault();
            onEdit(data);
        } else {
            window.open(data.link, '_blank');
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`relative group p-5 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 aspect-[1.2/1] shadow-lg hover:shadow-primary/5`}
            style={{ backgroundColor: bgColor }}
        >
            {isOwner && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'social'); }}
                    className="absolute top-2 right-2 p-2 text-white/20 hover:text-red-500 transition-colors z-20"
                >
                    <FaTrash size={12} />
                </button>
            )}

            <div className="text-4xl text-white drop-shadow-lg">
                {icon}
            </div>

            <div className="text-center w-full px-2">
                <h3 className="font-bold text-white text-base truncate drop-shadow-md">
                    {isSocial ? platform.name || data.platform : data.title}
                </h3>
                {((isSocial && data.username) || (!isSocial && data.description)) && (
                    <p className="text-white/60 text-xs truncate mt-1">
                        {isSocial ? data.username : data.description}
                    </p>
                )}
            </div>
        </div>
    );
};

// List-style Link Card (Linktree-style)
const ListLinkCard = ({ data, isOwner, onEdit, onDelete }) => {
    const isSocial = data.type === 'social';
    const platform = isSocial ? socialPlatforms[data.platform?.toLowerCase()] || {} : {};
    const icon = isSocial ? platform.icon : (iconMap[data.icon] || <FaLink />);
    const bgColor = data.color || '#1a1a1a';

    const handleClick = (e) => {
        if (isOwner) {
            e.preventDefault();
            onEdit(data);
        } else {
            window.open(data.link, '_blank');
        }
    };

    return (
        <div
            onClick={handleClick}
            className="relative group w-full rounded-xl border border-white/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer overflow-hidden px-4 py-3"
            style={{ backgroundColor: bgColor }}
        >
            {/* Icon - Left positioned */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white">
                {icon}
            </div>

            {/* Content - Centered */}
            <div className="text-center px-10">
                <h3 className="font-semibold text-white text-sm">
                    {isSocial ? platform.name || data.platform : data.title}
                </h3>
                {((isSocial && data.username) || (!isSocial && data.description)) && (
                    <p className="text-white/60 text-xs mt-0.5">
                        {isSocial ? data.username : data.description}
                    </p>
                )}
            </div>

            {/* Delete Button (owner only) */}
            {isOwner && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'social'); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-red-500 transition-colors z-20 opacity-0 group-hover:opacity-100"
                >
                    <FaTrash size={12} />
                </button>
            )}
        </div>
    );
};

const ProductCard = ({ data, isOwner, onEdit, onDelete }) => {
    const pos = data.imagePosition || { scale: 1, x: 50, y: 50 };
    const bgColor = data.color || '#1a1a1a';

    return (
        <div
            onClick={() => isOwner ? onEdit(data) : window.open(data.link, '_blank')}
            className={`group relative rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col h-full`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Image Section - Matches Modal Preview (aspect-[3/4]) */}
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-3xl">
                {data.image ? (
                    <div
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        style={{
                            backgroundImage: `url(${optimizeCloudinaryImage(data.image, 500)})`,
                            backgroundSize: `${pos.scale * 100}%`,
                            backgroundPosition: `${pos.x}% ${pos.y}%`,
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                ) : (<div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>)}

                {isOwner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'favourite'); }}
                        className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white/70 hover:text-red-500 hover:bg-black transition-all z-20 backdrop-blur-sm"
                    >
                        <FaTrash size={12} />
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="px-3 pb-3 pt-2 flex flex-col flex-1">
                <div className="flex-1 mb-1">
                    {/* Title and Price Row */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-white text-base leading-tight line-clamp-2" title={data.name}>
                            {data.name}
                        </h3>
                        {data.price && (
                            <div className="shrink-0 flex items-center gap-1 text-white font-bold text-base">
                                <span className="text-[10px] text-white/60 uppercase tracking-wider translate-y-[1px]">{data.currency || 'INR'}</span>
                                <span>{data.price}</span>
                            </div>
                        )}
                    </div>

                    {data.description && (
                        <p className="text-white/60 text-[10px] leading-relaxed line-clamp-3">{data.description}</p>
                    )}
                </div>

                <div className="mt-auto space-y-2">
                    {data.couponCode && (
                        <div
                            className="bg-black/20 border border-dashed border-white/20 rounded-lg px-2 py-1.5 flex items-center justify-between group/coupon hover:bg-black/30 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(data.couponCode);
                                toast.success('Coupon copied!');
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/60 uppercase tracking-wider font-bold">Discount Code</span>
                                <span className="text-xs font-mono font-bold text-white tracking-wide">{data.couponCode}</span>
                            </div>
                            <FaCopy className="text-white/60 opacity-50 group-hover/coupon:opacity-100 transition-opacity" size={12} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sortable Wrappers for Drag & Drop ---

const SortableLinkCard = ({ id, data, isOwner, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    const isSocial = data.type === 'social';
    const platform = isSocial ? socialPlatforms[data.platform?.toLowerCase()] || {} : {};
    const icon = isSocial ? platform.icon : (iconMap[data.icon] || <FaLink />);
    const bgColor = data.color || '#1a1a1a';

    const handleClick = (e) => {
        if (isOwner) {
            e.preventDefault();
            onEdit(data);
        } else {
            window.open(data.link, '_blank');
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle - Visible only to owner */}
            {isOwner && (
                <button
                    {...attributes}
                    {...listeners}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white/50 hover:text-white cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FaGripVertical size={12} />
                </button>
            )}

            <div
                onClick={handleClick}
                className={`relative p-5 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 aspect-[1.2/1] shadow-lg hover:shadow-primary/5 ${isOwner ? 'pl-8' : ''}`}
                style={{ backgroundColor: bgColor }}
            >
                {isOwner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'social'); }}
                        className="absolute top-2 right-2 p-2 text-white/20 hover:text-red-500 transition-colors z-20"
                    >
                        <FaTrash size={12} />
                    </button>
                )}

                <div className="text-4xl text-white drop-shadow-lg">
                    {icon}
                </div>

                <div className="text-center w-full px-2">
                    <h3 className="font-bold text-white text-base truncate drop-shadow-md">
                        {isSocial ? platform.name || data.platform : data.title}
                    </h3>
                    {((isSocial && data.username) || (!isSocial && data.description)) && (
                        <p className="text-white/60 text-xs truncate mt-1">
                            {isSocial ? data.username : data.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sortable List Link Card (for drag-and-drop in list view)
const SortableListLinkCard = ({ id, data, isOwner, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    const isSocial = data.type === 'social';
    const platform = isSocial ? socialPlatforms[data.platform?.toLowerCase()] || {} : {};
    const icon = isSocial ? platform.icon : (iconMap[data.icon] || <FaLink />);
    const bgColor = data.color || '#1a1a1a';

    const handleClick = (e) => {
        if (isOwner) {
            e.preventDefault();
            onEdit(data);
        } else {
            window.open(data.link, '_blank');
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div
                onClick={handleClick}
                className="relative w-full rounded-xl border border-white/10 transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden px-4 py-3"
                style={{ backgroundColor: bgColor }}
            >
                {/* Drag Handle - Left side */}
                {isOwner && (
                    <button
                        {...attributes}
                        {...listeners}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white cursor-grab active:cursor-grabbing transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaGripVertical size={12} />
                    </button>
                )}

                {/* Icon - Left positioned (after drag handle) */}
                <div className={`absolute top-1/2 -translate-y-1/2 text-xl text-white ${isOwner ? 'left-10' : 'left-4'}`}>
                    {icon}
                </div>

                {/* Content - Centered */}
                <div className="text-center px-14">
                    <h3 className="font-semibold text-white text-sm">
                        {isSocial ? platform.name || data.platform : data.title}
                    </h3>
                    {((isSocial && data.username) || (!isSocial && data.description)) && (
                        <p className="text-white/60 text-xs mt-0.5">
                            {isSocial ? data.username : data.description}
                        </p>
                    )}
                </div>

                {/* Delete Button - Right side */}
                {isOwner && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'social'); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-red-500 transition-colors z-20 opacity-0 group-hover:opacity-100"
                    >
                        <FaTrash size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

const SortableProductCard = ({ id, data, isOwner, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    const pos = data.imagePosition || { scale: 1, x: 50, y: 50 };
    const bgColor = data.color || '#1a1a1a';

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle - Visible only to owner */}
            {isOwner && (
                <button
                    {...attributes}
                    {...listeners}
                    className="absolute left-1 top-4 z-30 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white/40 hover:text-white cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FaGripVertical size={12} />
                </button>
            )}

            <div
                onClick={() => isOwner ? onEdit(data) : window.open(data.link, '_blank')}
                className={`relative rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col h-full`}
                style={{ backgroundColor: bgColor }}
            >
                {/* Image Section */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-3xl">
                    {data.image ? (
                        <div
                            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                            style={{
                                backgroundImage: `url(${optimizeCloudinaryImage(data.image, 500)})`,
                                backgroundSize: `${pos.scale * 100}%`,
                                backgroundPosition: `${pos.x}% ${pos.y}%`,
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    ) : (<div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>)}

                    {isOwner && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(data._id, 'favourite'); }}
                            className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white/70 hover:text-red-500 hover:bg-black transition-all z-20 backdrop-blur-sm"
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="px-3 pb-3 pt-2 flex flex-col flex-1">
                    <div className="flex-1 mb-1">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-bold text-white text-base leading-tight line-clamp-2" title={data.name}>
                                {data.name}
                            </h3>
                            {data.price && (
                                <div className="shrink-0 flex items-center gap-1 text-white font-bold text-base">
                                    <span className="text-[10px] text-white/60 uppercase tracking-wider translate-y-[1px]">{data.currency || 'INR'}</span>
                                    <span>{data.price}</span>
                                </div>
                            )}
                        </div>
                        {data.description && (
                            <p className="text-white/60 text-[10px] leading-relaxed line-clamp-3">{data.description}</p>
                        )}
                    </div>

                    <div className="mt-auto space-y-2">
                        {data.couponCode && (
                            <div
                                className="bg-black/20 border border-dashed border-white/20 rounded-lg px-2 py-1.5 flex items-center justify-between group/coupon hover:bg-black/30 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(data.couponCode);
                                    toast.success('Coupon copied!');
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-white/60 uppercase tracking-wider font-bold">Discount Code</span>
                                    <span className="text-xs font-mono font-bold text-white tracking-wide">{data.couponCode}</span>
                                </div>
                                <FaCopy className="text-white/60 opacity-50 group-hover/coupon:opacity-100 transition-opacity" size={12} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main LinksSection ---

const LinksSection = ({ currentUser, onSocialsChange }) => {
    const { data: session } = useSession();
    const [socials, setSocials] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [linksViewMode, setLinksViewMode] = useState('card'); // 'card' or 'list'

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form States
    const [linkForm, setLinkForm] = useState({
        mode: 'add', id: null, tab: 'social',
        platform: '', username: '', title: '', description: '',
        icon: 'link', url: '',
        colorHex: '#1a1a1a', opacity: 100
    });

    const [productForm, setProductForm] = useState({
        mode: 'add', id: null,
        name: '', description: '', url: '', image: '', price: '', currency: 'INR',
        couponCode: '',
        colorHex: '#1a1a1a', opacity: 100
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    const isOwner = session?.user?.name === currentUser?.username;

    useEffect(() => {
        if (currentUser?.username) fetchLinks();
    }, [currentUser?.username]);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/links?username=${currentUser.username}`);
            const data = await response.json();
            if (response.ok) {
                setSocials(data.socials || []);
                setFavourites(data.favourites || []);
                setLinksViewMode(data.linksViewMode || 'card');
            }
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleViewMode = async (mode) => {
        setLinksViewMode(mode);
        try {
            await fetch('/api/links', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'viewMode', viewMode: mode })
            });
        } catch (error) {
            console.error('Error saving view mode:', error);
        }
    };

    // --- Actions ---

    const openAddLink = () => {
        setLinkForm({
            mode: 'add', id: null, tab: 'social',
            platform: '', username: '', title: '', description: '',
            icon: 'link', url: '',
            colorHex: '#1a1a1a', opacity: 100
        });
        setShowLinkModal(true);
    };

    const openEditLink = (data) => {
        const { hex, opacity } = parseColor(data.color);
        setLinkForm({
            mode: 'edit', id: data._id,
            tab: data.type === 'other' ? 'other' : 'social',
            platform: data.platform || '',
            username: data.username || '',
            title: data.title || '',
            description: data.description || '',
            icon: data.icon || 'link',
            url: data.link || '',
            colorHex: hex, opacity: opacity
        });
        setShowLinkModal(true);
    };

    // New State for Image Adjustment Modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);

    const openAddProduct = () => {
        setProductForm({
            mode: 'add', id: null,
            name: '', description: '', url: '', image: '', price: '', currency: 'INR',
            couponCode: '',
            imagePosition: { scale: 1, x: 50, y: 50 },
            colorHex: '#1a1a1a', opacity: 100
        });
        setShowProductModal(true);
    };

    const openEditProduct = (data) => {
        const { hex, opacity } = parseColor(data.color);
        setProductForm({
            mode: 'edit', id: data._id,
            name: data.name,
            description: data.description || '',
            url: data.link,
            image: data.image,
            price: data.price || '',
            currency: data.currency || 'INR',
            couponCode: data.couponCode || '',
            imagePosition: data.imagePosition || { scale: 1, x: 50, y: 50 },
            colorHex: hex, opacity: opacity
        });
        setShowProductModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const endpoint = '/api/links';
        const method = productForm.mode === 'add' ? 'POST' : 'PUT';

        const payload = {
            type: 'favourite',
            name: productForm.name,
            description: productForm.description,
            url: productForm.url,
            image: productForm.image,
            price: productForm.price,
            currency: productForm.currency,
            couponCode: productForm.couponCode,
            imagePosition: productForm.imagePosition,
            color: hexToRgba(productForm.colorHex, productForm.opacity / 100)
        };

        if (productForm.mode === 'edit') payload.id = productForm.id;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setFavourites(data.favourites);
                setShowProductModal(false);
                toast.success(productForm.mode === 'add' ? 'Product Added!' : 'Product Updated!');
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch (err) { toast.error('Something went wrong'); }
    };

    const handleSaveLink = async (e) => {
        e.preventDefault();
        const endpoint = '/api/links';
        const method = linkForm.mode === 'add' ? 'POST' : 'PUT';

        const payload = {
            type: 'social',
            linkType: linkForm.tab,
            url: linkForm.url,
            color: hexToRgba(linkForm.colorHex, linkForm.opacity / 100)
        };

        if (linkForm.mode === 'edit') payload.id = linkForm.id;

        if (linkForm.tab === 'social') {
            payload.platform = linkForm.platform;
            payload.username = linkForm.username;
        } else {
            payload.title = linkForm.title;
            payload.description = linkForm.description;
            payload.icon = linkForm.icon;
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setSocials(data.socials);
                setShowLinkModal(false);
                toast.success(linkForm.mode === 'add' ? 'Link Added!' : 'Link Updated!');
                if (onSocialsChange) onSocialsChange(data.socials);
            } else {
                toast.error(data.error || 'Failed');
            }
        } catch (err) { toast.error('Something went wrong'); }
    };

    const handleDelete = async (id, type) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/links?type=${type}&id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                if (type === 'social') {
                    setSocials(data.socials);
                    if (onSocialsChange) onSocialsChange(data.socials);
                } else setFavourites(data.favourites);
                toast.success('Deleted!');
            } else toast.error(data.error);
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'favourite');

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setProductForm(prev => ({ ...prev, image: data.secure_url }));
                toast.success('Image Uploaded');
            } else toast.error('Upload failed');
        } catch (err) { toast.error('Error uploading'); }
        finally { setUploadingImage(false); }
    };

    // --- Drag & Drop Reordering ---

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleReorder = async (type, orderedIds) => {
        try {
            const res = await fetch('/api/links', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, orderedIds })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to save order');
                // Refetch to restore original order
                fetchLinks();
            }
        } catch (err) {
            toast.error('Failed to save order');
            fetchLinks();
        }
    };

    const handleLinksDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = socials.findIndex(item => item._id === active.id);
        const newIndex = socials.findIndex(item => item._id === over.id);

        const newSocials = arrayMove(socials, oldIndex, newIndex);
        setSocials(newSocials);
        handleReorder('social', newSocials.map(item => item._id));
    };

    const handleProductsDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = favourites.findIndex(item => item._id === active.id);
        const newIndex = favourites.findIndex(item => item._id === over.id);

        const newFavourites = arrayMove(favourites, oldIndex, newIndex);
        setFavourites(newFavourites);
        handleReorder('favourite', newFavourites.map(item => item._id));
    };


    if (loading) return <div className="p-8 text-center text-white/50 animate-pulse">Loading Links...</div>;

    return (
        <div className="w-full max-w-5xl mt-8 px-4 pb-20">
            {/* ShareModal - rendered outside of button flow */}
            {isOwner && (
                <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} username={currentUser.username} title="Share Sygil" />
            )}

            {/* --- Links Section --- */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text flex items-center gap-2">Links</h2>

                    {/* Share Button + View Mode Toggle - Owner Only */}
                    {isOwner && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white text-sm rounded-lg border border-white/20 hover:border-white/50 bg-transparent transition-all outline-none"
                            >
                                <FaLink size={12} /> Share
                            </button>

                            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                <button
                                    onClick={() => toggleViewMode('card')}
                                    className={`p-2 rounded-md transition-all ${linksViewMode === 'card' ? 'bg-primary text-black' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                    title="Card View"
                                >
                                    <FaTh size={14} />
                                </button>
                                <button
                                    onClick={() => toggleViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${linksViewMode === 'list' ? 'bg-primary text-black' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                    title="List View"
                                >
                                    <FaList size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Card View */}
                {linksViewMode === 'card' && (
                    isOwner ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLinksDragEnd}>
                            <SortableContext items={socials.map(item => item._id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {socials.map(item => (
                                        <SortableLinkCard
                                            key={item._id}
                                            id={item._id}
                                            data={item}
                                            isOwner={isOwner}
                                            onEdit={openEditLink}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                    <button
                                        onClick={openAddLink}
                                        className="aspect-[1.2/1] rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-primary transition-all group outline-none"
                                    >
                                        <FaPlus className="text-2xl" />
                                        <span className="text-sm font-medium">Add Link</span>
                                    </button>
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {socials.map(item => (
                                <LinkCard
                                    key={item._id}
                                    data={item}
                                    isOwner={isOwner}
                                    onEdit={openEditLink}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* List View */}
                {linksViewMode === 'list' && (
                    isOwner ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLinksDragEnd}>
                            <SortableContext items={socials.map(item => item._id)} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-3">
                                    {socials.map(item => (
                                        <SortableListLinkCard
                                            key={item._id}
                                            id={item._id}
                                            data={item}
                                            isOwner={isOwner}
                                            onEdit={openEditLink}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                    <button
                                        onClick={openAddLink}
                                        className="w-full rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 py-4 text-white/40 hover:text-primary transition-all outline-none"
                                    >
                                        <FaPlus size={14} />
                                        <span className="text-sm font-medium">Add Link</span>
                                    </button>
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {socials.map(item => (
                                <ListLinkCard
                                    key={item._id}
                                    data={item}
                                    isOwner={isOwner}
                                    onEdit={openEditLink}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* --- Products Section --- */}
            <div>
                <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
                    My Favourite Products
                </h2>

                {isOwner ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductsDragEnd}>
                        <SortableContext items={favourites.map(item => item._id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {favourites.map(item => (
                                    <SortableProductCard
                                        key={item._id}
                                        id={item._id}
                                        data={item}
                                        isOwner={isOwner}
                                        onEdit={openEditProduct}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                <button
                                    onClick={openAddProduct}
                                    className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-primary transition-all group outline-none"
                                >
                                    <FaPlus className="text-3xl" />
                                    <span className="text-sm font-medium">Add Product</span>
                                </button>
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {favourites.map(item => (
                            <ProductCard
                                key={item._id}
                                data={item}
                                isOwner={isOwner}
                                onEdit={openEditProduct}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>


            {/* --- Link Modal --- */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 max-h-[90vh] flex flex-col">
                        <div className="p-4 pb-3 shrink-0 flex items-center justify-between border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">
                                {linkForm.mode === 'add' ? 'Add New Link' : 'Edit Link'}
                            </h3>
                            <button onClick={() => setShowLinkModal(false)} className="text-white/50 hover:text-white p-1"><FaTimes /></button>
                        </div>

                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                            {linkForm.mode === 'add' && (
                                <div className="flex gap-4 border-b border-white/10 mb-6">
                                    <button
                                        onClick={() => setLinkForm({ ...linkForm, tab: 'social' })}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${linkForm.tab === 'social' ? 'text-primary' : 'text-white/50 hover:text-white'}`}
                                    >
                                        Social Media
                                        {linkForm.tab === 'social' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
                                    </button>
                                    <button
                                        onClick={() => setLinkForm({ ...linkForm, tab: 'other' })}
                                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${linkForm.tab === 'other' ? 'text-primary' : 'text-white/50 hover:text-white'}`}
                                    >
                                        Other Links
                                        {linkForm.tab === 'other' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSaveLink} className="space-y-3">
                                {linkForm.tab === 'social' ? (
                                    <>
                                        <div>
                                            <label className="text-xs text-white/60 mb-1 block">Platform</label>
                                            <CustomSelect
                                                value={linkForm.platform}
                                                onChange={val => setLinkForm({ ...linkForm, platform: val })}
                                                options={Object.keys(socialPlatforms).map(key => ({
                                                    value: key,
                                                    label: socialPlatforms[key].name,
                                                    icon: socialPlatforms[key].icon
                                                }))}
                                                placeholder="Select Platform"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/60 mb-1 block">Username (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="@username"
                                                value={linkForm.username}
                                                onChange={e => setLinkForm({ ...linkForm, username: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-xs text-white/60 mb-1 block">Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. My Portfolio"
                                                value={linkForm.title}
                                                onChange={e => setLinkForm({ ...linkForm, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/60 mb-1 block">Description (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Short description"
                                                value={linkForm.description}
                                                onChange={e => setLinkForm({ ...linkForm, description: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-white/60 mb-1 block">Icon</label>
                                            <IconPicker
                                                selected={linkForm.icon}
                                                onSelect={icon => setLinkForm({ ...linkForm, icon })}
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Link URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={linkForm.url}
                                        onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Card Color</label>
                                    <ColorControl
                                        hex={linkForm.colorHex}
                                        opacity={linkForm.opacity}
                                        onHexChange={hex => setLinkForm({ ...linkForm, colorHex: hex })}
                                        onOpacityChange={op => setLinkForm({ ...linkForm, opacity: op })}
                                    />
                                </div>

                                <button type="submit" className="w-full btn-gradient py-2.5 rounded-xl font-semibold text-white text-sm">
                                    {linkForm.mode === 'add' ? 'Create Link' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Product Modal --- */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[90vh]">
                        {/* Header - Fixed & Sticky */}
                        <div className="p-6 pb-2 shrink-0 flex items-center justify-between border-b border-white/5 bg-[#0f0f0f] rounded-t-2xl z-10">
                            <h3 className="text-xl font-bold text-white">
                                {productForm.mode === 'add' ? 'Add Product' : 'Edit Product'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)} className="text-white/50 hover:text-white transition-colors p-2"><FaTimes /></button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="My Awesome Product"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Description (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Brief details about the product..."
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Product Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={productForm.url}
                                        onChange={e => setProductForm({ ...productForm, url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-white/60 mb-1 block">Price (Optional)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs text-white/60 mb-1 block">Currency</label>
                                        <CustomSelect
                                            value={productForm.currency}
                                            onChange={val => setProductForm({ ...productForm, currency: val })}
                                            options={[
                                                { value: 'INR', label: 'INR' },
                                                { value: 'USD', label: 'USD' },
                                                { value: 'EUR', label: 'EUR' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Coupon Code (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. SUMMER50"
                                            value={productForm.couponCode}
                                            onChange={e => setProductForm({ ...productForm, couponCode: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:border-primary focus:outline-none font-mono"
                                        />
                                        <FaCopy className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Product Image</label>
                                    {productForm.image ? (
                                        <div className="space-y-2">
                                            {/* Preview Image - Smaller & Centered */}
                                            <div className="relative w-32 aspect-[3/4] rounded-xl overflow-hidden bg-black border border-white/10 group mx-auto">
                                                {/* Preview with applied styles */}
                                                <div
                                                    className="w-full h-full transition-all duration-300"
                                                    style={{
                                                        backgroundImage: `url(${optimizeCloudinaryImage(productForm.image, 500)})`,
                                                        backgroundSize: `${productForm.imagePosition?.scale * 100}%`,
                                                        backgroundPosition: `${productForm.imagePosition?.x}% ${productForm.imagePosition?.y}%`,
                                                        backgroundRepeat: 'no-repeat'
                                                    }}
                                                />

                                                {/* Hover Actions */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAdjustModal(true)}
                                                        className="w-full bg-white/10 hover:bg-white text-white hover:text-black py-1 rounded text-[10px] font-bold transition-all border border-white/20"
                                                    >
                                                        Adjust
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProductForm({ ...productForm, image: '' })}
                                                        className="w-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-1 rounded text-[10px] font-bold transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-white/30 text-center">Hover to adjust or remove</p>
                                        </div>
                                    ) : (
                                        // ... Upload Input ...
                                        <label className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 cursor-pointer transition-all">
                                            {uploadingImage ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /> : (
                                                <>
                                                    <FaPen className="mb-2" />
                                                    <span className="text-xs">Upload Image</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                                        </label>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs text-white/60 mb-1 block">Card Color</label>
                                    <ColorControl
                                        hex={productForm.colorHex}
                                        opacity={productForm.opacity}
                                        onHexChange={hex => setProductForm({ ...productForm, colorHex: hex })}
                                        onOpacityChange={op => setProductForm({ ...productForm, opacity: op })}
                                    />
                                </div>

                                <button type="submit" className="w-full btn-gradient py-3 rounded-xl font-bold text-white mt-4" disabled={uploadingImage}>
                                    {productForm.mode === 'add' ? 'Create Product' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ... Adjust Modal Overlay ... */}
            {showAdjustModal && productForm.image && (
                <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-[#121212] w-full max-w-sm rounded-2xl border border-white/10 p-5 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Adjust Image</h3>

                        {/* Visual Preview - Compact */}
                        <div className="relative w-40 mx-auto aspect-[3/4] bg-black rounded-lg overflow-hidden border border-white/20 mb-5 shadow-inner">
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundImage: `url(${optimizeCloudinaryImage(productForm.image, 600)})`,
                                    backgroundSize: `${productForm.imagePosition?.scale * 100}%`,
                                    backgroundPosition: `${productForm.imagePosition?.x}% ${productForm.imagePosition?.y}%`,
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                            {/* Grid Overlay for assistance */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                                {[...Array(9)].map((_, i) => <div key={i} className="border border-white/30" />)}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-3 mb-5">
                            <div>
                                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                    <span>Zoom</span><span>{(productForm.imagePosition?.scale || 1).toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range" min="1" max="3" step="0.1"
                                    value={productForm.imagePosition?.scale || 1}
                                    onChange={e => setProductForm({
                                        ...productForm,
                                        imagePosition: { ...productForm.imagePosition, scale: parseFloat(e.target.value) }
                                    })}
                                    className="w-full h-1 bg-white/10 rounded-lg accent-primary appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                    <span>Horizontal Pan (X)</span><span>{productForm.imagePosition?.x || 50}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={productForm.imagePosition?.x || 50}
                                    onChange={e => setProductForm({
                                        ...productForm,
                                        imagePosition: { ...productForm.imagePosition, x: parseFloat(e.target.value) }
                                    })}
                                    className="w-full h-1 bg-white/10 rounded-lg accent-primary appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                    <span>Vertical Pan (Y)</span><span>{productForm.imagePosition?.y || 50}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={productForm.imagePosition?.y || 50}
                                    onChange={e => setProductForm({
                                        ...productForm,
                                        imagePosition: { ...productForm.imagePosition, y: parseFloat(e.target.value) }
                                    })}
                                    className="w-full h-1 bg-white/10 rounded-lg accent-primary appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between gap-3">
                            <button
                                onClick={() => {
                                    // Reset to center
                                    setProductForm({
                                        ...productForm,
                                        imagePosition: { scale: 1, x: 50, y: 50 }
                                    });
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setShowAdjustModal(false)}
                                className="px-6 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinksSection;
