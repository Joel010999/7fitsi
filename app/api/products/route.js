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

    const newProduct = await db.product.create({
      data: {
        name: body.name,
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        price: parseFloat(body.price),
        imageUrl: body.imageUrl || '',
        category: body.category,
        subCategory: body.subCategory || '',
        colors: Array.isArray(body.colors) ? body.colors.join(', ') : body.colors,
        sizes: Array.isArray(body.sizes) ? body.sizes.join(', ') : body.sizes,
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
