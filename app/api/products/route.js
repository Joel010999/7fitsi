import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // REGLA DE ORO:
    // - Sin filtro o "TODOS" → ordenar por createdAt DESC (cronológico global)
    // - Categoría específica → filtrar + ordenar por categoryOrder ASC
    const isFiltered = category && category.toUpperCase() !== 'TODOS';

    const queryOptions = {};

    if (isFiltered) {
      queryOptions.where = {
        category: {
          equals: category,
          mode: 'insensitive',
        },
      };
      queryOptions.orderBy = { categoryOrder: 'asc' };
    } else {
      queryOptions.orderBy = { createdAt: 'desc' };
    }

    const products = await db.product.findMany(queryOptions);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { images } = body;
    
    const variants = body.variants || [];
    const totalStock = variants.length > 0 
      ? variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
      : (body.stock ? parseInt(body.stock) : 0);

    const sizesStr = variants.length > 0
      ? Array.from(new Set(variants.map(v => v.size).filter(Boolean))).join(', ')
      : (Array.isArray(body.sizes) ? body.sizes.join(', ') : body.sizes || '');

    const colorsStr = variants.length > 0
      ? Array.from(new Set(variants.map(v => v.color).filter(Boolean))).join(', ')
      : (Array.isArray(body.colors) ? body.colors.join(', ') : body.colors || '');

    const variantsStr = JSON.stringify(variants);

    const imagesStr = JSON.stringify(images || []);
    const fallbackImageUrl = body.imageUrl || (images && images[0]) || '';

    const newProduct = await db.product.create({
      data: {
        name: body.name,
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        listPrice: body.listPrice ? parseFloat(body.listPrice) : null,
        price: parseFloat(body.price),
        imageUrl: fallbackImageUrl,
        images: imagesStr,
        category: body.category,
        subCategory: body.subCategory || '',
        colors: colorsStr,
        sizes: sizesStr,
        description: body.description || '',
        stock: totalStock,
        variants: variantsStr,
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
