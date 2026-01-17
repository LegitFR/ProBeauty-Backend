/**
 * Analytics Service
 *
 * Business logic for calculating salon revenue analytics
 */

import { Prisma } from '@prisma/client';

import { prisma } from '@/configs/db';
import { PAYMENT_STATUS } from '@/constants/paymentStatus';
import type {
  AdminAnalytics,
  AdminAnalyticsFilters,
  AnalyticsFilters,
  CategoryRevenue,
  RevenueTrendData,
  SalonAnalytics,
  TopService,
} from '@/types/analytics';

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

// =============================================================================
// ADMIN ANALYTICS FUNCTIONS
// =============================================================================

// Raw query result types
interface ProductRevenueResult {
  total_revenue: Prisma.Decimal | null;
  transaction_count: bigint;
}

interface ServiceRevenueResult {
  total_revenue: Prisma.Decimal | null;
  booking_count: bigint;
}

interface UniqueCustomersResult {
  unique_count: bigint;
}

interface TrendRow {
  period: Date;
  product_revenue: Prisma.Decimal | null;
  service_revenue: Prisma.Decimal | null;
  product_count: bigint;
  service_count: bigint;
}

interface TopServiceRow {
  service_id: string;
  service_name: string;
  category: string | null;
  total_revenue: Prisma.Decimal;
  booking_count: bigint;
  average_price: Prisma.Decimal;
}

/**
 * Get platform-wide analytics for admin dashboard
 * Uses optimized database aggregations instead of loading all records
 *
 * @param filters - Query filters including date range, period, and limits
 * @returns Complete admin analytics data
 */
export async function getAdminAnalytics(filters: AdminAnalyticsFilters): Promise<AdminAnalytics> {
  // Set default date range (last 30 days if not specified)
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  const startDate = filters.startDate
    ? new Date(filters.startDate)
    : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const period = filters.period || 'monthly';
  const topServicesLimit = filters.topServicesLimit || 10;

  // Execute all aggregation queries in parallel for optimal performance
  const [productRevenue, serviceRevenue, uniqueCustomers, activeSalons, trends, topServices] =
    await Promise.all([
      getGlobalProductRevenue(startDate, endDate),
      getGlobalServiceRevenue(startDate, endDate),
      getGlobalUniqueCustomers(startDate, endDate),
      getActiveSalonsCount(),
      getRevenueTrends(startDate, endDate, period),
      getTopServicesByRevenue(startDate, endDate, topServicesLimit),
    ]);

  // Calculate totals
  const productTotal = productRevenue.totalRevenue;
  const serviceTotal = serviceRevenue.totalRevenue;
  const totalRevenue = productTotal.add(serviceTotal);
  const totalTransactions = productRevenue.transactionCount + serviceRevenue.transactionCount;

  // Admin profit is 2% of total revenue
  const ADMIN_COMMISSION_RATE = new Prisma.Decimal('0.02');
  const adminProfit = totalRevenue.mul(ADMIN_COMMISSION_RATE);

  // Calculate average revenue per salon
  const averageRevenuePerSalon =
    activeSalons > 0 ? totalRevenue.div(new Prisma.Decimal(activeSalons)) : new Prisma.Decimal(0);

  return {
    summary: {
      totalRevenue: totalRevenue.toFixed(2),
      productRevenue: productTotal.toFixed(2),
      serviceRevenue: serviceTotal.toFixed(2),
      totalTransactions,
      adminProfit: adminProfit.toFixed(2),
      uniqueCustomers,
      totalSalons: activeSalons,
      averageRevenuePerSalon: averageRevenuePerSalon.toFixed(2),
    },
    trends: {
      period,
      data: trends,
    },
    topServices,
    timeRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
}

/**
 * Aggregate product revenue from all salons using database-level aggregation
 */
async function getGlobalProductRevenue(
  startDate: Date,
  endDate: Date
): Promise<{ totalRevenue: Prisma.Decimal; transactionCount: number }> {
  const result = await prisma.$queryRaw<ProductRevenueResult[]>`
    SELECT
      COALESCE(SUM(amount), 0) as total_revenue,
      COUNT(*) as transaction_count
    FROM payments
    WHERE status = ${PAYMENT_STATUS.SUCCEEDED}
      AND created_at >= ${startDate}
      AND created_at <= ${endDate}
  `;

  return {
    totalRevenue: result[0]?.total_revenue || new Prisma.Decimal(0),
    transactionCount: Number(result[0]?.transaction_count || 0),
  };
}

/**
 * Aggregate service revenue from all salons using database-level aggregation
 */
async function getGlobalServiceRevenue(
  startDate: Date,
  endDate: Date
): Promise<{ totalRevenue: Prisma.Decimal; transactionCount: number }> {
  const result = await prisma.$queryRaw<ServiceRevenueResult[]>`
    SELECT
      COALESCE(SUM(s.price), 0) as total_revenue,
      COUNT(b.id) as booking_count
    FROM bookings b
    INNER JOIN services s ON b.service_id = s.id
    WHERE b.status IN ('COMPLETED', 'CONFIRMED')
      AND b.start_time >= ${startDate}
      AND b.start_time <= ${endDate}
  `;

  return {
    totalRevenue: result[0]?.total_revenue || new Prisma.Decimal(0),
    transactionCount: Number(result[0]?.booking_count || 0),
  };
}

/**
 * Get unique customer count across both revenue streams
 */
async function getGlobalUniqueCustomers(startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.$queryRaw<UniqueCustomersResult[]>`
    SELECT COUNT(DISTINCT user_id) as unique_count
    FROM (
      SELECT o.user_id as user_id
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      WHERE p.status = ${PAYMENT_STATUS.SUCCEEDED}
        AND p.created_at >= ${startDate}
        AND p.created_at <= ${endDate}

      UNION

      SELECT user_id as user_id
      FROM bookings
      WHERE status IN ('COMPLETED', 'CONFIRMED')
        AND start_time >= ${startDate}
        AND start_time <= ${endDate}
    ) all_customers
  `;

  return Number(result[0]?.unique_count || 0);
}

/**
 * Get count of active (verified) salons
 */
async function getActiveSalonsCount(): Promise<number> {
  return prisma.salon.count({
    where: { verified: true },
  });
}

/**
 * Get revenue trends grouped by time period
 */
async function getRevenueTrends(
  startDate: Date,
  endDate: Date,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<RevenueTrendData[]> {
  // Map period to PostgreSQL date_trunc interval
  const truncInterval = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';

  const result = await prisma.$queryRaw<TrendRow[]>`
    WITH payment_trends AS (
      SELECT
        DATE_TRUNC(${truncInterval}, created_at) as period,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as count
      FROM payments
      WHERE status = ${PAYMENT_STATUS.SUCCEEDED}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY period
    ),
    booking_trends AS (
      SELECT
        DATE_TRUNC(${truncInterval}, b.start_time) as period,
        COALESCE(SUM(s.price), 0) as revenue,
        COUNT(*) as count
      FROM bookings b
      INNER JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('COMPLETED', 'CONFIRMED')
        AND b.start_time >= ${startDate}
        AND b.start_time <= ${endDate}
      GROUP BY period
    )
    SELECT
      COALESCE(p.period, b.period) as period,
      COALESCE(p.revenue, 0) as product_revenue,
      COALESCE(b.revenue, 0) as service_revenue,
      COALESCE(p.count, 0) as product_count,
      COALESCE(b.count, 0) as service_count
    FROM payment_trends p
    FULL OUTER JOIN booking_trends b ON p.period = b.period
    ORDER BY period ASC
  `;

  return result.map((row) => {
    const productRev = new Prisma.Decimal(row.product_revenue?.toString() || '0');
    const serviceRev = new Prisma.Decimal(row.service_revenue?.toString() || '0');

    return {
      period: row.period.toISOString(),
      revenue: productRev.add(serviceRev).toFixed(2),
      productRevenue: productRev.toFixed(2),
      serviceRevenue: serviceRev.toFixed(2),
      transactions: Number(row.product_count || 0) + Number(row.service_count || 0),
    };
  });
}

/**
 * Get top services by total revenue
 */
async function getTopServicesByRevenue(
  startDate: Date,
  endDate: Date,
  limit: number
): Promise<TopService[]> {
  const result = await prisma.$queryRaw<TopServiceRow[]>`
    SELECT
      s.id as service_id,
      s.title as service_name,
      s.category,
      COALESCE(SUM(s.price), 0) as total_revenue,
      COUNT(b.id) as booking_count,
      COALESCE(AVG(s.price), 0) as average_price
    FROM bookings b
    INNER JOIN services s ON b.service_id = s.id
    WHERE b.status IN ('COMPLETED', 'CONFIRMED')
      AND b.start_time >= ${startDate}
      AND b.start_time <= ${endDate}
    GROUP BY s.id, s.title, s.category
    ORDER BY total_revenue DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    serviceId: row.service_id,
    serviceName: row.service_name,
    category: row.category,
    totalRevenue: new Prisma.Decimal(row.total_revenue?.toString() || '0').toFixed(2),
    bookingCount: Number(row.booking_count || 0),
    averagePrice: new Prisma.Decimal(row.average_price?.toString() || '0').toFixed(2),
  }));
}
