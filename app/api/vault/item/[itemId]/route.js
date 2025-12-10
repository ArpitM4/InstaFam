import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';

// PUT: Edit Item
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { itemId } = params;
        const updates = await req.json();

        await connectDB();

        const item = await VaultItem.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Verify Ownership
        const user = await User.findOne({ email: session.user.email });
        if (!user || item.creatorId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Limit Constraints: Can only increase or stay same
        // 0 = Unlimited. 
        // Logic: Availability cannot decrease.
        // If Old is Finite (e.g. 10): New can be >= 10 OR 0.
        // If Old is Infinite (0): New MUST be 0.

        if (updates.limit !== undefined) {
            const oldLim = item.limit;
            const newLim = Number(updates.limit);

            if (oldLim === 0 && newLim !== 0) {
                return NextResponse.json({ error: 'Cannot decrease limit (currently Unlimited)' }, { status: 400 });
            }
            if (oldLim > 0 && newLim !== 0 && newLim < oldLim) {
                return NextResponse.json({ error: 'Cannot decrease limit. You can only add more slots.' }, { status: 400 });
            }
        }

        if (updates.userLimit !== undefined) {
            const oldUserLim = item.userLimit;
            const newUserLim = Number(updates.userLimit);

            // "limits could only be increase not decreased" (availability)
            if (oldUserLim === 0 && newUserLim !== 0) {
                return NextResponse.json({ error: 'Cannot decrease per-user limit (currently Unlimited)' }, { status: 400 });
            }
            if (oldUserLim > 0 && newUserLim !== 0 && newUserLim < oldUserLim) {
                return NextResponse.json({ error: 'Cannot decrease per-user limit. You can only add more slots.' }, { status: 400 });
            }
        }

        // Prevent editing critical non-editable fields if needed (like Type?)
        // Assuming Type is fixed.
        if (updates.type && updates.type !== item.type) {
            return NextResponse.json({ error: 'Cannot change item type' }, { status: 400 });
        }

        // Apply Updates
        const writableFields = ['title', 'description', 'pointCost', 'instructions', 'limit', 'userLimit', 'isActive', 'fileUrl', 'fileType'];

        writableFields.forEach(field => {
            if (updates[field] !== undefined) {
                item[field] = updates[field];
            }
        });

        await item.save();

        return NextResponse.json({ success: true, item });

    } catch (error) {
        console.error('Error editing vault item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove Item
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { itemId } = params;
        await connectDB();

        const item = await VaultItem.findById(itemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Verify Ownership
        const user = await User.findOne({ email: session.user.email });
        if (!user || item.creatorId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Soft Delete (Mark inactive)
        await VaultItem.findByIdAndUpdate(itemId, { isActive: false });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting vault item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
