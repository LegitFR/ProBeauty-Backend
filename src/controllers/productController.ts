import type { Request, Response } from 'express';

import { uploadMultipleToCloudinary } from '@/services/fileUploadService';
import * as productService from '@/services/productService';

export async function createProduct(req: Request, res: Response): Promise<void> {
  const { salonId, title, sku, price, quantity } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await uploadMultipleToCloudinary(files);
      imageUrls = uploadResults.map((result) => result.url);
    }

    const product = await productService.createProduct(ownerId, {
      salonId,
      title,
      sku,
      price,
      quantity,
      images: imageUrls.length > 0 ? imageUrls : [],
    });

    const productData = {
      ...product,
      images: product.images || [],
    };

    res.status(201).json({
      message: 'Product created successfully',
      data: productData,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized: You do not own this salon') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message === 'SKU already exists') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const product = await productService.getProductById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const productData = {
      ...product,
      images: product.images || [],
    };

    res.status(200).json({
      message: 'Product fetched successfully',
      data: productData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  const { page, limit, salonId, minPrice, maxPrice, inStock } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      salonId: salonId as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock ? inStock === 'true' : undefined,
    };

    const result = await productService.getAllProducts(filters);

    const productsData = result.products.map((product) => ({
      ...product,
      images: product.images || [],
    }));

    res.status(200).json({
      message: 'Products retrieved successfully',
      data: productsData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getProductsBySalon(req: Request, res: Response): Promise<void> {
  const { salonId } = req.params;
  const { page, limit, minPrice, maxPrice, inStock } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock ? inStock === 'true' : undefined,
    };

    const result = await productService.getProductsBySalonId(salonId, filters);

    const productsData = result.products.map((product) => ({
      ...product,
      images: product.images || [],
    }));

    res.status(200).json({
      message: 'Salon products retrieved successfully',
      data: productsData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { title, sku, price, quantity } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrls: string[] | undefined;

    if (files && files.length > 0) {
      const uploadResults = await uploadMultipleToCloudinary(files);
      imageUrls = uploadResults.map((result) => result.url);
    }

    const product = await productService.updateProduct(id, ownerId, {
      title,
      sku,
      price,
      quantity,
      images: imageUrls,
    });

    if (!product) {
      res.status(403).json({ message: 'Unauthorized: You do not own this product' });
      return;
    }

    const productData = {
      ...product,
      images: product.images || [],
    };

    res.status(200).json({
      message: 'Product updated successfully',
      data: productData,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SKU already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const result = await productService.deleteProduct(id, ownerId);

    if (!result) {
      res.status(403).json({ message: 'Unauthorized: You do not own this product' });
      return;
    }

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function searchProducts(req: Request, res: Response): Promise<void> {
  const { q, page, limit, salonId, minPrice, maxPrice, inStock } = req.query;

  try {
    const filters = {
      query: q as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      salonId: salonId as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock ? inStock === 'true' : undefined,
    };

    const result = await productService.searchProducts(filters);

    const productsData = result.products.map((product) => ({
      ...product,
      images: product.images || [],
    }));

    res.status(200).json({
      message: 'Products search completed successfully',
      data: productsData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
