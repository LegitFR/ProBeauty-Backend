import type { NextFunction, Request, Response } from 'express';

import * as cartService from '@/services/cartService';

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const cartData = await cartService.getCartWithDetails(userId);

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartData,
    });
  } catch (error) {
    next(error);
  }
}

export async function addItemToCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const { productId, quantity } = req.body;

    const cartItem = await cartService.addItemToCart(userId, productId, quantity);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const { quantity } = req.body;

    const cartItem = await cartService.updateCartItem(userId, productId, quantity);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    await cartService.removeCartItem(userId, productId);

    res.status(200).json({ success: true, message: 'Item removed from cart successfully' });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    await cartService.clearCart(userId);

    res.status(200).json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
}
