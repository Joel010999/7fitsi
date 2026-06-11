import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '../../../../lib/products';

export async function DELETE(request, { params }) {
  const { id } = await params;
  let products = getProducts();
  const before = products.length;
  products = products.filter(p => p.id !== id);

  if (products.length === before) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  saveProducts(products);
  return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  products[index] = {
    ...products[index],
    ...body,
    id: products[index].id,
    updatedAt: new Date().toISOString()
  };

  saveProducts(products);
  return NextResponse.json(products[index]);
}
