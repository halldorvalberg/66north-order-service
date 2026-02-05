import {
    Box,
    Card,
    HStack,
    Heading,
    Text,
    Button,
    Badge,
    Grid,
    Stack,
    Input,
    Table,
    NativeSelectRoot,
    NativeSelectField,
    Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { orderService } from '../services/orderService';
import { currencyService } from '../services/currencyService';
import { STATUS_COLORS, type Order } from '../types/order.types';
import styles from '../admin.module.css';

interface OrdersTableProps {
    orders: Order[];
    filteredOrders: Order[];
    statusFilter: string;
    searchQuery: string;
    lastRefresh: Date;
    onStatusFilterChange: (status: string) => void;
    onSearchQueryChange: (query: string) => void;
    onRefresh: () => void;
}

export function OrdersTable({
    orders,
    filteredOrders,
    statusFilter,
    searchQuery,
    lastRefresh,
    onStatusFilterChange,
    onSearchQueryChange,
    onRefresh,
}: OrdersTableProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setShowSuccess(false);

        await onRefresh();

        // Keep spinning for at least 500ms for visual feedback
        setTimeout(() => {
            setIsRefreshing(false);
            setShowSuccess(true);

            // Hide success animation after 1.5 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 1500);
        }, 500);
    };

    return (
        <Card.Root
            bg="white"
            shadow="lg"
            borderRadius="xl"
            role="region"
            aria-label="Recent orders table"
        >
            <Card.Body p={{ base: 5, md: 6 }}>
                <Stack gap={6}>
                    <HStack justify="space-between" flexWrap="wrap" gap={4}>
                        <Box>
                            <Heading size="lg" color="gray.900" fontWeight="semibold">
                                Recent Orders
                            </Heading>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </Text>
                        </Box>
                        <Box position="relative">
                            <Button
                                size="md"
                                onClick={handleRefresh}
                                variant="outline"
                                colorPalette="blue"
                                className={styles.button}
                                aria-label="Refresh orders data"
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <HStack gap={2}>
                                        <Spinner size="sm" />
                                        <Text>Refreshing...</Text>
                                    </HStack>
                                ) : (
                                    'Refresh'
                                )}
                            </Button>
                            {showSuccess && (
                                <Box
                                    position="absolute"
                                    top="-10px"
                                    left="50%"
                                    fontSize="2xl"
                                    pointerEvents="none"
                                    zIndex={10}
                                    className={styles.successEmoji}
                                >
                                    👍
                                </Box>
                            )}
                        </Box>
                    </HStack>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Input
                            placeholder="Search by Order ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            size="md"
                            className={styles.input}
                            borderColor="gray.300"
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        />
                        <NativeSelectRoot size="md" className={styles.select}>
                            <NativeSelectField
                                value={statusFilter}
                                onChange={(e) => onStatusFilterChange(e.target.value)}
                                aria-label="Filter orders by status"
                                _hover={{ borderColor: 'blue.400' }}
                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </NativeSelectField>
                        </NativeSelectRoot>
                    </Grid>

                    {searchQuery && (
                        <HStack>
                            <Text fontSize="sm" color="gray.600">
                                Found {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
                            </Text>
                            <Button size="xs" variant="ghost" onClick={() => onSearchQueryChange('')}>
                                Clear
                            </Button>
                        </HStack>
                    )}
                </Stack>

                {filteredOrders.length === 0 ? (
                    <Box py={16} textAlign="center" className={styles.emptyState}>
                        <Badge colorPalette="gray" size="lg" mb={4}>NO RESULTS</Badge>
                        <Heading size="md" color="gray.700" mb={2}>No Orders Found</Heading>
                        <Text color="gray.500" fontSize="sm" mb={6}>
                            {searchQuery
                                ? `No orders match "${searchQuery}"`
                                : statusFilter !== 'all'
                                    ? `No ${statusFilter} orders at the moment`
                                    : 'Create your first order to get started'}
                        </Text>
                        {(searchQuery || statusFilter !== 'all') && (
                            <HStack justify="center" gap={3}>
                                {searchQuery && (
                                    <Button size="sm" onClick={() => onSearchQueryChange('')} variant="outline">
                                        Clear Search
                                    </Button>
                                )}
                                {statusFilter !== 'all' && (
                                    <Button size="sm" onClick={() => onStatusFilterChange('all')} variant="outline">
                                        Show All
                                    </Button>
                                )}
                            </HStack>
                        )}
                    </Box>
                ) : (
                    <Box overflowX="auto" className={styles.tableWrapper}>
                        <Table.Root size="md" variant="line" className={styles.table}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Order ID</Table.ColumnHeader>
                                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredOrders.map((order) => (
                                    <Table.Row key={order.id}>
                                        <Table.Cell>
                                            <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
                                                {order.order_id}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="sm">{order.customer_id}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {currencyService.formatPrice(order.total_amount, order.currency)}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge
                                                colorPalette={STATUS_COLORS[order.status] || 'gray'}
                                                size="sm"
                                            >
                                                {order.status}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="sm" color="gray.600">
                                                {orderService.formatDate(order.order_date)}
                                            </Text>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}
            </Card.Body>
        </Card.Root>
    );
}