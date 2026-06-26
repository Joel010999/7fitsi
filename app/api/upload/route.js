import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import path from 'path';

// Configure Cloudinary if credentials are provided
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Convert file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (hasCloudinary) {
      const base64String = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64String}`;

      // Upload to Cloudinary under the '7cero_products' folder
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: '7cero_products',
      });

      // Return the secure URL in the expected format
      return NextResponse.json({ url: result.secure_url });
    } else {
      // Fallback: Save file locally in public/images/products/
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.png';
      const filename = `${uniqueSuffix}-${cleanFileName}`;

      const relativePath = `/images/products/${filename}`;
      const absolutePath = path.join(process.cwd(), 'public', 'images', 'products', filename);

      await writeFile(absolutePath, buffer);
      return NextResponse.json({ url: relativePath });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}

