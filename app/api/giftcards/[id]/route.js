import { NextResponse } from 'next/server';
import { getGiftCards, saveGiftCards } from '../../../../lib/giftcards';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const cards = getGiftCards();
  const index = cards.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Gift card no encontrada' }, { status: 404 });
  }

  cards[index] = {
    ...cards[index],
    ...body,
    id: cards[index].id,
    code: cards[index].code,
    updatedAt: new Date().toISOString()
  };

  saveGiftCards(cards);
  return NextResponse.json(cards[index]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  let cards = getGiftCards();
  const before = cards.length;
  cards = cards.filter(c => c.id !== id);

  if (cards.length === before) {
    return NextResponse.json({ error: 'Gift card no encontrada' }, { status: 404 });
  }

  saveGiftCards(cards);
  return NextResponse.json({ success: true });
}
