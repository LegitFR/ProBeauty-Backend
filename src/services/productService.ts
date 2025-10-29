import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';

interface CreateProductData {
  salonId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  images?: string[] | null;
}

interface UpdateProductData {
  title?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  images?: string[] | null;
}

interface GetProductsFilters {
  page?: number;
  limit?: number;
  salonId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export async function createProduct(ownerId: string, data: CreateProductData) {
  const salon = await prisma.salon.findUnique({
    where: { id: data.salonId },
  });

  if (!salon || salon.ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this salon');
  }

  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  });

  if (existingSku) {
    throw new Error('SKU already exists');
  }

  return prisma.product.create({
    data: {
      salonId: data.salonId,
      title: data.title,
      sku: data.sku,
      price: new Prisma.Decimal(data.price),
      quantity: data.quantity,
      images: data.images ? (JSON.stringify(data.images) as Prisma.InputJsonValue) : undefined,
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      salon: {
        select: { id: true, name: true, address: true },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

interface ProductsWhereClause {
  salonId?: string;
  price?: {
    gte?: Prisma.Decimal;
    lte?: Prisma.Decimal;
  };
  quantity?: {
    gt: number;
  };
}

export async function getAllProducts(filters?: GetProductsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: ProductsWhereClause = {};

  if (filters?.salonId) {
    where.salonId = filters.salonId;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = new Prisma.Decimal(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = new Prisma.Decimal(filters.maxPrice);
    }
  }

  if (filters?.inStock) {
    where.quantity = { gt: 0 };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductsBySalonId(salonId: string, filters?: GetProductsFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where: ProductsWhereClause = { salonId };

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = new Prisma.Decimal(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = new Prisma.Decimal(filters.maxPrice);
    }
  }

  if (filters?.inStock) {
    where.quantity = { gt: 0 };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true },
        },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateProduct(id: string, ownerId: string, data: UpdateProductData) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!product || product.salon.ownerId !== ownerId) {
    return null;
  }

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new Error('SKU already exists');
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      sku: data.sku,
      price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
      quantity: data.quantity,
      images:
        data.images !== undefined
          ? (JSON.stringify(data.images) as Prisma.InputJsonValue)
          : undefined,
    },
    include: {
      salon: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function deleteProduct(id: string, ownerId: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { salon: true },
  });

  if (!product || product.salon.ownerId !== ownerId) {
    return null;
  }

  return prisma.product.delete({
    where: { id },
  });
}
