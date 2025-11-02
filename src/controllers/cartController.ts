import type { Request, Response } from 'express';

import * as cartService from '@/services/cartService';

/**
 * Get the current user's cart with all items and calculated totals
 * GET /api/v1/cart
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const cartData = await cartService.getCartWithDetails(userId);

    res.status(200).json({
      message: 'Cart retrieved successfully',
      data: cartData,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to retrieve cart',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Add an item to the cart
 * POST /api/v1/cart/items
 */
export async function addItemToCart(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { productId, quantity } = req.body;

    const cartItem = await cartService.addItemToCart(userId, productId, quantity);

    res.status(201).json({
      message: 'Item added to cart successfully',
      data: cartItem,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('Insufficient stock') || error.message.includes('Cannot add')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to add item to cart',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Update cart item quantity
 * PATCH /api/v1/cart/items/:productId
 */
export async function updateCartItem(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const { quantity } = req.body;

    const cartItem = await cartService.updateCartItem(userId, productId, quantity);

    res.status(200).json({
      message: 'Cart item updated successfully',
      data: cartItem,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Item not found in cart') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('Insufficient stock')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to update cart item',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Remove an item from the cart
 * DELETE /api/v1/cart/items/:productId
 */
export async function removeCartItem(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    await cartService.removeCartItem(userId, productId);

    res.status(200).json({
      message: 'Item removed from cart successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Item not found in cart') {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({
        message: 'Failed to remove item from cart',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * Clear all items from the cart
 * DELETE /api/v1/cart
 */
export async function clearCart(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    await cartService.clearCart(userId);

    res.status(200).json({
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to clear cart',
        error: error.message,
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
