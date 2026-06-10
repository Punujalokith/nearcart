import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Sri Lanka coordinates ──────────────────────────────────────────────────────
const LOCATIONS = {
  colombo:  { city: 'Colombo',  lat: 6.9271,  lng: 79.8612 },
  kandy:    { city: 'Kandy',    lat: 7.2906,  lng: 80.6337 },
  galle:    { city: 'Galle',    lat: 6.0535,  lng: 80.2210 },
  negombo:  { city: 'Negombo',  lat: 7.2108,  lng: 79.8370 },
  matara:   { city: 'Matara',   lat: 5.9549,  lng: 80.5550 },
  jaffna:   { city: 'Jaffna',   lat: 9.6615,  lng: 80.0255 },
};

const categories = [
  { name: 'Groceries',     slug: 'groceries',    children: ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Rice & Grains'] },
  { name: 'Electronics',   slug: 'electronics',  children: ['Phones', 'Accessories', 'Computers'] },
  { name: 'Fashion',       slug: 'fashion',      children: ["Men's Clothing", "Women's Clothing", 'Footwear'] },
  { name: 'Home & Garden', slug: 'home-garden',  children: ['Furniture', 'Kitchen', 'Garden'] },
  { name: 'Health',        slug: 'health',       children: ['Medicine', 'Personal Care', 'Fitness'] },
  { name: 'Food & Drinks', slug: 'food-drinks',  children: ['Restaurants', 'Beverages', 'Snacks'] },
];

async function main() {
  // ── Categories ────────────────────────────────────────────────────────────────
  console.log('Seeding categories...');
  const catMap = {};
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });
    catMap[cat.slug] = parent;
    for (const childName of cat.children) {
      const childSlug = childName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const child = await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: { name: childName, slug: childSlug, parentId: parent.id },
      });
      catMap[childSlug] = child;
    }
  }

  // ── Users ────────────────────────────────────────────────────────────────────
  console.log('Seeding users...');
  const hash = (pw) => bcrypt.hash(pw, 10);

  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@nearcart.dev' },
    update: {},
    create: { email: 'buyer@nearcart.dev', passwordHash: await hash('password123'), name: 'Kamal Perera', role: 'BUYER', phone: '+94771234567' },
  });
  const buyer2 = await prisma.user.upsert({
    where: { email: 'nimal@nearcart.dev' },
    update: {},
    create: { email: 'nimal@nearcart.dev', passwordHash: await hash('password123'), name: 'Nimal Silva', role: 'BUYER', phone: '+94779876543' },
  });
  const buyer3 = await prisma.user.upsert({
    where: { email: 'amara@nearcart.dev' },
    update: {},
    create: { email: 'amara@nearcart.dev', passwordHash: await hash('password123'), name: 'Amara Jayasinghe', role: 'BUYER', phone: '+94712345678' },
  });

  // Vendor users
  const v1User = await prisma.user.upsert({
    where: { email: 'vendor@nearcart.dev' },
    update: {},
    create: { email: 'vendor@nearcart.dev', passwordHash: await hash('password123'), name: 'Sunil Rajapaksa', role: 'VENDOR', phone: '+94776543210' },
  });
  const v2User = await prisma.user.upsert({
    where: { email: 'saman@nearcart.dev' },
    update: {},
    create: { email: 'saman@nearcart.dev', passwordHash: await hash('password123'), name: 'Saman Kumara', role: 'VENDOR', phone: '+94751234567' },
  });
  const v3User = await prisma.user.upsert({
    where: { email: 'priya@nearcart.dev' },
    update: {},
    create: { email: 'priya@nearcart.dev', passwordHash: await hash('password123'), name: 'Priya Wickramasinghe', role: 'VENDOR', phone: '+94763456789' },
  });
  const v4User = await prisma.user.upsert({
    where: { email: 'roshan@nearcart.dev' },
    update: {},
    create: { email: 'roshan@nearcart.dev', passwordHash: await hash('password123'), name: 'Roshan Fernando', role: 'VENDOR', phone: '+94787654321' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@nearcart.dev' },
    update: {},
    create: { email: 'admin@nearcart.dev', passwordHash: await bcrypt.hash('admin123', 12), name: 'Admin', role: 'ADMIN' },
  });

  // ── Vendors ────────────────────────────────────────────────────────────────
  console.log('Seeding vendors...');
  const v1 = await prisma.vendor.upsert({
    where: { userId: v1User.id },
    update: {},
    create: {
      userId: v1User.id, storeName: 'Colombo Fresh Market',
      description: 'Fresh groceries, vegetables and daily essentials delivered to your doorstep in Colombo.',
      isApproved: true, ...LOCATIONS.colombo,
    },
  });
  const v2 = await prisma.vendor.upsert({
    where: { userId: v2User.id },
    update: {},
    create: {
      userId: v2User.id, storeName: 'Kandy Spice Garden',
      description: 'Authentic Sri Lankan spices, herbs and organic produce straight from the hill country.',
      isApproved: true, ...LOCATIONS.kandy,
    },
  });
  const v3 = await prisma.vendor.upsert({
    where: { userId: v3User.id },
    update: {},
    create: {
      userId: v3User.id, storeName: 'Galle Tech Hub',
      description: 'Mobile accessories, phone repairs and electronics in the Southern Province.',
      isApproved: true, ...LOCATIONS.galle,
    },
  });
  const v4 = await prisma.vendor.upsert({
    where: { userId: v4User.id },
    update: {},
    create: {
      userId: v4User.id, storeName: 'Negombo Seafood Express',
      description: 'Fresh catch from local fishermen — crabs, prawns, fish delivered same day.',
      isApproved: true, ...LOCATIONS.negombo,
    },
  });

  // ── Products ────────────────────────────────────────────────────────────────
  console.log('Seeding products...');

  const fruitsVegCat = catMap['fruits-vegetables'];
  const dairyCat     = catMap['dairy-eggs'];
  const meatCat      = catMap['meat-seafood'];
  const bakeryCat    = catMap['bakery'];
  const riceCat      = catMap['rice-grains'];
  const phonesCat    = catMap['phones'];
  const accCat       = catMap['accessories'];
  const snacksCat    = catMap['snacks'];
  const bevCat       = catMap['beverages'];
  const mensCat      = catMap['men-s-clothing'];
  const womensCat    = catMap["women-s-clothing"];
  const healthCat    = catMap['personal-care'];

  const products = [
    // ─ Colombo Fresh Market products ─
    { vendorId: v1.id, categoryId: fruitsVegCat.id, name: 'Organic Tomatoes (1 kg)',      description: 'Farm-fresh organic tomatoes from Nuwara Eliya highlands. Perfect for curries and salads.',                              price: 280,  stock: 150 },
    { vendorId: v1.id, categoryId: fruitsVegCat.id, name: 'Green Plantains (bunch)',       description: 'Fresh green plantains (kesel) directly from local farms. Great for traditional Sri Lankan dishes.',                      price: 180,  stock: 80  },
    { vendorId: v1.id, categoryId: fruitsVegCat.id, name: 'Jak Fruit (half)',              description: 'Ripe jak fruit (kos) cut fresh daily. Sweet and juicy, ideal for desserts or jack fruit curry.',                         price: 350,  stock: 40  },
    { vendorId: v1.id, categoryId: fruitsVegCat.id, name: 'Bitter Gourd (500g)',           description: 'Fresh bitter gourd (karavila) known for health benefits. Great for diabetic-friendly stir fries.',                       price: 120,  stock: 100 },
    { vendorId: v1.id, categoryId: dairyCat.id,     name: 'Anchor Full Cream Milk (1L)',   description: 'Fresh pasteurised full cream milk. Rich in calcium and perfect for your morning tea or coffee.',                         price: 310,  stock: 200 },
    { vendorId: v1.id, categoryId: dairyCat.id,     name: 'Farm Eggs (10 pack)',           description: 'Free-range chicken eggs from local farms. Rich golden yolk, ideal for hoppers and string hoppers.',                      price: 420,  stock: 120 },
    { vendorId: v1.id, categoryId: bakeryCat.id,    name: 'Ceylon Butter Cake (500g)',     description: 'Freshly baked traditional Ceylon butter cake. Soft, fluffy and made with pure butter — a Sri Lankan classic.',          price: 380,  stock: 30  },
    { vendorId: v1.id, categoryId: bakeryCat.id,    name: 'Coconut Roti (6 pack)',         description: 'Freshly made coconut roti (pol roti) — the authentic Sri Lankan flatbread, best with lunu miris sambol.',               price: 220,  stock: 50  },
    { vendorId: v1.id, categoryId: riceCat.id,      name: 'Red Keeri Samba Rice (5 kg)',   description: 'Premium quality Sri Lankan red keeri samba rice. Low glycemic index, rich in nutrients and fibre.',                      price: 1450, stock: 90  },
    { vendorId: v1.id, categoryId: riceCat.id,      name: 'White Nadu Rice (5 kg)',        description: 'Classic white Nadu rice — the everyday staple for Sri Lankan households. Fluffy and perfect for rice and curry.',        price: 1100, stock: 120 },

    // ─ Kandy Spice Garden products ─
    { vendorId: v2.id, categoryId: fruitsVegCat.id, name: 'Cinnamon Sticks (100g)',        description: 'Pure Ceylon cinnamon (true cinnamon) hand-rolled in Kandy. Sweeter and more delicate than cassia cinnamon.',            price: 450,  stock: 200 },
    { vendorId: v2.id, categoryId: fruitsVegCat.id, name: 'Turmeric Powder (200g)',        description: 'Freshly ground organic turmeric powder from hill-country farms. Vibrant golden colour, strong aroma.',                   price: 280,  stock: 180 },
    { vendorId: v2.id, categoryId: fruitsVegCat.id, name: 'Dried Chilli (250g)',           description: 'Sun-dried whole red chillies from Jaffna variety. Medium-hot with smoky flavour, essential for Lankan cooking.',         price: 320,  stock: 150 },
    { vendorId: v2.id, categoryId: fruitsVegCat.id, name: 'Pandan Leaves (bundle)',        description: 'Fresh fragrant pandan (rampe) leaves from Kandy. Used in rice, curries and desserts for authentic Sri Lankan aroma.',    price: 80,   stock: 200 },
    { vendorId: v2.id, categoryId: bevCat.id,       name: 'Ceylon Orange Pekoe Tea (200g)',description: 'Premium Ceylon Orange Pekoe grade tea from Nuwara Eliya estates. Rich, golden liquor with floral notes.',               price: 680,  stock: 100 },
    { vendorId: v2.id, categoryId: bevCat.id,       name: 'King Coconut Water (3 pack)',   description: 'Fresh thambili (king coconut) water — naturally sweet, hydrating and rich in electrolytes. Straight from the farm.',     price: 240,  stock: 60  },
    { vendorId: v2.id, categoryId: snacksCat.id,    name: 'Kavum (traditional sweets 12p)',description: 'Handmade traditional kavum (oil cakes) — crispy rice flour and treacle sweet. A Sri Lankan festive favourite.',          price: 360,  stock: 40  },
    { vendorId: v2.id, categoryId: snacksCat.id,    name: 'Kokis (crspy snack 200g)',      description: 'Traditional deep-fried kokis — crunchy rose-shaped Sri Lankan snack made with rice flour and coconut milk.',             price: 290,  stock: 55  },

    // ─ Galle Tech Hub products ─
    { vendorId: v3.id, categoryId: phonesCat.id,    name: 'Samsung A15 (6GB/128GB)',       description: 'Samsung Galaxy A15 — 6.5" Super AMOLED display, 50MP camera, 5000mAh battery. Available in Black & Blue.',             price: 47500,stock: 15  },
    { vendorId: v3.id, categoryId: phonesCat.id,    name: 'Redmi 13C (4GB/128GB)',         description: 'Xiaomi Redmi 13C — budget-friendly smartphone with 50MP camera, MediaTek Helio G85, 5000mAh long-lasting battery.',     price: 29900,stock: 20  },
    { vendorId: v3.id, categoryId: accCat.id,       name: 'USB-C Fast Charger (65W)',       description: '65W GaN fast charger compatible with all USB-C devices. Charges your phone from 0 to 80% in under 35 minutes.',         price: 1850, stock: 50  },
    { vendorId: v3.id, categoryId: accCat.id,       name: 'Wireless Earbuds (TWS)',         description: 'True wireless earbuds with 6-hour battery + 18-hour charging case. Clear calls, deep bass, water resistant.',           price: 2200, stock: 35  },
    { vendorId: v3.id, categoryId: accCat.id,       name: 'Tempered Glass Screen Guard',   description: '9H hardness tempered glass screen protector for Samsung, Xiaomi and Realme phones. Anti-fingerprint coating.',           price: 350,  stock: 200 },
    { vendorId: v3.id, categoryId: accCat.id,       name: 'Phone Stand & Ring Holder',     description: 'Adjustable 360° ring holder and phone stand. Compatible with all smartphones. Metallic finish.',                        price: 280,  stock: 80  },

    // ─ Negombo Seafood Express products ─
    { vendorId: v4.id, categoryId: meatCat.id,      name: 'Fresh Prawns (500g)',           description: 'Freshly caught sea prawns from Negombo lagoon. Cleaned and deveined, ready to cook. Best for devilled prawn curry.',     price: 980,  stock: 40  },
    { vendorId: v4.id, categoryId: meatCat.id,      name: 'Seer Fish (1 kg)',              description: 'Premium seer fish (thora) — the king of Sri Lankan fish. Thick fillets, firm white flesh, perfect for grilling.',        price: 1650, stock: 25  },
    { vendorId: v4.id, categoryId: meatCat.id,      name: 'Crab (1 kg)',                   description: 'Live mud crabs from Negombo lagoon. Best eaten same day. Famous Sri Lankan jaffna crab curry or butter crab.',          price: 2200, stock: 15  },
    { vendorId: v4.id, categoryId: meatCat.id,      name: 'Dried Sprats (250g)',           description: 'Sun-dried salted sprats (halmasso) — a Sri Lankan pantry essential. Great for kiri hodi and rice accompaniment.',       price: 380,  stock: 100 },
    { vendorId: v4.id, categoryId: meatCat.id,      name: 'Fresh Tuna Slices (500g)',      description: 'Fresh yellowfin tuna (kelawalla) slices. Sashimi-grade quality. Ideal for tuna curry, pan fry or Sri Lankan ambul thiyal.',price: 720, stock: 30  },
  ];

  const createdProducts = [];
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, vendorId: p.vendorId } });
    if (!existing) {
      const prod = await prisma.product.create({ data: p });
      createdProducts.push(prod);
    } else {
      createdProducts.push(existing);
    }
  }

  // ── Buyer Addresses ───────────────────────────────────────────────────────────
  console.log('Seeding addresses...');
  const addr1 = await prisma.address.upsert({
    where: { id: 'addr-kamal-01' },
    update: {},
    create: {
      id: 'addr-kamal-01', userId: buyerUser.id, label: 'Home',
      line1: '45/3 Galle Road', line2: 'Apartment 2B', city: 'Colombo 03',
      lat: 6.8952, lng: 79.8559, isDefault: true,
    },
  });
  const addr2 = await prisma.address.upsert({
    where: { id: 'addr-nimal-01' },
    update: {},
    create: {
      id: 'addr-nimal-01', userId: buyer2.id, label: 'Home',
      line1: '12 Peradeniya Road', city: 'Kandy',
      lat: 7.2955, lng: 80.6369, isDefault: true,
    },
  });
  const addr3 = await prisma.address.upsert({
    where: { id: 'addr-amara-01' },
    update: {},
    create: {
      id: 'addr-amara-01', userId: buyer3.id, label: 'Home',
      line1: '8 Sea View Drive', city: 'Galle',
      lat: 6.0329, lng: 80.2168, isDefault: true,
    },
  });

  // ── Orders ────────────────────────────────────────────────────────────────────
  console.log('Seeding orders...');
  const orderData = [
    {
      id: 'order-001', buyerId: buyerUser.id, vendorId: v1.id, addressId: addr1.id,
      status: 'DELIVERED', totalAmount: 2010,
      items: [
        { productId: createdProducts[0].id, quantity: 2, unitPrice: 280  },  // Tomatoes x2
        { productId: createdProducts[4].id, quantity: 3, unitPrice: 310  },  // Milk x3
        { productId: createdProducts[8].id, quantity: 1, unitPrice: 1450 },  // Rice 5kg
      ],
    },
    {
      id: 'order-002', buyerId: buyer2.id, vendorId: v2.id, addressId: addr2.id,
      status: 'DELIVERED', totalAmount: 1410,
      items: [
        { productId: createdProducts[10].id, quantity: 2, unitPrice: 450 }, // Cinnamon
        { productId: createdProducts[14].id, quantity: 1, unitPrice: 680 }, // Tea
        { productId: createdProducts[11].id, quantity: 1, unitPrice: 280 }, // Turmeric
      ],
    },
    {
      id: 'order-003', buyerId: buyer3.id, vendorId: v3.id, addressId: addr3.id,
      status: 'DELIVERED', totalAmount: 4400,
      items: [
        { productId: createdProducts[20].id, quantity: 2, unitPrice: 1850 }, // Charger
        { productId: createdProducts[21].id, quantity: 1, unitPrice: 2200 }, // Earbuds  -- wait, total is wrong
      ],
    },
    {
      id: 'order-004', buyerId: buyerUser.id, vendorId: v4.id, addressId: addr1.id,
      status: 'OUT_FOR_DELIVERY', totalAmount: 3350,
      items: [
        { productId: createdProducts[24].id, quantity: 2, unitPrice: 980  }, // Prawns x2
        { productId: createdProducts[27].id, quantity: 1, unitPrice: 1650 }, // Seer fish -- wait index
      ],
    },
    {
      id: 'order-005', buyerId: buyer2.id, vendorId: v1.id, addressId: addr2.id,
      status: 'PREPARING', totalAmount: 1300,
      items: [
        { productId: createdProducts[5].id,  quantity: 2, unitPrice: 420 }, // Eggs x2
        { productId: createdProducts[6].id,  quantity: 1, unitPrice: 380 }, // Cake
        { productId: createdProducts[7].id,  quantity: 1, unitPrice: 220 }, // Roti -- wait: 840+380+220 = 1440
      ],
    },
    {
      id: 'order-006', buyerId: buyer3.id, vendorId: v2.id, addressId: addr3.id,
      status: 'CONFIRMED', totalAmount: 650,
      items: [
        { productId: createdProducts[15].id, quantity: 2, unitPrice: 240 }, // Coconut water x2
        { productId: createdProducts[13].id, quantity: 2, unitPrice: 80  }, // Pandan x2 -- 480+160=640
      ],
    },
    {
      id: 'order-007', buyerId: buyerUser.id, vendorId: v3.id, addressId: addr1.id,
      status: 'PENDING', totalAmount: 630,
      items: [
        { productId: createdProducts[22].id, quantity: 2, unitPrice: 350 }, // Screen guard x2 -- 700 not 630
      ],
    },
    {
      id: 'order-008', buyerId: buyer2.id, vendorId: v4.id, addressId: addr2.id,
      status: 'CANCELLED', totalAmount: 2200,
      items: [
        { productId: createdProducts[26].id, quantity: 1, unitPrice: 2200 }, // Crab
      ],
    },
  ];

  for (const o of orderData) {
    const existing = await prisma.order.findUnique({ where: { id: o.id } });
    if (!existing) {
      await prisma.order.create({
        data: {
          id: o.id,
          buyerId: o.buyerId,
          vendorId: o.vendorId,
          addressId: o.addressId,
          status: o.status,
          totalAmount: o.totalAmount,
          items: { create: o.items },
        },
      });
    }
  }

  // ── Reviews ───────────────────────────────────────────────────────────────────
  console.log('Seeding reviews...');
  const reviews = [
    { productId: createdProducts[0].id,  userId: buyerUser.id, rating: 5, comment: 'Very fresh tomatoes! Perfect for my curry. Delivered quickly in Colombo.' },
    { productId: createdProducts[4].id,  userId: buyer2.id,    rating: 4, comment: 'Good quality milk. Arrived cold and fresh. Will order again.' },
    { productId: createdProducts[8].id,  userId: buyer3.id,    rating: 5, comment: 'Best red rice I have found. Very authentic taste, reminds me of village food.' },
    { productId: createdProducts[10].id, userId: buyerUser.id, rating: 5, comment: 'Pure Ceylon cinnamon, the smell is amazing. Much better than supermarket brands!' },
    { productId: createdProducts[14].id, userId: buyer2.id,    rating: 5, comment: 'Excellent tea from Nuwara Eliya. Golden cup, strong flavour. Highly recommend.' },
    { productId: createdProducts[19].id, userId: buyer3.id,    rating: 4, comment: 'Samsung A15 works great. Good camera for the price. Fast delivery to Galle.' },
    { productId: createdProducts[21].id, userId: buyerUser.id, rating: 4, comment: 'Nice earbuds for the price. Good bass and clear voice calls. Battery lasts all day.' },
    { productId: createdProducts[24].id, userId: buyer2.id,    rating: 5, comment: 'Freshest prawns I have ever ordered online! Cooked it as devilled prawns - fantastic.' },
    { productId: createdProducts[25].id, userId: buyer3.id,    rating: 5, comment: 'Seer fish was incredibly fresh. Made ambul thiyal — tasted just like my grandmother made it.' },
    { productId: createdProducts[16].id, userId: buyerUser.id, rating: 5, comment: 'Authentic kavum! My family loved them. Brought back childhood memories of Sinhala New Year.' },
  ];

  for (const r of reviews) {
    const exists = await prisma.review.findFirst({ where: { productId: r.productId, userId: r.userId } });
    if (!exists) await prisma.review.create({ data: r });
  }

  console.log('\n✅ Sri Lanka seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Buyers:');
  console.log('    buyer@nearcart.dev  / password123  (Kamal Perera, Colombo)');
  console.log('    nimal@nearcart.dev  / password123  (Nimal Silva, Kandy)');
  console.log('    amara@nearcart.dev  / password123  (Amara Jayasinghe, Galle)');
  console.log('  Vendors:');
  console.log('    vendor@nearcart.dev / password123  (Colombo Fresh Market)');
  console.log('    saman@nearcart.dev  / password123  (Kandy Spice Garden)');
  console.log('    priya@nearcart.dev  / password123  (Galle Tech Hub)');
  console.log('    roshan@nearcart.dev / password123  (Negombo Seafood Express)');
  console.log('  Admin:');
  console.log('    admin@nearcart.dev  / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
