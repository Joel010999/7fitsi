import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await db.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Producto no encontrado o error del servidor' }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name: body.name,
        price: body.price ? parseFloat(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? parseFloat(body.originalPrice) : null) : undefined,
        imageUrl: body.imageUrl,
        category: body.category,
        subCategory: body.subCategory,
        colors: Array.isArray(body.colors) ? body.colors.join(', ') : body.colors,
        sizes: Array.isArray(body.sizes) ? body.sizes.join(', ') : body.sizes,
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
}
