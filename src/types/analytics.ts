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
