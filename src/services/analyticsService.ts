/**
 * Analytics Service
 *
 * Business logic for calculating salon revenue analytics
 */

import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';
import { PAYMENT_STATUS } from '@/constants/paymentStatus';
import type { AnalyticsFilters, CategoryRevenue, SalonAnalytics } from '@/types/analytics';

/**
 * Get comprehensive revenue analytics for a salon
 * Calculates metrics from both product orders and service bookings
 *
 * @param salonId - The salon ID to get analytics for
 * @param filters - Optional date range filters
 * @returns Complete analytics data including revenue summary and category breakdowns
 */
export async function getSalonAnalytics(
  salonId: string,
  filters: AnalyticsFilters
): Promise<SalonAnalytics> {
  // Parse date filters
  const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
  const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

  // Execute queries in parallel for better performance
  const [productPayments, serviceBookings] = await Promise.all([
    getProductPayments(salonId, startDate, endDate),
    getServiceBookings(salonId, startDate, endDate),
  ]);

  // Calculate product revenue and categories
  let productRevenue = new Prisma.Decimal(0);
  const productCategories = new Map<string, { revenue: Prisma.Decimal; count: number }>();
  const productCustomers = new Set<string>();

  for (const payment of productPayments) {
    // Skip payments without an order (shouldn't happen with our query, but handle gracefully)
    if (!payment.order) {
      console.warn(`Payment ${payment.id} has no order - skipping from revenue`);
      continue;
    }

    productRevenue = productRevenue.add(payment.amount);
    productCustomers.add(payment.order.userId);

    // For MVP: All products grouped under "Products" category
    // TODO: Add category field to Product model for detailed categorization
    const category = 'Products';
    const existing = productCategories.get(category) || {
      revenue: new Prisma.Decimal(0),
      count: 0,
    };
    productCategories.set(category, {
      revenue: existing.revenue.add(payment.amount),
      count: existing.count + 1,
    });
  }

  // Calculate service revenue and categories
  let serviceRevenue = new Prisma.Decimal(0);
  const serviceCategories = new Map<string, { revenue: Prisma.Decimal; count: number }>();
  const serviceCustomers = new Set<string>();

  for (const booking of serviceBookings) {
    // Handle edge case: deleted services
    if (!booking.service) {
      console.warn(`Booking ${booking.id} has deleted service - skipping from revenue`);
      continue;
    }

    serviceRevenue = serviceRevenue.add(booking.service.price);
    serviceCustomers.add(booking.userId);

    const category = booking.service.category || 'Uncategorized';
    const existing = serviceCategories.get(category) || {
      revenue: new Prisma.Decimal(0),
      count: 0,
    };
    serviceCategories.set(category, {
      revenue: existing.revenue.add(booking.service.price),
      count: existing.count + 1,
    });
  }

  // Calculate summary metrics
  const totalRevenue = productRevenue.add(serviceRevenue);
  const totalTransactions = productPayments.length + serviceBookings.length;

  // Calculate 2% admin commission
  const ADMIN_COMMISSION_RATE = new Prisma.Decimal('0.02');
  const adminCommission = totalRevenue.mul(ADMIN_COMMISSION_RATE);
  const netProfit = totalRevenue.sub(adminCommission);

  // Count unique customers (deduplicate across both revenue streams)
  const allCustomers = new Set([...productCustomers, ...serviceCustomers]);
  const uniqueCustomers = allCustomers.size;

  // Calculate average transaction value per customer
  const avgTransactionValue =
    uniqueCustomers > 0
      ? totalRevenue.div(new Prisma.Decimal(uniqueCustomers))
      : new Prisma.Decimal(0);

  // Format response
  return {
    summary: {
      totalRevenue: totalRevenue.toFixed(2),
      totalTransactions,
      netProfit: netProfit.toFixed(2),
      adminCommission: adminCommission.toFixed(2),
      averageTransactionValue: avgTransactionValue.toFixed(2),
      uniqueCustomers,
    },
    productRevenue: {
      total: productRevenue.toFixed(2),
      byCategory: formatCategoryBreakdown(productCategories, productRevenue),
    },
    serviceRevenue: {
      total: serviceRevenue.toFixed(2),
      byCategory: formatCategoryBreakdown(serviceCategories, serviceRevenue),
    },
    timeRange: {
      startDate: startDate?.toISOString() || null,
      endDate: endDate?.toISOString() || null,
    },
  };
}

/**
 * Query all succeeded payments for product orders at a salon
 * Filters out refunded, failed, and pending payments
 *
 * @param salonId - The salon ID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of succeeded payments with order and user data
 */
async function getProductPayments(
  salonId: string,
  startDate?: Date,
  endDate?: Date
): Promise<
  {
    id: string;
    amount: Prisma.Decimal;
    order: {
      userId: string;
      orderItems: {
        product: {
          id: string;
          title: string;
        };
      }[];
    } | null;
  }[]
> {
  return prisma.payment.findMany({
    where: {
      status: PAYMENT_STATUS.SUCCEEDED, // Only count succeeded payments
      order: {
        orderItems: {
          some: {
            product: {
              salonId,
            },
          },
        },
      },
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    select: {
      id: true,
      amount: true,
      order: {
        select: {
          userId: true,
          orderItems: {
            select: {
              product: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Query all completed/confirmed bookings for a salon
 * Only includes bookings that are considered "paid"
 *
 * @param salonId - The salon ID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of bookings with service and user data
 */
async function getServiceBookings(
  salonId: string,
  startDate?: Date,
  endDate?: Date
): Promise<
  {
    id: string;
    userId: string;
    service: {
      price: Prisma.Decimal;
      category: string | null;
    } | null;
  }[]
> {
  return prisma.booking.findMany({
    where: {
      salonId,
      status: {
        in: ['COMPLETED', 'CONFIRMED'], // Only bookings considered as paid
      },
      ...(startDate || endDate
        ? {
            startTime: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    select: {
      id: true,
      userId: true,
      service: {
        select: {
          price: true,
          category: true,
        },
      },
    },
  });
}

/**
 * Format category revenue data into sorted array with percentages
 *
 * @param categories - Map of category data with revenue and counts
 * @param totalRevenue - Total revenue for percentage calculations
 * @returns Sorted array of category revenue items (highest revenue first)
 */
function formatCategoryBreakdown(
  categories: Map<string, { revenue: Prisma.Decimal; count: number }>,
  totalRevenue: Prisma.Decimal
): CategoryRevenue[] {
  const result: CategoryRevenue[] = [];

  for (const [category, data] of categories.entries()) {
    // Calculate percentage of total revenue
    const percentage = totalRevenue.gt(0) ? data.revenue.div(totalRevenue).mul(100).toNumber() : 0;

    result.push({
      category,
      revenue: data.revenue.toFixed(2),
      count: data.count,
      percentage: Number(percentage.toFixed(2)),
    });
  }

  // Sort by revenue descending (highest revenue first)
  return result.sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));
}
