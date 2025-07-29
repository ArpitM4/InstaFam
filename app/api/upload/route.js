import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/db/ConnectDb';

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
  const type = formData.get('type'); // 'profilepic' or 'coverpic'

  if (!file || !type) {
    return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
  }

  // Convert file to buffer and base64 string
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  try {
    // Upload to Cloudinary using Promise API
    const result = await cloudinary.v2.uploader.upload(dataUri, {
      folder: 'instafam',
      resource_type: 'image',
    });
    if (!result || !result.secure_url) {
      return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }
    // Update user profile
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { [type]: result.secure_url },
      { new: true }
    );
    return NextResponse.json({ success: true, url: result.secure_url, user });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload error', details: err.message }, { status: 500 });
  }
}
