import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import VaultItem from '@/models/VaultItem';
import connectDB from '@/db/ConnectDb';
import { notifyFollowersNewVaultItem } from '@/utils/notificationHelpers';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = await req.json();
        const {
            title,
            description,
            pointCost,
            type,
            fileType,
            fileUrl,
            instructions,
            limit,
            userLimit,
            isFree = true  // Default to free
        } = data;

        // Validation
        if (!title || !description || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Free item validation
        if (isFree) {
            if (Number(pointCost) !== 0) {
                return NextResponse.json({ error: 'Free items must have 0 cost' }, { status: 400 });
            }
            if (Number(limit) <= 0) {
                return NextResponse.json({ error: 'Free items must have a limited supply (cannot be unlimited)' }, { status: 400 });
            }
            // userLimit is strictly 1 for free items - enforced on save
        } else {
            // Paid item validation
            if (!pointCost || Number(pointCost) <= 0) {
                return NextResponse.json({ error: 'Paid items must have a cost greater than 0' }, { status: 400 });
            }
        }

        // Type-specific validation
        if (type === 'file' && (!fileUrl || !fileType)) {
            return NextResponse.json({ error: 'File URL and file type are required for file rewards' }, { status: 400 });
        }

        // Only promise type requires instructions (Q&A doesn't)
        if (type === 'promise' && !instructions) {
            return NextResponse.json({ error: 'Instructions are required for Promise rewards' }, { status: 400 });
        }

        // Create the vault item
        const newItem = await VaultItem.create({
            creatorId: user._id,
            title,
            description,
            pointCost: isFree ? 0 : Number(pointCost),
            isFree: isFree,
            type,
            fileType: type === 'file' ? fileType : undefined,
            fileUrl: (type === 'file' || type === 'text') ? fileUrl : undefined,
            instructions: type === 'promise' ? instructions : undefined,
            limit: Number(limit) || 0,
            userLimit: isFree ? 1 : (Number(userLimit) || 1),  // Strictly 1 for free items
            isActive: true
        });

        // Notify followers about the new vault item
        if (user.followersArray && user.followersArray.length > 0) {
            const creatorName = user.name || user.username;
            notifyFollowersNewVaultItem(
                user._id,
                creatorName,
                title,
                newItem._id,
                user.followersArray,
                isFree
            ).catch(err => console.error('Error notifying followers:', err));
        }

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error creating vault item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}
