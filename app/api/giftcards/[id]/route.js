import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedCard = await db.giftCard.update({
      where: { id },
      data: {
        amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
        recipientName: body.recipientName,
        message: body.message
      }
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating giftcard:', error);
    return NextResponse.json({ error: 'Gift card no encontrada' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await db.giftCard.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting giftcard:', error);
    return NextResponse.json({ error: 'Gift card no encontrada' }, { status: 404 });
  }
}
