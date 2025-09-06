import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/db/ConnectDb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const type = formData.get('type'); // 'profilepic', 'coverpic', or undefined for vault

  console.log('API /api/upload called');
  console.log('Received file:', file ? file.name : null, 'type:', file ? file.type : null, 'size:', file ? file.size : null);
  console.log('Received type:', type);

  if (!file) {
    console.log('No file received');
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  // Convert file to buffer and base64 string
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  try {
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else {
      resourceType = 'raw'; // For PDFs, documents, etc.
    }

    // Upload to Cloudinary using Promise API
    const uploadOptions = {
      folder: type ? 'instafam' : 'instafam/vault',
      resource_type: resourceType,
    };

    // Add additional options for raw files
    if (resourceType === 'raw') {
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = true;
    }

    console.log('Uploading to Cloudinary with options:', uploadOptions);
    const result = await cloudinary.v2.uploader.upload(dataUri, uploadOptions);
    console.log('Cloudinary upload result:', result);

    if (!result || !result.secure_url) {
      console.log('Cloudinary upload failed, result:', result);
      return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }

    // If it's a profile/cover pic update, update the user profile
    if (type && (type === 'profilepic' || type === 'coverpic')) {
      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { [type]: result.secure_url },
        { new: true }
      );
      console.log('Profile/cover pic updated for user:', user?.email);
      return NextResponse.json({ success: true, secure_url: result.secure_url, user });
    }

    // For vault uploads, always return secure_url for frontend compatibility
    return NextResponse.json({ 
      success: true, 
      secure_url: result.secure_url,
      resourceType: resourceType,
      originalName: file.name,
      size: file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload error', details: err.message }, { status: 500 });
  }
}

