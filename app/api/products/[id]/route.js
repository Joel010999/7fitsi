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

    const hasVariants = body.variants !== undefined;
    const variantsStr = hasVariants ? JSON.stringify(body.variants || []) : undefined;
    
    let totalStock = undefined;
    if (hasVariants) {
      totalStock = (body.variants || []).reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
    } else if (body.stock !== undefined) {
      totalStock = parseInt(body.stock) || 0;
    }

    let sizesStr = undefined;
    if (hasVariants) {
      sizesStr = Array.from(new Set((body.variants || []).map(v => v.size).filter(Boolean))).join(', ');
    } else if (body.sizes !== undefined) {
      sizesStr = Array.isArray(body.sizes) ? body.sizes.join(', ') : body.sizes;
    }

    let colorsStr = undefined;
    if (hasVariants) {
      colorsStr = Array.from(new Set((body.variants || []).map(v => v.color).filter(Boolean))).join(', ');
    } else if (body.colors !== undefined) {
      colorsStr = Array.isArray(body.colors) ? body.colors.join(', ') : body.colors;
    }

    const imagesStr = body.images !== undefined ? JSON.stringify(body.images || []) : undefined;
    const hasImages = body.images !== undefined && Array.isArray(body.images);
    const fallbackImageUrl = hasImages ? (body.imageUrl || body.images[0] || '') : body.imageUrl;

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        name: body.name,
        price: body.price ? parseFloat(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? parseFloat(body.originalPrice) : null) : undefined,
        imageUrl: fallbackImageUrl,
        images: imagesStr,
        category: body.category,
        subCategory: body.subCategory,
        colors: colorsStr,
        sizes: sizesStr,
        description: body.description !== undefined ? (body.description || '') : undefined,
        stock: totalStock,
        variants: variantsStr,
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
}
