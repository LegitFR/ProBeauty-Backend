import { prisma } from '@/configs/db';

type FavouriteType = 'product' | 'salon';

interface GetFavouritesFilters {
  type: FavouriteType;
  page?: number;
  limit?: number;
}

export async function addFavourite(userId: string, type: FavouriteType, itemId: string) {
  if (type === 'product') {
    const product = await prisma.product.findUnique({ where: { id: itemId } });
    if (!product) throw new Error('Product not found');

    const existing = await prisma.favourite.findUnique({
      where: { userId_productId: { userId, productId: itemId } },
    });
    if (existing) throw new Error('Product already in favourites');

    return prisma.favourite.create({
      data: { userId, productId: itemId },
      include: {
        product: {
          include: { salon: { select: { id: true, name: true } } },
        },
      },
    });
  }

  const salon = await prisma.salon.findUnique({ where: { id: itemId } });
  if (!salon) throw new Error('Salon not found');

  const existing = await prisma.salonFavourite.findUnique({
    where: { userId_salonId: { userId, salonId: itemId } },
  });
  if (existing) throw new Error('Salon already in favourites');

  return prisma.salonFavourite.create({
    data: { userId, salonId: itemId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          address: true,
          thumbnail: true,
          venueType: true,
          verified: true,
        },
      },
    },
  });
}

export async function removeFavourite(userId: string, type: FavouriteType, itemId: string) {
  if (type === 'product') {
    const favourite = await prisma.favourite.findUnique({
      where: { userId_productId: { userId, productId: itemId } },
    });
    if (!favourite) throw new Error('Favourite not found');

    return prisma.favourite.delete({
      where: { userId_productId: { userId, productId: itemId } },
    });
  }

  const favourite = await prisma.salonFavourite.findUnique({
    where: { userId_salonId: { userId, salonId: itemId } },
  });
  if (!favourite) throw new Error('Favourite not found');

  return prisma.salonFavourite.delete({
    where: { userId_salonId: { userId, salonId: itemId } },
  });
}

export async function getUserFavourites(userId: string, filters: GetFavouritesFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  if (filters.type === 'product') {
    const [favourites, total] = await Promise.all([
      prisma.favourite.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          product: {
            include: { salon: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favourite.count({ where: { userId } }),
    ]);

    return {
      favourites,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  const [favourites, total] = await Promise.all([
    prisma.salonFavourite.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            address: true,
            thumbnail: true,
            images: true,
            venueType: true,
            verified: true,
            geo: true,
            hours: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.salonFavourite.count({ where: { userId } }),
  ]);

  return {
    favourites,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function checkFavourite(
  userId: string,
  type: FavouriteType,
  itemId: string
): Promise<boolean> {
  if (type === 'product') {
    const favourite = await prisma.favourite.findUnique({
      where: { userId_productId: { userId, productId: itemId } },
    });
    return !!favourite;
  }

  const favourite = await prisma.salonFavourite.findUnique({
    where: { userId_salonId: { userId, salonId: itemId } },
  });
  return !!favourite;
}
