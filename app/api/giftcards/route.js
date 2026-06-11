import { NextResponse } from 'next/server';
import { getGiftCards, saveGiftCards, generateCode } from '../../../lib/giftcards';

export async function GET() {
  const cards = getGiftCards();
  return NextResponse.json(cards);
}

export async function POST(request) {
  const body = await request.json();
  const cards = getGiftCards();

  // Generate unique code
  let code;
  do {
    code = generateCode();
  } while (cards.some(c => c.code === code));

  const newCard = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    code,
    amount: parseFloat(body.amount),
    recipientName: body.recipientName || '',
    message: body.message || '',
    used: false,
    usedAt: null,
    createdAt: new Date().toISOString()
  };

  cards.push(newCard);
  saveGiftCards(cards);

  return NextResponse.json(newCard, { status: 201 });
}
