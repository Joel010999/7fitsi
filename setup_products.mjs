import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const srcDir = 'C:\\Users\\coale\\.gemini\\antigravity\\brain\\3dc42016-6563-4093-99c2-30ed48274ff6';
const destDir = path.join(process.cwd(), 'public', 'images', 'products');

const productsToLoad = [
  {
    name: 'Campera Active',
    category: 'Mujer',
    subCategory: 'Buzos camperas y abrigos',
    price: 35000,
    colors: 'Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119706265.jpg',
    destImage: 'campera_active.jpg'
  },
  {
    name: 'Calza Active',
    category: 'Mujer',
    subCategory: 'Calzas y pantalones',
    price: 25000,
    colors: 'Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119773803.jpg',
    destImage: 'calza_active.jpg'
  },
  {
    name: 'Campera Esencial',
    category: 'Mujer',
    subCategory: 'Buzos camperas y abrigos',
    price: 32000,
    colors: 'Gris, Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119794153.jpg',
    destImage: 'campera_esencial.jpg'
  },
  {
    name: 'Pantalón Esencial',
    category: 'Mujer',
    subCategory: 'Calzas y pantalones',
    price: 28000,
    colors: 'Gris, Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119794153.jpg',
    destImage: 'pantalon_esencial.jpg'
  },
  {
    name: 'Remera Tank',
    category: 'Mujer',
    subCategory: 'Remeras tops y musculosas',
    price: 15000,
    colors: 'Blanco, Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119810526.jpg',
    destImage: 'remera_tank.jpg'
  },
  {
    name: 'Remera over corta DAHY',
    category: 'Mujer',
    subCategory: 'Remeras tops y musculosas',
    price: 18000,
    colors: 'Blanco',
    sizes: 'S, M',
    srcImage: 'media__1781119841155.jpg',
    destImage: 'remera_dahy.jpg'
  },
  {
    name: 'Iconic V Calza Cintura Cruzada',
    category: 'Mujer',
    subCategory: 'Calzas y pantalones',
    price: 27000,
    colors: 'Negro, Azul',
    sizes: 'S, M, L',
    srcImage: 'media__1781119849766.png',
    destImage: 'calza_iconic_v.png'
  },
  {
    name: 'Oxford Soft',
    category: 'Mujer',
    subCategory: 'Calzas y pantalones',
    price: 29000,
    colors: 'Negro',
    sizes: 'S, M, L, XL',
    srcImage: 'media__1781119880114.jpg',
    destImage: 'oxford_soft.jpg'
  },
  {
    name: 'Top Long',
    category: 'Mujer',
    subCategory: 'Remeras tops y musculosas',
    price: 16000,
    colors: 'Negro, Blanco',
    sizes: 'S, M, L',
    srcImage: 'media__1781119891441.jpg',
    destImage: 'top_long.jpg'
  },
  {
    name: 'DFYNE Calza Negra Seamless',
    category: 'Mujer',
    subCategory: 'Calzas y pantalones',
    price: 31000,
    colors: 'Negro',
    sizes: 'S, M, L',
    srcImage: 'media__1781119897579.jpg',
    destImage: 'calza_dfyne.jpg'
  }
];

// Initialize Prisma
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Copying images...');
  for (const prod of productsToLoad) {
    const src = path.join(srcDir, prod.srcImage);
    const dest = path.join(destDir, prod.destImage);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log('Copied ' + prod.destImage);
    } else {
      console.log('MISSING: ' + src);
    }
  }

  console.log('Clearing existing products...');
  await prisma.product.deleteMany({});

  console.log('Inserting products into DB...');
  for (const prod of productsToLoad) {
    await prisma.product.create({
      data: {
        name: prod.name,
        category: prod.category,
        subCategory: prod.subCategory,
        price: prod.price,
        colors: prod.colors,
        sizes: prod.sizes,
        imageUrl: '/images/products/' + prod.destImage
      }
    });
    console.log('Inserted ' + prod.name);
  }
  
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
