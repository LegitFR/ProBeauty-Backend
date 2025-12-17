import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
      ) as unknown as null,
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export const uploadProductImages = upload.array('images', 5);

export const uploadSalonImages = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

export const uploadServiceImage = upload.single('image');

export const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per file.',
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
    return;
  }

  next();
};

/**
 * Middleware to parse JSON strings in multipart/form-data requests
 * This is needed because multipart/form-data sends complex objects as JSON strings
 * and Zod validation expects actual objects
 */
export const parseMultipartJsonFields = (req: Request, res: Response, next: NextFunction): void => {
  const parseJsonField = (field: unknown): unknown => {
    if (!field) return field;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        // If parsing fails, return the original value
        // Validation will catch invalid formats
        return field;
      }
    }
    // Already an object/array or some other non-string value – return as is
    return field;
  };

  // Parse geo and hours fields if they exist
  if (req.body) {
    if ('geo' in req.body) {
      req.body.geo = parseJsonField(req.body.geo);
    }
    if ('hours' in req.body) {
      req.body.hours = parseJsonField(req.body.hours);
    }
  }

  next();
};
