import type { Request, Response } from 'express';

import { uploadToCloudinary } from '@/services/fileUploadService';
import * as salonService from '@/services/salonService';
import * as serviceService from '@/services/serviceService';

/**
 * Create a new service
 * POST /api/v1/services
 */
export async function createService(req: Request, res: Response): Promise<void> {
  const { salonId, title, category, durationMinutes, price } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Verify the user owns the salon
  const salonData = await salonService.getSalonById(salonId);

  if (!salonData || salonData.ownerId !== userId) {
    res
      .status(403)
      .json({ message: 'You do not have permission to create services for this salon' });
    return;
  }

  let imageUrl: string | undefined;

  // Handle image upload
  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/services');
    imageUrl = uploadResult.url;
  }

  const service = await serviceService.createService({
    salonId,
    title,
    category,
    durationMinutes,
    price,
    image: imageUrl,
  });

  res.status(201).json({
    message: 'Service created successfully',
    data: service,
  });
}

/**
 * Get a single service by ID
 * GET /api/v1/services/:id
 */
export async function getService(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const service = await serviceService.getServiceById(id);

  if (!service) {
    res.status(404).json({ message: 'Service not found' });
    return;
  }

  res.status(200).json({
    message: 'Service retrieved successfully',
    data: service,
  });
}

/**
 * Get all services (optionally filtered by salonId query parameter)
 * GET /api/v1/services
 * GET /api/v1/services?salonId=xxx
 */
export async function getAllServices(req: Request, res: Response): Promise<void> {
  const { salonId } = req.query;

  // If salonId is provided, filter services by salon
  if (salonId && typeof salonId === 'string') {
    const services = await serviceService.getServicesBySalonId(salonId);

    res.status(200).json({
      message: 'Services retrieved successfully',
      data: services,
    });
    return;
  }

  // Otherwise, return all services
  const services = await serviceService.getAllServices();

  res.status(200).json({
    message: 'All services retrieved successfully',
    data: services,
  });
}

/**
 * Update a service
 * PUT /api/v1/services/:id
 */
export async function updateService(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { title, category, durationMinutes, price } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Verify ownership
  const hasOwnership = await serviceService.verifyServiceOwnership(id, userId);

  if (!hasOwnership) {
    res.status(403).json({ message: 'You do not have permission to update this service' });
    return;
  }

  let imageUrl: string | undefined;

  // Handle image upload
  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/services');
    imageUrl = uploadResult.url;
  }

  const service = await serviceService.updateService(id, {
    title,
    category,
    durationMinutes,
    price,
    image: imageUrl,
  });

  res.status(200).json({
    message: 'Service updated successfully',
    data: service,
  });
}

/**
 * Delete a service
 * DELETE /api/v1/services/:id
 */
export async function deleteService(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Verify ownership
  const hasOwnership = await serviceService.verifyServiceOwnership(id, userId);

  if (!hasOwnership) {
    res.status(403).json({ message: 'You do not have permission to delete this service' });
    return;
  }

  await serviceService.deleteService(id);

  res.status(200).json({
    message: 'Service deleted successfully',
  });
}
