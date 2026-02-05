import { Box, Card, Grid, HStack, Text, Badge } from '@chakra-ui/react';
import { currencyService } from '../services/currencyService';
import type { Statistics } from '../types/order.types';

interface MetricsHeroCardProps {
    totalRevenueISK: number;
    totalCurrencies: number;
    totalOrders: number;
    statistics: Statistics;
}

export function MetricsHeroCard({ 
    totalRevenueISK, 
    totalCurrencies, 
    totalOrders, 
    statistics 
}: MetricsHeroCardProps) {
    return (
        <Card.Root 
            bg="blue.600"
            bgGradient="to-br"
            gradientFrom="blue.600"
            gradientTo="blue.800"
            shadow="2xl" 
            borderRadius="2xl"
            overflow="hidden"
        >
            <Card.Body p={{ base: 6, md: 8 }} bg="linear-gradient(135deg, var(--chakra-colors-blue-600) 0%, var(--chakra-colors-blue-800) 100%)">
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                    <Box>
                        <HStack mb={2}>
                            <Text fontSize="sm" color="blue.100" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                                Total Revenue
                            </Text>
                            <Badge colorPalette="green" size="sm">Estimated</Badge>
                        </HStack>
                        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="white" lineHeight="1" mb={2}>
                            {currencyService.formatPrice(Math.round(totalRevenueISK), 'ISK')}
                        </Text>
                        <HStack gap={2}>
                            <Text fontSize="sm" color="blue.200">
                                {totalCurrencies} currencies
                            </Text>
                        </HStack>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="blue.100" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" mb={2}>
                            Total Orders
                        </Text>
                        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="white" lineHeight="1" mb={2}>
                            {totalOrders}
                        </Text>
                        <Text fontSize="sm" color="blue.200">
                            {statistics.todayOrders} today
                        </Text>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="blue.100" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" mb={2}>
                            Average Order
                        </Text>
                        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white" lineHeight="1" mb={2}>
                            {currencyService.formatPrice(Math.round(statistics.averageOrderValue), 'ISK')}
                        </Text>
                        <Text fontSize="sm" color="blue.200">
                            {statistics.pendingOrders} pending
                        </Text>
                    </Box>
                </Grid>
            </Card.Body>
        </Card.Root>
    );
}
