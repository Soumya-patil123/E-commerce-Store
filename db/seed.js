const db = require('./database');

const products = [
  {
    name: 'Canvas Field Jacket',
    description: 'A durable waxed-canvas jacket built for long days outside. Lined with brushed flannel and finished with corozo buttons.',
    price: 128.0,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    category: 'Apparel',
    stock: 14
  },
  {
    name: 'Ceramic Pour-Over Set',
    description: 'Hand-thrown stoneware dripper and matching mug, glazed in a soft oatmeal finish. Includes 40 unbleached filters.',
    price: 46.0,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
    category: 'Home',
    stock: 32
  },
  {
    name: 'Cedar Cutting Board',
    description: 'End-grain cedar board finished with food-safe oil. Naturally antimicrobial and gentle on knife edges.',
    price: 58.0,
    image_url: 'https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=600&q=80',
    category: 'Home',
    stock: 20
  },
  {
    name: 'Wool Trail Socks (2-pack)',
    description: 'Merino wool blend socks with reinforced heel and toe. Regulates temperature on long hikes.',
    price: 22.0,
    image_url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
    category: 'Apparel',
    stock: 60
  },
  {
    name: 'Enamel Camp Mug',
    description: 'Chip-resistant enamel mug with a comfortable riveted handle. Fits most percolators and camp stoves.',
    price: 18.0,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80',
    category: 'Outdoor',
    stock: 45
  },
  {
    name: 'Leather Field Notebook',
    description: 'Full-grain leather cover wrapped around 160 pages of acid-free paper. Refillable insert included.',
    price: 34.0,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    category: 'Stationery',
    stock: 25
  },
  {
    name: 'Brass Compass',
    description: 'A precision liquid-filled compass in a solid brass housing. Small enough for a jacket pocket.',
    price: 39.0,
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
    category: 'Outdoor',
    stock: 18
  },
  {
    name: 'Linen Market Tote',
    description: 'Heavyweight linen tote with leather straps. Roomy enough for a farmers-market haul.',
    price: 29.0,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    category: 'Accessories',
    stock: 40
  }
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image_url, category, stock)
  VALUES (@name, @description, @price, @image_url, @category, @stock)
`);

const existing = db.prepare('SELECT COUNT(*) AS c FROM products').get();

if (existing.c === 0) {
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log('Products table already has data — skipping seed.');
}
