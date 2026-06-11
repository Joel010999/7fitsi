import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '../../../lib/products';

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request) {
  const body = await request.json();
  const products = getProducts();

  const newProduct = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: body.name,
    originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
    price: parseFloat(body.price),
    imageUrl: body.imageUrl || '',
    category: body.category,
    subCategory: body.subCategory || '',
    colors: Array.isArray(body.colors) ? body.colors : (body.colors || '').split(',').map(c => c.trim()).filter(Boolean),
    sizes: Array.isArray(body.sizes) ? body.sizes : (body.sizes || '').split(',').map(s => s.trim()).filter(Boolean),
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  saveProducts(products);

  return NextResponse.json(newProduct, { status: 201 });
}
