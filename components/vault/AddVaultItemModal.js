"use client";
import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaGem, FaHandshake, FaComment, FaFileAlt } from 'react-icons/fa';

const AddVaultItemModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Type Selection, 2: Details, 3: Disclaimer

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        isFree: true,  // Default to free
        pointCost: 0,  // 0 for free items
        type: 'file', // 'file', 'text', 'qna', 'promise'
        fileType: 'image', // 'image', 'video', 'pdf', 'audio', 'document'
        fileUrl: '', // For file/text (secret)
        instructions: '', // For promise/qna
        limit: 10, // Default to 10 for free items (cannot be 0)
        userLimit: 1
    });

    const [uploadMode, setUploadMode] = useState('upload'); // 'link' | 'upload'
    const [uploadingFile, setUploadingFile] = useState(false);

    const handleTypeSelect = (type) => {
        // Enforce userLimit = 1 for Digital File and One Way Message (Text)
        const isRestrictedType = type === 'file' || type === 'text';
        setFormData(prev => ({
            ...prev,
            type,
            userLimit: isRestrictedType ? 1 : prev.userLimit
        }));
        setStep(2);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        // We don't need a specific type for vault items unless we want to categorize them in folders
        // route.js handles undefined type by putting it in 'sygil/vault'

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });
            const data = await res.json();

            if (data.success && (data.secure_url || data.url)) {
                setFormData(prev => ({ ...prev, fileUrl: data.secure_url || data.url }));
                toast.success("File uploaded successfully!");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vault/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Vault Item Created!");
                onSuccess(data.item);
                onClose();
            } else {
                toast.error(data.error || "Failed to create item");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Unified Modal Style
    const modalContentClass = "bg-[#1a1a1f] p-6 rounded-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40 transition-colors";

    // --- RENDER STEPS ---

    // STEP 1: SELECT TYPE
    if (step === 1) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className={`${modalContentClass} max-w-2xl`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Create Vault Reward</h2>
                        <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handleTypeSelect('file')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left hover:border-primary/50 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                                <FaFileAlt className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Digital File</h3>
                            <p className="text-sm text-white/50">Sell access to Images, Videos, PDFs, or Documents. Instant unlock.</p>
                        </button>

                        <button onClick={() => handleTypeSelect('promise')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left hover:border-primary/50 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                                <FaHandshake className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Promise</h3>
                            <p className="text-sm text-white/50">Offer a service like a Shoutout, DM reply, or Meetup. Requires fan input.</p>
                        </button>

                        <button onClick={() => handleTypeSelect('qna')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left hover:border-primary/50 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 text-orange-400 group-hover:scale-110 transition-transform">
                                <FaComment className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Q & A</h3>
                            <p className="text-sm text-white/50">Paid question box. Fans pay to ask, you reply directly.</p>
                        </button>

                        <button onClick={() => handleTypeSelect('text')} className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left hover:border-primary/50 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform">
                                <FaGem className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Secret Message</h3>
                            <p className="text-sm text-white/50">Reveal a hidden text, link, or code instantly after purchase.</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 2: FILL DETAILS
    if (step === 2) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className={`${modalContentClass} max-w-xl`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-primary text-sm font-normal cursor-pointer hover:underline" onClick={() => setStep(1)}>← Change Type</span>
                            Details
                        </h2>
                        <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Title</label>
                            <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                placeholder={
                                    formData.type === 'file' ? "e.g. Exclusive 4K Wallpaper Pack" :
                                        formData.type === 'promise' ? "e.g. Meetup IRL" :
                                            formData.type === 'qna' ? "e.g. Ask Me Anything" :
                                                formData.type === 'text' ? "e.g. Secret Discord Invite" : "Enter title..."
                                }
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-1">Description</label>
                            <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                rows={3}
                                placeholder={
                                    formData.type === 'file' ? "Describe the file content fans will unlock..." :
                                        formData.type === 'promise' ? "Describe the service or experience you're offering..." :
                                            formData.type === 'qna' ? "What kind of questions will you answer?" :
                                                formData.type === 'text' ? "Describe what secret is revealed after purchase..." : "Describe what the fan gets..."
                                }
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        {/* Free/Paid Toggle */}
                        <div className="mb-4">
                            <label className="block text-sm text-white/60 mb-2">
                                Pricing
                                {formData.isFree && <span className="text-yellow-400 ml-2">(Free Item: Each user can claim once. Great for promotions!)</span>}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isFree: true, pointCost: 0, userLimit: 1, limit: formData.limit <= 0 ? 10 : formData.limit })}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${formData.isFree
                                        ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    Free
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isFree: false, pointCost: 10, limit: formData.limit })}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${!formData.isFree
                                        ? 'bg-primary/20 border-2 border-primary text-primary'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    Paid
                                </button>
                            </div>
                        </div>

                        {/* Cost Input - Only for Paid */}
                        {!formData.isFree && (
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Cost (FamPoints)</label>
                                <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    min={1}
                                    value={formData.pointCost} onChange={e => setFormData({ ...formData, pointCost: e.target.value })} />
                            </div>
                        )}

                        {/* Limit Fields */}
                        <div className={`grid ${formData.isFree ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            {/* Per User Limit - Only for Paid (Free is strictly 1) */}
                            {!formData.isFree && (
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Per User Limit <span className="text-white/40 ml-1">(0 = Unlimited)</span></label>
                                    <input
                                        type="number"
                                        className={`w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary ${formData.type === 'file' || formData.type === 'text' ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        min={0}
                                        placeholder="0 = Unlimited"
                                        value={formData.type === 'file' || formData.type === 'text' ? 1 : formData.userLimit}
                                        onChange={e => setFormData({ ...formData, userLimit: e.target.value })}
                                        disabled={formData.type === 'file' || formData.type === 'text'}
                                    />
                                    {(formData.type === 'file' || formData.type === 'text') && (
                                        <p className="text-[10px] text-white/40 mt-1">Fixed to 1 per user for this type</p>
                                    )}
                                </div>
                            )}

                            {/* Total Supply */}
                            <div>
                                <label className="block text-sm text-white/60 mb-1">
                                    Total Supply {!formData.isFree && <span className="text-white/40 ml-1">(0 = Unlimited)</span>}
                                </label>
                                <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    min={0}
                                    placeholder="0 = Unlimited"
                                    value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })} />
                            </div>
                        </div>

                        {/* FIELDS BASED ON TYPE */}
                        {formData.type === 'file' && (
                            <>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">File Type</label>
                                    <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                        value={formData.fileType} onChange={e => setFormData({ ...formData, fileType: e.target.value })}>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                        <option value="audio">Audio</option>
                                        <option value="document">Document</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex gap-4 mb-2">
                                        <button
                                            className={`text-sm pb-1 border-b-2 transition-colors ${uploadMode === 'upload' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white'}`}
                                            onClick={() => setUploadMode('upload')}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            className={`text-sm pb-1 border-b-2 transition-colors ${uploadMode === 'link' ? 'text-primary border-primary' : 'text-white/40 border-transparent hover:text-white'}`}
                                            onClick={() => setUploadMode('link')}
                                        >
                                            External Link
                                        </button>
                                    </div>

                                    {uploadMode === 'link' ? (
                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                            placeholder="https://..."
                                            value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="vault-file-upload"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={uploadingFile}
                                            />
                                            <label
                                                htmlFor="vault-file-upload"
                                                className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-white/5 ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {uploadingFile ? (
                                                    <span className="flex items-center gap-2 text-white/60">
                                                        <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></div>
                                                        Uploading...
                                                    </span>
                                                ) : formData.fileUrl && uploadMode === 'upload' ? (
                                                    <div className="text-center">
                                                        <p className="text-green-400 font-medium mb-1">File Uploaded!</p>
                                                        <p className="text-xs text-white/40 break-all">{formData.fileUrl}</p>
                                                        <p className="text-xs text-primary mt-2">Click to replace</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <p className="text-white/60 font-medium">Click to Upload File</p>
                                                        <p className="text-xs text-white/40 mt-1">Supports {formData.fileType} (Max 10MB)</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {formData.type === 'promise' && (
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Instructions for User</label>
                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g. Please provide your Instagram handle..."
                                    value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />
                            </div>
                        )}

                        {formData.type === 'text' && (
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Secret Message / Content</label>
                                <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                    rows={3}
                                    placeholder="The secret code or link revealed after purchase..."
                                    value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} />
                            </div>
                        )}

                        <button
                            onClick={() => {
                                // Validate free items before proceeding
                                if (formData.isFree && Number(formData.limit) <= 0) {
                                    toast.error('Free items must have a limited supply');
                                    return;
                                }
                                if (!formData.isFree && Number(formData.pointCost) <= 0) {
                                    toast.error('Paid items must have a cost greater than 0');
                                    return;
                                }
                                setStep(3);
                            }}
                            className="w-full py-3 mt-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 3: DISCLAIMER
    if (step === 3) {
        return (
            <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                <div className={`${modalContentClass} max-w-md border-yellow-500/30`}>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            ⚖️
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Creator Disclaimer</h2>
                        <p className="text-sm text-white/60">Please confirm before publishing.</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-xs text-white/70 space-y-2 mb-6 border border-white/10 h-48 overflow-y-auto custom-scrollbar">
                        <p>By creating this reward item, you understand and agree that:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>You are fully responsible for fulfilling this reward directly with the fan.</li>
                            <li>Sygil does not participate in, supervise, or guarantee fulfillment.</li>
                            <li>You must handle communication and delivery independently and off-platform.</li>
                            <li>If you do not fulfill or reject a request within 60 days, the request will be automatically cancelled and points refunded.</li>
                            <li>Sygil has no liability for any interactions or outcomes between you and the fan.</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium">
                            Back
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50">
                            {loading ? 'Creating...' : 'I Agree & Publish'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default AddVaultItemModal;
