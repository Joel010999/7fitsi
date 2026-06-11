import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { generateCode } from '../../../lib/giftcards';

export async function GET() {
  try {
    const cards = await db.giftCard.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching giftcards:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Generate unique code safely
    let code;
    let exists = true;
    while (exists) {
      code = generateCode();
      const count = await db.giftCard.count({ where: { code } });
      if (count === 0) exists = false;
    }

    const newCard = await db.giftCard.create({
      data: {
        code,
        amount: parseFloat(body.amount),
        recipientName: body.recipientName || '',
        message: body.message || ''
      }
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Error creating giftcard:', error);
    return NextResponse.json({ error: 'Failed to create giftcard' }, { status: 500 });
  }
}
