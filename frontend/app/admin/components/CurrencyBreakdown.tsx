import { Box, Card, HStack, Heading, Text, Button, Badge, Grid, Stack, Table } from '@chakra-ui/react';
import { currencyService } from '../services/currencyService';
import type { CurrencyBreakdownItem, CurrencyView } from '../types/order.types';

interface CurrencyBreakdownProps {
    currencyBreakdown: CurrencyBreakdownItem[];
    totalRevenueISK: number;
    currencyView: CurrencyView;
    onViewChange: (view: CurrencyView) => void;
}

export function CurrencyBreakdown({
    currencyBreakdown,
    totalRevenueISK,
    currencyView,
    onViewChange
}: CurrencyBreakdownProps) {
    return (
        <Card.Root bg="white" shadow="lg" borderRadius="xl">
            <Card.Body p={{ base: 5, md: 6 }}>
                <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" color="gray.900" fontWeight="semibold" mb={1}>
                            Revenue by Currency
                        </Heading>
                        <Text fontSize="sm" color="gray.500">
                            Multi-currency breakdown with ISK equivalents
                        </Text>
                    </Box>
                    <HStack gap={2}>
                        <Button
                            size="sm"
                            variant={currencyView === 'grid' ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => onViewChange('grid')}
                        >
                            Grid
                        </Button>
                        <Button
                            size="sm"
                            variant={currencyView === 'chart' ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => onViewChange('chart')}
                        >
                            Chart
                        </Button>
                        <Button
                            size="sm"
                            variant={currencyView === 'table' ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => onViewChange('table')}
                        >
                            Table
                        </Button>
                    </HStack>
                </HStack>

                {/* Grid View */}
                {currencyView === 'grid' && (
                    <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
                        {currencyBreakdown.map((rev) => (
                            <Card.Root key={rev.currency} borderWidth="2px" borderColor="gray.200" bg="gray.50" _hover={{ borderColor: 'blue.400', bg: 'blue.50' }} transition="all 0.2s">
                                <Card.Body p={4}>
                                    <HStack justify="space-between" mb={3}>
                                        <Badge colorPalette="blue" size="lg" px={3} py={1}>
                                            {rev.currency}
                                        </Badge>
                                        <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                                            {rev.percentage.toFixed(1)}%
                                        </Text>
                                    </HStack>
                                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={2}>
                                        {currencyService.formatPrice(rev.total, rev.currency)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        ≈ {currencyService.formatPrice(Math.round(rev.iskEquivalent), 'ISK')}
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        ))}
                    </Grid>
                )}

                {/* Bar Chart View */}
                {currencyView === 'chart' && (
                    <Stack gap={4}>
                        {currencyBreakdown.map((rev) => (
                            <Box key={rev.currency}>
                                <HStack justify="space-between" mb={2}>
                                    <HStack gap={3}>
                                        <Badge colorPalette="blue" size="sm">
                                            {rev.currency}
                                        </Badge>
                                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                            {currencyService.formatPrice(rev.total, rev.currency)}
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                        {rev.percentage.toFixed(1)}%
                                    </Text>
                                </HStack>
                                <Box bg="gray.200" h="32px" borderRadius="md" overflow="hidden">
                                    <Box
                                        bg="blue.500"
                                        h="full"
                                        w={`${rev.percentage}%`}
                                        transition="all 0.5s"
                                        _hover={{ bg: 'blue.600' }}
                                    />
                                </Box>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    ISK Equivalent: {currencyService.formatPrice(Math.round(rev.iskEquivalent), 'ISK')}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                )}

                {/* Table View */}
                {currencyView === 'table' && (
                    <Box overflowX="auto">
                        <Table.Root size="md" variant="line">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Currency</Table.ColumnHeader>
                                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader>ISK Equivalent</Table.ColumnHeader>
                                    <Table.ColumnHeader>% of Total</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {currencyBreakdown.map((rev) => (
                                    <Table.Row key={rev.currency}>
                                        <Table.Cell>
                                            <Badge colorPalette="blue" size="sm">
                                                {rev.currency}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontWeight="semibold">
                                                {currencyService.formatPrice(rev.total, rev.currency)}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text color="gray.600">
                                                {currencyService.formatPrice(Math.round(rev.iskEquivalent), 'ISK')}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <HStack>
                                                <Box w="60px" h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
                                                    <Box bg="blue.500" h="full" w={`${rev.percentage}%`} />
                                                </Box>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {rev.percentage.toFixed(1)}%
                                                </Text>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                                <Table.Row bg="blue.50" fontWeight="bold">
                                    <Table.Cell>TOTAL</Table.Cell>
                                    <Table.Cell>—</Table.Cell>
                                    <Table.Cell>
                                        <Text fontWeight="bold" color="blue.700">
                                            {currencyService.formatPrice(Math.round(totalRevenueISK), 'ISK')}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text fontWeight="bold">100%</Text>
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}

                {/* Conversion Notice */}
                <Box mt={6} p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                    <HStack gap={2}>
                        <Badge colorPalette="blue" size="sm">ℹ️ NOTE</Badge>
                        <Text fontSize="sm" color="gray.700">
                            ISK equivalents are estimated using approximate exchange rates for visualization purposes.
                        </Text>
                    </HStack>
                </Box>
            </Card.Body>
        </Card.Root>
    );
}
