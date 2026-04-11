import type { Request, Response } from 'express';

import { uploadToCloudinary } from '@/services/fileUploadService';
import * as offerService from '@/services/offerService';

export async function createOffer(req: Request, res: Response): Promise<void> {
  const ownerId = req.user?.id;
  const file = req.file as Express.Multer.File | undefined;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/offers');
      imageUrl = uploadResult.url;
    }

    const offer = await offerService.createOffer(ownerId, req.body, imageUrl);

    res.status(201).json({
      message: 'Offer created successfully',
      data: offer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Unauthorized: You do not own this salon' ||
        error.message === 'Unauthorized: You do not own this offer'
      ) {
        res.status(403).json({ message: error.message });
        return;
      }
      if (
        error.message === 'Salon not found' ||
        error.message === 'Offer not found' ||
        error.message === 'Product ID is required for product offers' ||
        error.message === 'Service ID is required for service offers' ||
        error.message === 'Invalid product or product does not belong to this salon' ||
        error.message === 'Invalid service or service does not belong to this salon' ||
        error.message === 'End date must be after start date'
      ) {
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

export async function updateOffer(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;
  const file = req.file as Express.Multer.File | undefined;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/offers');
      imageUrl = uploadResult.url;
    }

    const offer = await offerService.updateOffer(id, ownerId, req.body, imageUrl);

    res.status(200).json({
      message: 'Offer updated successfully',
      data: offer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized: You do not own this offer') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (
        error.message === 'Offer not found' ||
        error.message === 'End date must be after start date' ||
        error.message === 'Product ID is required when offer type is product' ||
        error.message === 'Service ID is required when offer type is service' ||
        error.message === 'Invalid product or product does not belong to this salon' ||
        error.message === 'Invalid service or service does not belong to this salon'
      ) {
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

export async function toggleOfferActive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;
  const { isActive } = req.body;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const offer = await offerService.toggleOfferActive(id, ownerId);

    res.status(200).json({
      message: `Offer ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: offer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized: You do not own this offer') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message === 'Offer not found') {
        res.status(404).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteOffer(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    await offerService.deleteOffer(id, ownerId);

    res.status(200).json({
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized: You do not own this offer') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message === 'Offer not found') {
        res.status(404).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function listOffers(req: Request, res: Response): Promise<void> {
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const filters = {
      salonId: req.query.salonId as string | undefined,
      productId: req.query.productId as string | undefined,
      serviceId: req.query.serviceId as string | undefined,
      offerType: req.query.offerType as string | undefined,
      activeOnly: req.query.activeOnly ? req.query.activeOnly === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await offerService.listOffersForSalon(filters, ownerId);

    res.status(200).json({
      message: 'Offers retrieved successfully',
      data: result.offers,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getOffer(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const offer = await offerService.getOfferById(id);

    if (!offer) {
      res.status(404).json({ message: 'Offer not found' });
      return;
    }

    res.status(200).json({
      message: 'Offer fetched successfully',
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getActiveOffers(req: Request, res: Response): Promise<void> {
  try {
    const filters = {
      salonId: req.query.salonId as string | undefined,
      productId: req.query.productId as string | undefined,
      serviceId: req.query.serviceId as string | undefined,
      offerType: req.query.offerType as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await offerService.getActiveOffers(filters);

    res.status(200).json({
      message: 'Active offers retrieved successfully',
      data: result.offers,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getOfferByIdPublic(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const offer = await offerService.getOfferById(id);

    if (!offer) {
      res.status(404).json({ message: 'Offer not found' });
      return;
    }

    res.status(200).json({
      message: 'Offer fetched successfully',
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function validateOffer(req: Request, res: Response): Promise<void> {
  const { offerId, amount, salonId, productId, serviceId } = req.body;

  try {
    const result = await offerService.validateAndCalculateDiscount(offerId, amount, {
      salonId,
      productId,
      serviceId,
    });

    if (result.valid) {
      res.status(200).json({
        message: 'Offer validated successfully',
        data: {
          valid: result.valid,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
        },
      });
    } else {
      res.status(400).json({
        message: 'Offer validation failed',
        error: result.error,
        data: {
          valid: result.valid,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
