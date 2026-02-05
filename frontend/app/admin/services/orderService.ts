import type { Order, Summary } from '../types/order.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Helper to get headers with API key
const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (API_KEY) {
        headers['X-API-Key'] = API_KEY;
    }
    
    return headers;
};

export const orderService = {
    /**
     * Fetch summary data including total orders and revenue
     */
    async fetchSummary(): Promise<Summary> {
        const response = await fetch(`${API_BASE_URL}/orders/summary`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }
        return response.json();
    },

    /**
     * Fetch recent orders with optional limit
     */
    async fetchOrders(limit: number = 50): Promise<Order[]> {
        const response = await fetch(`${API_BASE_URL}/orders/?limit=${limit}`, {
            headers: getHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        return response.json();
    },

    /**
     * Filter orders by status
     */
    filterByStatus(orders: Order[], status: string): Order[] {
        if (status === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === status);
    },

    /**
     * Filter orders by search query (order_id or customer_id)
     */
    filterBySearch(orders: Order[], query: string): Order[] {
        if (!query) {
            return orders;
        }
        const lowerQuery = query.toLowerCase();
        return orders.filter(order => 
            order.order_id.toLowerCase().includes(lowerQuery) ||
            order.customer_id.toLowerCase().includes(lowerQuery)
        );
    },

    /**
     * Apply combined filters (status and search)
     */
    applyFilters(orders: Order[], statusFilter: string, searchQuery: string): Order[] {
        let filtered = orders;
        
        if (statusFilter !== 'all') {
            filtered = this.filterByStatus(filtered, statusFilter);
        }
        
        if (searchQuery) {
            filtered = this.filterBySearch(filtered, searchQuery);
        }
        
        return filtered;
    },

    /**
     * Calculate statistics from orders
     */
    calculateStatistics(orders: Order[]) {
        const averageOrderValue = orders.length > 0 
            ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length 
            : 0;

        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.order_date).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        }).length;

        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        return {
            averageOrderValue,
            todayOrders,
            pendingOrders,
        };
    },

    /**
     * Format date string to localized format
     */
    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('is-IS', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },
};
