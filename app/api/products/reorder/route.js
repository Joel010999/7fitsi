import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de updates con id y categoryOrder' },
        { status: 400 }
      );
    }

    // Validate each update has required fields
    for (const update of updates) {
      if (!update.id || typeof update.categoryOrder !== 'number') {
        return NextResponse.json(
          { error: 'Cada update debe tener id (string) y categoryOrder (number)' },
          { status: 400 }
        );
      }
    }

    // Execute all updates atomically in a single transaction
    await db.$transaction(
      updates.map(({ id, categoryOrder }) =>
        db.product.update({
          where: { id },
          data: { categoryOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      { error: 'Error al reordenar productos' },
      { status: 500 }
    );
  }
}
