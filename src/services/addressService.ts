import type { Address } from '@prisma/client';

import { prisma } from '@/configs/db';

/**
 * Interface for creating a new address
 */
interface CreateAddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: string;
  isDefault?: boolean;
}

/**
 * Interface for updating an address
 */
interface UpdateAddressData {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  addressType?: string;
}

/**
 * Create a new address for a user
 * If this is set as default or is the first address, it becomes the default address
 */
export async function createAddress(userId: string, data: CreateAddressData): Promise<Address> {
  // Check if user has any addresses
  const existingAddresses = await prisma.address.findMany({
    where: { userId },
  });

  // If this is the first address or explicitly set as default, make it default
  const shouldBeDefault = data.isDefault || existingAddresses.length === 0;

  // If setting as default, unset other default addresses
  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: {
      userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      addressType: data.addressType,
      isDefault: shouldBeDefault,
    },
  });
}

/**
 * Get all addresses for a user
 */
export async function getAddressesByUser(userId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

/**
 * Get a single address by ID
 * Throws error if address doesn't exist or doesn't belong to user
 */
export async function getAddressById(addressId: string, userId: string): Promise<Address> {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error('Address not found');
  }

  if (address.userId !== userId) {
    throw new Error('Unauthorized: You do not own this address');
  }

  return address;
}

/**
 * Update an existing address
 * Only the owner can update their address
 */
export async function updateAddress(
  addressId: string,
  userId: string,
  data: UpdateAddressData
): Promise<Address> {
  // Verify ownership
  const existingAddress = await getAddressById(addressId, userId);

  return prisma.address.update({
    where: { id: existingAddress.id },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      addressType: data.addressType,
    },
  });
}

/**
 * Delete an address
 * Only the owner can delete their address
 * If deleting the default address, automatically set another address as default
 */
export async function deleteAddress(addressId: string, userId: string): Promise<void> {
  // Verify ownership
  const address = await getAddressById(addressId, userId);

  // Delete the address
  await prisma.address.delete({
    where: { id: addressId },
  });

  // If the deleted address was default, set another address as default
  if (address.isDefault) {
    const remainingAddresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (remainingAddresses.length > 0) {
      await prisma.address.update({
        where: { id: remainingAddresses[0].id },
        data: { isDefault: true },
      });
    }
  }
}

/**
 * Set an address as the default address
 * Unsets all other addresses as default
 */
export async function setDefaultAddress(addressId: string, userId: string): Promise<Address> {
  // Verify ownership
  await getAddressById(addressId, userId);

  // Unset all other default addresses for this user
  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  // Set the specified address as default
  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}
