import prisma from '../../config/database.js';

export async function listCategories() {
  // Return full tree: top-level categories with their children
  return prisma.category.findMany({
    where:   { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}
