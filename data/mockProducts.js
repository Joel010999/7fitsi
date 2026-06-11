import fs from 'fs';
import path from 'path';

function loadProducts() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export const mockProducts = loadProducts();
