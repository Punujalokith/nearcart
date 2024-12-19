import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Groceries',    slug: 'groceries',    children: ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery'] },
  { name: 'Electronics',  slug: 'electronics',  children: ['Phones', 'Accessories', 'Computers'] },
  { name: 'Fashion',      slug: 'fashion',       children: ["Men's Clothing", "Women's Clothing", 'Footwear'] },
  { name: 'Home & Garden',slug: 'home-garden',  children: ['Furniture', 'Kitchen', 'Garden'] },
  { name: 'Health',       slug: 'health',        children: ['Medicine', 'Personal Care', 'Fitness'] },
  { name: 'Food & Drinks',slug: 'food-drinks',  children: ['Restaurants', 'Beverages', 'Snacks'] },
];

async function main() {
  console.log('Seeding categories...');

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    });

    for (const childName of cat.children) {
      const childSlug = childName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: { name: childName, slug: childSlug, parentId: parent.id },
      });
    }
  }

  console.log('Seeding test users...');

  const buyerHash  = await bcrypt.hash('password123', 10);
  const vendorHash = await bcrypt.hash('password123', 10);
  const adminHash  = await bcrypt.hash('admin123',    12);

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@nearcart.dev' },
    update: {},
    create: {
      email: 'buyer@nearcart.dev',
      passwordHash: buyerHash,
      name: 'Test Buyer',
      role: 'BUYER',
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@nearcart.dev' },
    update: {},
    create: {
      email: 'vendor@nearcart.dev',
      passwordHash: vendorHash,
      name: 'Test Vendor',
      role: 'VENDOR',
    },
  });

  await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'Demo Store',
      description: 'A test vendor store for development',
      isApproved: true,
      city: 'Kuala Lumpur',
      lat: 3.1390,
      lng: 101.6869,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@nearcart.dev' },
    update: {},
    create: {
      email: 'admin@nearcart.dev',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Seed complete.');
  console.log('  buyer@nearcart.dev   / password123');
  console.log('  vendor@nearcart.dev  / password123');
  console.log('  admin@nearcart.dev   / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
