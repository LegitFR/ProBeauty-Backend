import type { Request, Response } from 'express';

import { uploadToCloudinary } from '@/services/fileUploadService';
import * as staffService from '@/services/staffService';

export async function createStaff(req: Request, res: Response): Promise<void> {
  const { name, salonId, serviceId, availability, userId } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/staff');
      imageUrl = uploadResult.url;
    }

    const staff = await staffService.createStaff(ownerId, {
      name,
      salonId,
      serviceId,
      availability,
      userId,
      image: imageUrl,
    });

    const staffData = {
      ...staff,
      availability: staff.availability ? JSON.parse(staff.availability as unknown as string) : null,
    };

    res.status(201).json({
      message: 'Staff member created successfully',
      data: staffData,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized: You do not own this salon') {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error.message === 'User not found') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message.includes('Service not found or does not belong to this salon')) {
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

export async function getStaff(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const staff = await staffService.getStaffById(id);

    if (!staff) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    const staffData = {
      ...staff,
      availability: staff.availability ? JSON.parse(staff.availability as unknown as string) : null,
    };

    res.status(200).json({
      message: 'Staff member fetched successfully',
      data: staffData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getAllStaff(req: Request, res: Response): Promise<void> {
  const { page, limit, salonId } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      salonId: salonId as string | undefined,
    };

    const result = await staffService.getAllStaff(filters);

    const staffData = result.staff.map((s) => ({
      ...s,
      availability: s.availability ? JSON.parse(s.availability as unknown as string) : null,
    }));

    res.status(200).json({
      message: 'Staff members retrieved successfully',
      data: staffData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getStaffBySalon(req: Request, res: Response): Promise<void> {
  const { salonId } = req.params;
  const { page, limit } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await staffService.getStaffBySalonId(salonId, filters);

    const staffData = result.staff.map((s) => ({
      ...s,
      availability: s.availability ? JSON.parse(s.availability as unknown as string) : null,
    }));

    res.status(200).json({
      message: 'Salon staff retrieved successfully',
      data: staffData,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateStaff(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, serviceId, availability, userId } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    let imageUrl: string | undefined;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, 'probeauty/staff');
      imageUrl = uploadResult.url;
    }

    const staff = await staffService.updateStaff(id, ownerId, {
      name,
      serviceId,
      availability,
      userId,
      image: imageUrl,
    });

    if (!staff) {
      res.status(403).json({ message: 'Unauthorized: You do not own this staff member' });
      return;
    }

    const staffData = {
      ...staff,
      availability: staff.availability ? JSON.parse(staff.availability as unknown as string) : null,
    };

    res.status(200).json({
      message: 'Staff member updated successfully',
      data: staffData,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message.includes('Service not found or does not belong to this salon')) {
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

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const result = await staffService.deleteStaff(id, ownerId);

    if (!result) {
      res.status(403).json({ message: 'Unauthorized: You do not own this staff member' });
      return;
    }

    res.status(200).json({
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getAvailableStaffByDate(req: Request, res: Response): Promise<void> {
  const { salonId, serviceId, date } = req.query;

  try {
    const result = await staffService.getAvailableStaffByDate({
      salonId: salonId as string,
      serviceId: serviceId as string | undefined,
      date: date as string,
    });

    res.status(200).json({
      success: true,
      message: 'Available staff retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getStaffAvailabilityForDate(req: Request, res: Response): Promise<void> {
  const { staffId } = req.params;
  const { date } = req.query;

  try {
    const result = await staffService.getStaffAvailabilityWithBookings({
      staffId,
      date: date as string,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Staff availability retrieved successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
