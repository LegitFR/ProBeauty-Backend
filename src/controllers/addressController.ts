import type { Request, Response } from 'express';

import * as addressService from '@/services/addressService';

/**
 * Create a new address
 * POST /api/v1/addresses
 */
export async function createAddress(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const address = await addressService.createAddress(userId, {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    res.status(201).json({
      message: 'Address created successfully',
      data: address,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to create address',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get all addresses for the authenticated user
 * GET /api/v1/addresses
 */
export async function getAddresses(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const addresses = await addressService.getAddressesByUser(userId);

    res.status(200).json({
      message: 'Addresses retrieved successfully',
      data: addresses,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to retrieve addresses',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Get a single address by ID
 * GET /api/v1/addresses/:id
 */
export async function getAddress(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const address = await addressService.getAddressById(id, userId);

    res.status(200).json({
      message: 'Address retrieved successfully',
      data: address,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to retrieve address',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Update an existing address
 * PATCH /api/v1/addresses/:id
 */
export async function updateAddress(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } =
      req.body;

    const address = await addressService.updateAddress(id, userId, {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
    });

    res.status(200).json({
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to update address',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Delete an address
 * DELETE /api/v1/addresses/:id
 */
export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    await addressService.deleteAddress(id, userId);

    res.status(200).json({
      message: 'Address deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to delete address',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Set an address as the default address
 * PATCH /api/v1/addresses/:id/set-default
 */
export async function setDefaultAddress(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const address = await addressService.setDefaultAddress(id, userId);

    res.status(200).json({
      message: 'Default address set successfully',
      data: address,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Address not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Unauthorized: You do not own this address') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to set default address',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
