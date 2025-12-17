import { prisma } from '@/configs/db';

interface GetFavouritesFilters {
  page?: number;
  limit?: number;
}

/**
 * Add a product to user's favourites
 */
export async function addFavourite(userId: string, productId: string) {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if already favourited
  const existingFavourite = await prisma.favourite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingFavourite) {
    throw new Error('Product already in favourites');
  }

  return prisma.favourite.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: {
        include: {
          salon: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Remove a product from user's favourites
 */
export async function removeFavourite(userId: string, productId: string) {
  // Check if favourite exists
  const favourite = await prisma.favourite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!favourite) {
    throw new Error('Favourite not found');
  }

  return prisma.favourite.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
}

/**
 * Get user's favourites with pagination
 */
export async function getUserFavourites(userId: string, filters?: GetFavouritesFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const [favourites, total] = await Promise.all([
    prisma.favourite.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        product: {
          include: {
            salon: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.favourite.count({ where: { userId } }),
  ]);

  return {
    favourites,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Check if a product is in user's favourites
 */
export async function checkFavourite(userId: string, productId: string): Promise<boolean> {
  const favourite = await prisma.favourite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return !!favourite;
}
