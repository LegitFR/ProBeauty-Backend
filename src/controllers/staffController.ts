import type { NextFunction, Request, Response } from 'express';

import { uploadToCloudinary } from '@/services/fileUploadService';
import * as staffReviewService from '@/services/staffReviewService';
import * as staffService from '@/services/staffService';

export async function createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { name, salonId, serviceId, availability, userId } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
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
      success: true,
      message: 'Staff member created successfully',
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;

  try {
    const staff = await staffService.getStaffById(id);

    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    const staffData = {
      ...staff,
      availability: staff.availability ? JSON.parse(staff.availability as unknown as string) : null,
    };

    res.status(200).json({
      success: true,
      message: 'Staff member fetched successfully',
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { page, limit, salonId, serviceId } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      salonId: salonId as string | undefined,
      serviceId: serviceId as string | undefined,
    };

    const result = await staffService.getAllStaff(filters);

    const staffData = result.staff.map((s) => ({
      ...s,
      availability: s.availability ? JSON.parse(s.availability as unknown as string) : null,
    }));

    res.status(200).json({
      success: true,
      message: 'Staff members retrieved successfully',
      data: staffData,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffBySalon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { salonId } = req.params;
  const { page, limit, serviceId } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      serviceId: serviceId as string | undefined,
    };

    const result = await staffService.getStaffBySalonId(salonId, filters);

    const staffData = result.staff.map((s) => ({
      ...s,
      availability: s.availability ? JSON.parse(s.availability as unknown as string) : null,
    }));

    res.status(200).json({
      success: true,
      message: 'Salon staff retrieved successfully',
      data: staffData,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const { name, serviceId, availability, userId } = req.body;
  const file = req.file as Express.Multer.File | undefined;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
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
      res.status(403).json({ success: false, message: 'You do not own this staff member' });
      return;
    }

    const staffData = {
      ...staff,
      availability: staff.availability ? JSON.parse(staff.availability as unknown as string) : null,
    };

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id } = req.params;
  const ownerId = req.user?.id;

  if (!ownerId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const result = await staffService.deleteStaff(id, ownerId);

    if (!result) {
      res.status(403).json({ success: false, message: 'You do not own this staff member' });
      return;
    }

    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableStaffByDate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
    next(error);
  }
}

export async function getStaffAvailabilityForDate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { staffId } = req.params;
  const { date } = req.query;

  try {
    const result = await staffService.getStaffAvailabilityWithBookings({
      staffId,
      date: date as string,
    });

    if (!result) {
      res.status(404).json({ success: false, message: 'Staff member not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Staff availability retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Staff Review Controllers

export async function createStaffReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { staffId, bookingId, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const review = await staffReviewService.createStaffReview({
      userId,
      staffId,
      bookingId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Staff review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;

  try {
    const review = await staffReviewService.getStaffReviewById(id);

    if (!review) {
      res.status(404).json({ success: false, message: 'Staff review not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Staff review retrieved successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { staffId } = req.params;
  const { page, limit } = req.query;

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await staffReviewService.getReviewsByStaffId(staffId, filters);

    res.status(200).json({
      success: true,
      message: 'Staff reviews retrieved successfully',
      data: result.reviews,
      averageRating: result.averageRating,
      totalRatings: result.totalRatings,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyStaffReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { page, limit } = req.query;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const filters = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await staffReviewService.getReviewsByUserId(userId, filters);

    res.status(200).json({
      success: true,
      message: 'Staff reviews retrieved successfully',
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStaffReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const review = await staffReviewService.updateStaffReview(id, userId, { rating, comment });

    res.status(200).json({
      success: true,
      message: 'Staff review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStaffReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    await staffReviewService.deleteStaffReview(id, userId);

    res.status(200).json({ success: true, message: 'Staff review deleted successfully' });
  } catch (error) {
    next(error);
  }
}
