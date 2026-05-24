import type { Cart, CartItem, Product } from '@prisma/client';

import { prisma } from '@/configs/db';
import { AppError } from '@/utils/AppError';

/**
 * Extended CartItem with product details
 */
interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * Extended Cart with items and product details
 */
interface CartWithDetails extends Cart {
  cartItems: CartItemWithProduct[];
}

/**
 * Cart summary with calculated totals
 */
interface CartSummary {
  cart: CartWithDetails;
  summary: {
    totalItems: number;
    subtotal: number;
    itemCount: number;
  };
}

/**
 * Get or create a cart for a user
 */
export async function getOrCreateCart(userId: string): Promise<Cart> {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
}

/**
 * Add an item to the cart
 * If item already exists, increment the quantity
 */
export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemWithProduct> {
  // Verify product exists and has sufficient stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.quantity < quantity) {
    throw new AppError(`Insufficient stock. Only ${product.quantity} items available`, 400);
  }

  // Get or create cart
  const cart = await getOrCreateCart(userId);

  // Check if item already exists in cart
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingCartItem) {
    // Update existing cart item
    const newQuantity = existingCartItem.quantity + quantity;

    // Check if new quantity exceeds stock
    if (product.quantity < newQuantity) {
      throw new AppError(
        `Cannot add ${quantity} more items. Only ${product.quantity - existingCartItem.quantity} more available`,
        400
      );
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: newQuantity },
      include: { product: true },
    });

    return updatedCartItem;
  }

  // Create new cart item
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: { product: true },
  });

  return cartItem;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemWithProduct> {
  // Verify product exists and has sufficient stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.quantity < quantity) {
    throw new AppError(`Insufficient stock. Only ${product.quantity} items available`, 400);
  }

  // Get cart
  const cart = await getOrCreateCart(userId);

  // Find cart item
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (!cartItem) {
    throw new AppError('Item not found in cart', 404);
  }

  // Update quantity
  const updatedCartItem = await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
    include: { product: true },
  });

  return updatedCartItem;
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(userId: string, productId: string): Promise<void> {
  // Get cart
  const cart = await getOrCreateCart(userId);

  // Find cart item
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (!cartItem) {
    throw new AppError('Item not found in cart', 404);
  }

  // Delete cart item
  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });
}

/**
 * Clear all items from the cart
 */
export async function clearCart(userId: string): Promise<void> {
  // Get cart
  const cart = await getOrCreateCart(userId);

  // Delete all cart items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}

/**
 * Get cart with all items and product details
 * Includes calculated totals
 */
export async function getCartWithDetails(userId: string): Promise<CartSummary> {
  // Get or create cart
  const cart = await getOrCreateCart(userId);

  // Get cart with items and product details
  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      cartItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cartWithItems) {
    throw new AppError('Cart not found', 500);
  }

  // Calculate totals
  let subtotal = 0;
  let totalItems = 0;

  for (const item of cartWithItems.cartItems) {
    const itemTotal = parseFloat(item.product.price.toString()) * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;
  }

  return {
    cart: cartWithItems,
    summary: {
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      itemCount: cartWithItems.cartItems.length,
    },
  };
}

/**
 * Validate cart items before checkout
 * Checks stock availability for all items in cart
 */
export async function validateCartForCheckout(userId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const { cart } = await getCartWithDetails(userId);
  const errors: string[] = [];

  if (cart.cartItems.length === 0) {
    errors.push('Cart is empty');
  }

  for (const item of cart.cartItems) {
    // Check if product still exists
    if (!item.product) {
      errors.push(`Product ${item.productId} no longer exists`);
      continue;
    }

    // Check stock availability
    if (item.product.quantity < item.quantity) {
      errors.push(
        `Insufficient stock for ${item.product.title}. Only ${item.product.quantity} available, but ${item.quantity} requested`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
