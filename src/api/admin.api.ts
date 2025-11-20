import http2 from "@/lib/http2";

// Types
export interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
    change_percent: number;
    currency: string;
  };
  orders: {
    current: number;
    previous: number;
    change_percent: number;
  };
  products: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    new_users: number;
    change_percent: number;
    by_type: {
      customer: number;
      admin: number;
    };
  };
}

export interface RevenueOrdersTimeline {
  date: string;
  revenue: number;
  order_count: number;
}

export interface DashboardOverviewData {
  period: {
    months: number;
    from_date: string;
    to_date: string;
  };
  metrics: DashboardMetrics;
  charts: {
    revenue_orders_timeline: RevenueOrdersTimeline[];
  };
}

export interface DashboardOverviewResponse {
  message: string;
  info: {
    data: DashboardOverviewData;
    success: boolean;
    message: string;
  };
}

export interface DashboardOverviewParams {
  months?: number; // 1-12
}

// API Methods
export const adminApi = {
  getDashboardOverview: (params?: DashboardOverviewParams) =>
    http2.get<DashboardOverviewResponse>("/v1/admin/dashboard/overview", {
      params,
    }),
};
