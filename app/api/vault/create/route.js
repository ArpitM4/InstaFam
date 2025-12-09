import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import VaultItem from '@/models/VaultItem';
import connectDB from '@/db/ConnectDb';

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
            userLimit
        } = data;

        // Validation
        if (!title || !description || !pointCost || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Type-specific validation
        if (type === 'file' && (!fileUrl || !fileType)) {
            return NextResponse.json({ error: 'File URL and file type are required for file rewards' }, { status: 400 });
        }

        if ((type === 'promise' || type === 'qna') && !instructions) {
            return NextResponse.json({ error: 'Instructions are required for Promise and QnA rewards' }, { status: 400 });
        }

        // Create the vault item
        const newItem = await VaultItem.create({
            creatorId: user._id,
            title,
            description,
            pointCost: Number(pointCost),
            type,
            fileType: type === 'file' ? fileType : undefined,
            fileUrl: type === 'file' ? fileUrl : undefined,
            instructions: (type === 'promise' || type === 'qna' || type === 'text') ? instructions : undefined, // Text might use instructions too ("Here is the secret...")? No, Text is usually the content itself.
            limit: Number(limit) || 0,
            userLimit: Number(userLimit) || 1,
            isActive: true
        });

        // If type is 'text', we might store the 'secret' in instructions or separate field?
        // Requirement said: "Text (Secret Message)". Usually that means the description IS the secret or a separate field.
        // But implementation plan didn't add a specific 'content' field for text.
        // Let's assume 'instructions' holds the secret message for 'text' type for now, or use 'description' as public teaser and need a field for the secret.
        // Actually, 'description' is public. 'fileUrl' is hidden until unlock. 
        // For TEXT type, we should store the secret in 'fileUrl' or a new field.
        // Let's use 'fileUrl' to store the secret text for 'text' type for simplicity and consistency with 'file'.

        if (type === 'text') {
            // If it's a text reward, we expect the 'secret content' to be passed.
            // Let's assume the frontend passes it in 'fileUrl' (as "content") or a specific field.
            // I will adhere to using `fileUrl` to store the secret text content to avoid schema bloat.
            if (data.secretContent) {
                newItem.fileUrl = data.secretContent;
                await newItem.save();
            }
        }

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error creating vault item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}
