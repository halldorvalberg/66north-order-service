'use client';

import { Box, Button, Container, Card, Badge, Grid, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import { RevenueChart } from '../../components/RevenueChart';
import { useQuery } from '@tanstack/react-query';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { MetricsHeroCard } from './components/MetricsHeroCard';
import { CurrencyBreakdown } from './components/CurrencyBreakdown';
import { OrdersTable } from './components/OrdersTable';
import { DashboardFooter } from './components/DashboardFooter';

// Services
import { orderService } from './services/orderService';
import { currencyService } from './services/currencyService';

// Types
import type { Order, Summary, CurrencyView } from './types/order.types';

export default function AdminDashboard() {
    // Use React Query for both summary and orders
    const { 
        data: summary, 
        isLoading: summaryLoading,
        error: summaryError,
        refetch: refetchSummary 
    } = useQuery({
        queryKey: ['summary'],
        queryFn: () => orderService.fetchSummary(),
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
    });

    const { 
        data: orders = [], 
        isLoading: ordersLoading,
        error: ordersError,
        refetch: refetchOrders 
    } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderService.fetchOrders(50),
        refetchInterval: 30000,
        refetchIntervalInBackground: true,
    });

    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currencyFilter, setCurrencyFilter] = useState<string>('ISK');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currencyView, setCurrencyView] = useState<CurrencyView>('grid');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // Calculate derived data
    const statistics = orderService.calculateStatistics(orders);
    const totalRevenueISK = summary ? currencyService.calculateTotalRevenueISK(summary.total_revenue) : 0;
    const currencyBreakdown = summary ? currencyService.createCurrencyBreakdown(summary.total_revenue) : [];

    // Apply filters when orders or filters change
    useEffect(() => {
        const filtered = orderService.applyFilters(orders, statusFilter, searchQuery);
        setFilteredOrders(filtered);
    }, [statusFilter, searchQuery, orders]);

    // Update last refresh timestamp
    useEffect(() => {
        if (orders.length > 0) {
            setLastRefresh(new Date());
        }
    }, [orders]);

    // Handle manual refresh
    const handleRefresh = () => {
        refetchSummary();
        refetchOrders();
        setLastRefresh(new Date());
    };

    const loading = summaryLoading || ordersLoading;
    const error = summaryError || ordersError;

    if (loading) {
        return (
            <Box bg="gray.50" minH="100vh" py={{ base: 6, md: 12 }} className={styles.page}>
                <Container maxW="container.xl" className={styles.container}>
                    <Stack gap={{ base: 6, md: 8 }}>
                        <Box>
                            <Box h="40px" w="250px" bg="gray.200" borderRadius="md" className={styles.skeleton} />
                            <Box h="24px" w="200px" bg="gray.200" borderRadius="md" mt={2} className={styles.skeleton} />
                        </Box>
                        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                            {[1, 2].map(i => (
                                <Card.Root key={i} bg="white" shadow="lg" borderRadius="xl">
                                    <Card.Body p={{ base: 5, md: 6 }}>
                                        <Box h="20px" w="120px" bg="gray.200" borderRadius="md" mb={4} className={styles.skeleton} />
                                        <Box h="48px" w="100px" bg="gray.200" borderRadius="md" className={styles.skeleton} />
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </Grid>
                        <Card.Root bg="white" shadow="lg" borderRadius="xl">
                            <Card.Body p={{ base: 5, md: 6 }}>
                                <Box h="300px" bg="gray.200" borderRadius="md" className={styles.skeleton} />
                            </Card.Body>
                        </Card.Root>
                    </Stack>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg="gray.50" minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <Card.Root maxW="md" bg="white" shadow="xl" borderRadius="xl">
                    <Card.Body p={8} textAlign="center">
                        <Badge colorPalette="red" size="lg" mb={4}>ERROR</Badge>
                        <Box as="h1" fontSize="lg" color="gray.900" mb={2} fontWeight="bold">
                            Failed to Load Dashboard
                        </Box>
                        <Box as="p" color="gray.600" mb={6}>
                            {error instanceof Error ? error.message : 'Failed to load dashboard data'}
                        </Box>
                        <Button colorPalette="blue" onClick={handleRefresh} className={styles.button}>
                            Try Again
                        </Button>
                    </Card.Body>
                </Card.Root>
            </Box>
        );
    }

    return (
        <Box bg="gray.50" minH="100vh" py={{ base: 6, md: 12 }} className={styles.page}>
            <Container maxW="container.xl" className={styles.container}>
                <Stack gap={{ base: 6, md: 8 }}>
                    {/* Header */}
                    <DashboardHeader />

                    {/* Hero Card - Overall Metrics */}
                    <MetricsHeroCard
                        totalRevenueISK={totalRevenueISK}
                        totalCurrencies={summary?.total_revenue.length || 0}
                        totalOrders={summary?.total_orders || 0}
                        statistics={statistics}
                    />

                    {/* Currency Breakdown Section */}
                    <CurrencyBreakdown
                        currencyBreakdown={currencyBreakdown}
                        totalRevenueISK={totalRevenueISK}
                        currencyView={currencyView}
                        onViewChange={setCurrencyView}
                    />

                    {/* Daily Revenue Chart */}
                    {summary && summary.revenue_per_day.length > 0 && (
                        <RevenueChart
                            revenuePerDay={summary.revenue_per_day}
                            currencyFilter={currencyFilter}
                            onCurrencyChange={setCurrencyFilter}
                        />
                    )}

                    {/* Recent Orders Table */}
                    <OrdersTable
                        orders={orders}
                        filteredOrders={filteredOrders}
                        statusFilter={statusFilter}
                        searchQuery={searchQuery}
                        lastRefresh={lastRefresh}
                        onStatusFilterChange={setStatusFilter}
                        onSearchQueryChange={setSearchQuery}
                        onRefresh={handleRefresh}
                    />

                    {/* Info Footer */}
                    <DashboardFooter />
                </Stack>
            </Container>
        </Box>
    );
}