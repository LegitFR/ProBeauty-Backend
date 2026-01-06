/**
 * Analytics Type Definitions
 *
 * Type interfaces for salon revenue analytics feature
 */

/**
 * Query filters for analytics requests
 */
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
}

/**
 * Category-wise revenue breakdown item
 */
export interface CategoryRevenue {
  category: string | null;
  revenue: string; // Decimal as string for JSON serialization
  count: number;
  percentage: number;
}

/**
 * Revenue summary metrics
 */
export interface RevenueSummary {
  totalRevenue: string; // Total revenue (products + services)
  totalTransactions: number; // Count of all transactions
  netProfit: string; // Revenue after 2% admin commission
  adminCommission: string; // 2% commission amount
  averageTransactionValue: string; // Average per unique customer
  uniqueCustomers: number; // Count of unique customers
}

/**
 * Complete salon analytics response
 */
export interface SalonAnalytics {
  summary: RevenueSummary;
  productRevenue: {
    total: string;
    byCategory: CategoryRevenue[];
  };
  serviceRevenue: {
    total: string;
    byCategory: CategoryRevenue[];
  };
  timeRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

/**
 * Admin analytics query filters
 */
export interface AdminAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  topServicesLimit?: number;
}

/**
 * Admin revenue summary metrics (platform-wide)
 */
export interface AdminRevenueSummary {
  totalRevenue: string;
  productRevenue: string;
  serviceRevenue: string;
  totalTransactions: number;
  adminProfit: string; // 2% of total revenue
  uniqueCustomers: number;
  totalSalons: number;
  averageRevenuePerSalon: string;
}

/**
 * Single trend data point
 */
export interface RevenueTrendData {
  period: string;
  revenue: string;
  productRevenue: string;
  serviceRevenue: string;
  transactions: number;
}

/**
 * Revenue trends container
 */
export interface RevenueTrends {
  period: 'daily' | 'weekly' | 'monthly';
  data: RevenueTrendData[];
}

/**
 * Top service by revenue
 */
export interface TopService {
  serviceId: string;
  serviceName: string;
  category: string | null;
  totalRevenue: string;
  bookingCount: number;
  averagePrice: string;
}

/**
 * Complete admin analytics response
 */
export interface AdminAnalytics {
  summary: AdminRevenueSummary;
  trends: RevenueTrends;
  topServices: TopService[];
  timeRange: {
    startDate: string | null;
    endDate: string | null;
  };
}
