export interface Order {
    id: number;
    order_id: string;
    customer_id: string;
    total_amount: number;
    currency: string;
    status: string;
    order_date: string;
    created_at: string;
}

export interface CurrencyTotal {
    currency: string;
    total: number;
}

export interface DailyRevenue {
    date: string;
    currency: string;
    revenue: number;
}

export interface Summary {
    total_orders: number;
    total_revenue: CurrencyTotal[];
    revenue_per_day: DailyRevenue[];
}

export interface CurrencyBreakdownItem extends CurrencyTotal {
    iskEquivalent: number;
    percentage: number;
}

export interface Statistics {
    averageOrderValue: number;
    todayOrders: number;
    pendingOrders: number;
}

export const STATUS_COLORS: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'cyan',
    delivered: 'green',
    cancelled: 'red',
};

export type CurrencyView = 'grid' | 'chart' | 'table';
