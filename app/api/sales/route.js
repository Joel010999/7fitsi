import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      whereClause = {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      };
    } else {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      whereClause = {
        createdAt: {
          gte: oneWeekAgo
        }
      };
    }

    const sales = await db.saleRecord.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales history:', error);
    return NextResponse.json({ error: 'Error del servidor al obtener el historial de ventas.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No se enviaron ítems válidos para procesar.' }, { status: 400 });
    }

    // Process all stock updates inside a Prisma database transaction
    await db.$transaction(async (tx) => {
      for (const item of items) {
        const { productId, size, color, quantity, price: itemPrice, priceType, totalPrice: itemTotalPrice } = item;
        const qty = parseInt(quantity);

        if (!productId || !size || !color || isNaN(qty) || qty <= 0) {
          throw new Error('Datos de venta inválidos en uno de los artículos.');
        }

        // Fetch product with current variants JSON
        const product = await tx.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          throw new Error(`Producto con ID ${productId} no encontrado.`);
        }

        let variants = [];
        try {
          variants = JSON.parse(product.variants || '[]');
        } catch (err) {
          console.error('Error parsing product variants JSON:', err);
          throw new Error(`Error al leer las variantes del producto "${product.name}".`);
        }

        // Find the variant matching size and color
        const variantIdx = variants.findIndex(
          v => v.size?.toUpperCase() === size.toUpperCase() && v.color?.toLowerCase() === color.toLowerCase()
        );

        if (variantIdx === -1) {
          throw new Error(`No se encontró la variante (Talle: ${size}, Color: ${color}) para el producto "${product.name}".`);
        }

        const currentVariantStock = parseInt(variants[variantIdx].stock) || 0;
        if (currentVariantStock < qty) {
          throw new Error(`Stock insuficiente para "${product.name}" (Talle: ${size}, Color: ${color}). Stock disponible: ${currentVariantStock}, Solicitado: ${qty}`);
        }

        // Subtract stock
        variants[variantIdx].stock = currentVariantStock - qty;

        // Recalculate total product stock
        const totalStock = variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);

        // Recalculate size and color strings
        const sizesStr = Array.from(new Set(variants.map(v => v.size).filter(Boolean))).join(', ');
        const colorsStr = Array.from(new Set(variants.map(v => v.color).filter(Boolean))).join(', ');

        // Update product in DB
        await tx.product.update({
          where: { id: productId },
          data: {
            variants: JSON.stringify(variants),
            stock: totalStock,
            sizes: sizesStr,
            colors: colorsStr
          }
        });

        // Use the price sent from frontend (supports cash/list price), fallback to product.price
        const salePrice = typeof itemPrice === 'number' ? itemPrice : product.price;
        const saleTotalPrice = typeof itemTotalPrice === 'number' ? itemTotalPrice : qty * salePrice;

        // Record the sale log
        await tx.saleRecord.create({
          data: {
            productId,
            productName: product.name,
            size,
            color,
            quantity: qty,
            price: salePrice,
            priceType: priceType === 'list' ? 'Lista' : 'Efectivo',
            totalPrice: saleTotalPrice
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing POS sale:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor al procesar la venta.' }, { status: 400 });
  }
}
