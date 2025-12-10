"use client";
import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaTrash, FaCheck } from 'react-icons/fa';

const EditVaultItemModal = ({ item, onClose, onSuccess, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [formData, setFormData] = useState({
        title: item.title || '',
        description: item.description || '',
        isFree: item.isFree,
        pointCost: item.pointCost || 0,
        type: item.type, // Read only
        fileType: item.fileType || 'image',
        fileUrl: item.fileUrl || '',
        instructions: item.instructions || '',
        limit: item.limit || 0,
        userLimit: item.userLimit || 0
    });

    const [uploadMode, setUploadMode] = useState(item.fileUrl && !item.fileUrl.startsWith('http') ? 'upload' : 'link');
    if (item.fileUrl && item.fileUrl.startsWith('http') && uploadMode === 'upload') setUploadMode('link');

    const [uploadingFile, setUploadingFile] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

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

    const handleUpdate = async () => {
        setLoading(true);
        try {
            // Validate Limits manually before sending to hint user
            // Note: 0 is Unlimited.
            // If Old Limit was NOT 0, New Limit cannot be < Old Limit (unless 0? No, 0 is infinite)
            // Wait, infinite availability > finite availability.
            // So if Old=10, New=Infinite(0) allowed? Yes, that's increasing availability.
            // My API logic said: If oldLim > 0 && newLim !== 0 && newLim < oldLim -> Error.
            // So 10 -> 0 is allowed (increasing to infinite).
            // 10 -> 5 is blocked.

            // Just let API handle validation and show error toast.

            const res = await fetch(`/api/vault/item/${item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Item Updated!");
                onSuccess(data.item);
                onClose();
            } else {
                toast.error(data.error || "Failed to update item");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/vault/item/${item._id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Item Deleted!");
                if (onDelete) onDelete(item._id);
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete item");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    const modalContentClass = "bg-[#1a1a1f] p-6 rounded-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40 transition-colors";

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
            <div className={`${modalContentClass} max-w-xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Edit Vault Item
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-1">Title</label>
                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1">Description</label>
                        <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            rows={3}
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    {/* Pricing */}
                    <div>
                        <label className="block text-sm text-white/60 mb-1">Cost (FamPoints)</label>
                        <div className="flex gap-2">
                            <input type="number"
                                className={`flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary ${formData.isFree ? 'opacity-50' : ''}`}
                                min={0}
                                value={formData.isFree ? 0 : formData.pointCost}
                                disabled={formData.isFree}
                                onChange={e => setFormData({ ...formData, pointCost: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/60">Is Free?</span>
                                <input type="checkbox" checked={formData.isFree}
                                    onChange={e => setFormData({ ...formData, isFree: e.target.checked, pointCost: e.target.checked ? 0 : (item.pointCost || 10) })}
                                    className="w-5 h-5 accent-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limit Fields */}
                    <div className={`grid ${formData.isFree ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                        {!formData.isFree && (
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Per User Limit <span className="text-white/40 ml-1">(0 = Unlimited)</span></label>
                                <input
                                    type="number"
                                    className={`w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary ${formData.type === 'file' || formData.type === 'text' ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                        <div>
                            <label className="block text-sm text-white/60 mb-1">
                                Total Supply {!formData.isFree && <span className="text-white/40 ml-1">(0 = Unlimited)</span>}
                            </label>
                            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                min={0}
                                placeholder="0 = Unlimited"
                                value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })}
                            />
                            <p className="text-[10px] text-yellow-500/60 mt-1">Note: You can only increase availability (e.g. 10 → 20, or 10 → 0/Unlimited). Decreasing is not allowed.</p>
                        </div>
                    </div>

                    {/* Content Fields based on Type */}
                    {formData.type === 'file' && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">File URL</label>
                            <div className="flex gap-2">
                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                    value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} />
                                <label className="bg-white/10 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center hover:bg-white/20 whitespace-nowrap">
                                    {uploadingFile ? '...' : 'Upload'}
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                    )}

                    {formData.type === 'text' && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Secret Message</label>
                            <textarea className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                rows={2} value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} />
                        </div>
                    )}

                    {formData.type === 'promise' && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Instructions</label>
                            <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
                        <button
                            onClick={handleUpdate}
                            disabled={loading || uploadingFile}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>

                        {!confirmDelete ? (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-medium hover:bg-red-500/20 flex items-center justify-center gap-2"
                            >
                                <FaTrash className="text-sm" /> Delete Item
                            </button>
                        ) : (
                            <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl hover:text-white">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">
                                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditVaultItemModal;
