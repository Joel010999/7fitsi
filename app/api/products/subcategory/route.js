import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// DELETE: Remove a subcategory from all products that have it within a given category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');

    if (!category || !subCategory) {
      return NextResponse.json(
        { error: 'Se requieren los parámetros "category" y "subCategory"' },
        { status: 400 }
      );
    }

    // Clear the subCategory field on all matching products
    const result = await db.product.updateMany({
      where: {
        category: category,
        subCategory: subCategory,
      },
      data: {
        subCategory: '',
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la subcategoría' },
      { status: 500 }
    );
  }
}
