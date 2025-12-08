"use server";

import connectDb from "@/db/ConnectDb";
import VaultItem from "@/models/VaultItem";
import User from "@/models/User";

export const fetchCreatorVaultItemsServer = async (username) => {
    try {
        await connectDb();

        // Find creator by username
        const creator = await User.findOne({ username });
        if (!creator) {
            return { success: false, error: 'Creator not found' };
        }

        // Fetch vault items
        const items = await VaultItem.find({
            creatorId: creator._id,
            isActive: true
        }).sort({ createdAt: -1 }).lean();

        // Serialize items directly
        const serializedItems = items.map(item => ({
            _id: item._id.toString(),
            creatorId: item.creatorId.toString(),
            title: item.title,
            description: item.description,
            pointCost: item.pointCost,
            fileUrl: item.fileUrl,
            fileType: item.fileType,
            fileName: item.fileName,
            fileSize: item.fileSize,
            unlockCount: item.unlockCount,
            isActive: item.isActive,
            requiresFanInput: item.requiresFanInput,
            createdAt: item.createdAt?.toISOString(),
            updatedAt: item.updatedAt?.toISOString()
        }));

        return { success: true, items: serializedItems };
    } catch (error) {
        console.error('Error fetching creator vault items (server):', error);
        return { success: false, error: 'Failed to fetch vault items' };
    }
};
