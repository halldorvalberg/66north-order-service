'use client';

import { Box, Card, Heading, HStack, NativeSelectRoot, NativeSelectField, Text } from '@chakra-ui/react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DailyRevenue {
    date: string;
    currency: string;
    revenue: number;
}

interface RevenueChartProps {
    revenuePerDay: DailyRevenue[];
    currencyFilter: string;
    onCurrencyChange: (currency: string) => void;
}

export function RevenueChart({ revenuePerDay, currencyFilter, onCurrencyChange }: RevenueChartProps) {
    // Prepare chart data
    const chartData = Array.from(new Set(revenuePerDay.map(r => r.date)))
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-14)
        .map(date => {
            const dayRevenue = revenuePerDay.find(r => r.date === date && r.currency === currencyFilter);
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue?.revenue || 0,
                fullDate: date,
            };
        });

    const formatPrice = (value: number) => {
        if (currencyFilter === 'ISK') {
            return `${(value / 1000).toFixed(0)}k kr`;
        }
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            SEK: 'kr',
            NOK: 'kr',
        };
        return `${symbols[currencyFilter] || ''}${value.toLocaleString()}`;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box bg="white" p={3} borderRadius="md" shadow="lg" borderWidth="1px" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={1}>
                        {payload[0].payload.fullDate}
                    </Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                        Revenue: {formatPrice(payload[0].value)}
                    </Text>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card.Root bg="white" shadow="lg" borderRadius="xl">
            <Card.Body p={{ base: 5, md: 6 }}>
                <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" color="gray.900" fontWeight="semibold" mb={1}>
                            Daily Revenue Trend
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            Last 14 days
                        </Text>
                    </Box>
                    <HStack gap={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Currency:
                        </Text>
                        <NativeSelectRoot size="sm" width="120px">
                            <NativeSelectField
                                value={currencyFilter}
                                onChange={(e) => onCurrencyChange(e.target.value)}
                            >
                                <option value="ISK">ISK</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="SEK">SEK</option>
                                <option value="NOK">NOK</option>
                            </NativeSelectField>
                        </NativeSelectRoot>
                    </HStack>
                </HStack>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => formatPrice(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card.Root>
    );
}

// Alternative: Bar Chart Version
export function RevenueBarChart({ revenuePerDay, currencyFilter, onCurrencyChange }: RevenueChartProps) {
    const chartData = Array.from(new Set(revenuePerDay.map(r => r.date)))
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-14)
        .map(date => {
            const dayRevenue = revenuePerDay.find(r => r.date === date && r.currency === currencyFilter);
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue?.revenue || 0,
                fullDate: date,
            };
        });

    const formatPrice = (value: number) => {
        if (currencyFilter === 'ISK') {
            return `${(value / 1000).toFixed(0)}k kr`;
        }
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            SEK: 'kr',
            NOK: 'kr',
        };
        return `${symbols[currencyFilter] || ''}${value.toLocaleString()}`;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box bg="white" p={3} borderRadius="md" shadow="lg" borderWidth="1px" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={1}>
                        {payload[0].payload.fullDate}
                    </Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                        Revenue: {formatPrice(payload[0].value)}
                    </Text>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card.Root bg="white" shadow="lg" borderRadius="xl">
            <Card.Body p={{ base: 5, md: 6 }}>
                <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" color="gray.900" fontWeight="semibold" mb={1}>
                            Daily Revenue Trend
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            Last 14 days
                        </Text>
                    </Box>
                    <HStack gap={2}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Currency:
                        </Text>
                        <NativeSelectRoot size="sm" width="120px">
                            <NativeSelectField
                                value={currencyFilter}
                                onChange={(e) => onCurrencyChange(e.target.value)}
                            >
                                <option value="ISK">ISK</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="SEK">SEK</option>
                                <option value="NOK">NOK</option>
                            </NativeSelectField>
                        </NativeSelectRoot>
                    </HStack>
                </HStack>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => formatPrice(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="revenue"
                            fill="#3b82f6"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card.Root>
    );
}

// Multi-Currency Stacked Chart
export function MultiCurrencyChart({ revenuePerDay }: { revenuePerDay: DailyRevenue[] }) {
    // Group by date and create stacked data
    const dates = Array.from(new Set(revenuePerDay.map(r => r.date)))
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-14);

    const currencies = Array.from(new Set(revenuePerDay.map(r => r.currency)));

    const chartData = dates.map(date => {
        const dataPoint: any = {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: date,
        };
        
        currencies.forEach(currency => {
            const dayRevenue = revenuePerDay.find(r => r.date === date && r.currency === currency);
            dataPoint[currency] = dayRevenue?.revenue || 0;
        });
        
        return dataPoint;
    });

    const colors: Record<string, string> = {
        ISK: '#3b82f6',
        USD: '#10b981',
        EUR: '#f59e0b',
        GBP: '#8b5cf6',
        SEK: '#ec4899',
        NOK: '#06b6d4',
    };

    return (
        <Card.Root bg="white" shadow="lg" borderRadius="xl">
            <Card.Body p={{ base: 5, md: 6 }}>
                <Box mb={6}>
                    <Heading size="lg" color="gray.900" fontWeight="semibold" mb={1}>
                        Multi-Currency Revenue
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                        Daily breakdown across all currencies
                    </Text>
                </Box>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                        />
                        <Legend />
                        {currencies.map(currency => (
                            <Bar
                                key={currency}
                                dataKey={currency}
                                stackId="revenue"
                                fill={colors[currency] || '#94a3b8'}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </Card.Body>
        </Card.Root>
    );
}
