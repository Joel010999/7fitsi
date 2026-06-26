import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'El ID de la categoría es requerido' },
        { status: 400 }
      );
    }

    // Find the category to get its name before deleting
    const category = await db.category.findUnique({ where: { id } });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Use a transaction: unlink products first, then delete category
    await db.$transaction([
      // Set category to empty string on all products that had this category
      db.product.updateMany({
        where: { category: category.name },
        data: { category: '', subCategory: '' },
      }),
      // Delete the category itself
      db.category.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, deletedName: category.name });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es requerido' },
        { status: 400 }
      );
    }

    // Check for duplicates (case-insensitive)
    const existing = await db.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `La categoría "${existing.name}" ya existe` },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: { name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    );
  }
}
