import type { Request, Response } from 'express';

import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from '@/services/fileUploadService';
import * as salonService from '@/services/salonService';

export async function createSalon(req: Request, res: Response): Promise<void> {
  const { name, address, phone, geo, hours } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let thumbnailUrl: string | undefined;
    let imageUrls: string[] = [];

    // Handle thumbnail upload
    if (files?.thumbnail && files.thumbnail.length > 0) {
      const uploadResult = await uploadToCloudinary(files.thumbnail[0].buffer, 'probeauty/salons');
      thumbnailUrl = uploadResult.url;
    }

    // Handle gallery images upload
    if (files?.images && files.images.length > 0) {
      const uploadResults = await uploadMultipleToCloudinary(files.images, 'probeauty/salons');
      imageUrls = uploadResults.map((result) => result.url);
    }

    const salon = await salonService.createSalon(ownerId, {
      name,
      address,
      phone,
      geo,
      hours,
      thumbnail: thumbnailUrl,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    });

    const salonData = {
      ...salon,
      geo: salon.geo ? JSON.parse(salon.geo as unknown as string) : null,
      hours: salon.hours ? JSON.parse(salon.hours as unknown as string) : null,
      images: (salon as { images?: unknown }).images
        ? JSON.parse((salon as { images: string }).images)
        : null,
    };

    res.status(201).json({
      message: 'Salon registered successfully',
      data: salonData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getSalon(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const salon = await salonService.getSalonById(id);

    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    // Parse JSON fields
    const salonData = {
      ...salon,
      geo: salon.geo ? JSON.parse(salon.geo as unknown as string) : null,
      hours: salon.hours ? JSON.parse(salon.hours as unknown as string) : null,
      images: (salon as { images?: unknown }).images
        ? JSON.parse((salon as { images: string }).images)
        : null,
    };

    res.status(200).json({
      message: 'Salon fetched successfully',
      data: salonData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getSalonsByOwner(req: Request, res: Response): Promise<void> {
  const ownerId = req.user?.id;
  const { page, limit, verified } = req.query;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      verified: verified ? verified === 'true' : undefined,
    };

    const result = await salonService.getSalonsByOwnerId(ownerId, filters);

    // Parse JSON fields for all salons
    const salonsData = result.salons.map((salon) => ({
      ...salon,
      geo: salon.geo ? JSON.parse(salon.geo as unknown as string) : null,
      hours: salon.hours ? JSON.parse(salon.hours as unknown as string) : null,
      images: (salon as { images?: unknown }).images
        ? JSON.parse((salon as { images: string }).images)
        : null,
    }));

    res.status(200).json({
      message: 'Salons retrieved successfully',
      data: salonsData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateSalon(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, address, phone, geo, hours } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let thumbnailUrl: string | undefined;
    let imageUrls: string[] | undefined;

    // Handle thumbnail upload
    if (files?.thumbnail && files.thumbnail.length > 0) {
      const uploadResult = await uploadToCloudinary(files.thumbnail[0].buffer, 'probeauty/salons');
      thumbnailUrl = uploadResult.url;
    }

    // Handle gallery images upload
    if (files?.images && files.images.length > 0) {
      const uploadResults = await uploadMultipleToCloudinary(files.images, 'probeauty/salons');
      imageUrls = uploadResults.map((result) => result.url);
    }

    const salon = await salonService.updateSalon(id, ownerId, {
      name,
      address,
      phone,
      geo,
      hours,
      thumbnail: thumbnailUrl,
      images: imageUrls,
    });

    if (!salon) {
      res.status(403).json({ message: 'Unauthorized: You do not own this salon' });
      return;
    }

    // Parse JSON fields
    const salonData = {
      ...salon,
      geo: salon.geo ? JSON.parse(salon.geo as unknown as string) : null,
      hours: salon.hours ? JSON.parse(salon.hours as unknown as string) : null,
      images: (salon as { images?: unknown }).images
        ? JSON.parse((salon as { images: string }).images)
        : null,
    };

    res.status(200).json({
      message: 'Salon updated successfully',
      data: salonData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteSalon(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const result = await salonService.deleteSalon(id, ownerId);

    if (!result) {
      res.status(403).json({ message: 'Unauthorized: You do not own this salon' });
      return;
    }

    res.status(200).json({
      message: 'Salon deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getAllSalons(req: Request, res: Response): Promise<void> {
  const { page, limit, verified } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      verified: verified ? verified === 'true' : undefined,
    };

    const result = await salonService.getAllSalons(filters);

    // Parse JSON fields for all salons
    const salonsData = result.salons.map((salon) => ({
      ...salon,
      geo: salon.geo ? JSON.parse(salon.geo as unknown as string) : null,
      hours: salon.hours ? JSON.parse(salon.hours as unknown as string) : null,
      images: (salon as { images?: unknown }).images
        ? JSON.parse((salon as { images: string }).images)
        : null,
    }));

    res.status(200).json({
      message: 'All salons retrieved successfully',
      data: salonsData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
