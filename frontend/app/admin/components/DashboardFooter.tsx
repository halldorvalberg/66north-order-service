import { Card, HStack, Badge, Text } from '@chakra-ui/react';

export function DashboardFooter() {
    return (
        <Card.Root 
            bg="blue.50" 
            borderWidth="1px" 
            borderColor="blue.200" 
            borderRadius="xl"
            role="note"
            aria-label="API information"
        >
            <Card.Body p={5}>
                <HStack gap={3} flexWrap="wrap">
                    <Badge colorPalette="blue" size="lg" px={3} py={1.5}>
                        INFO
                    </Badge>
                    <Text fontSize="sm" color="gray.700" flex="1" minW="200px">
                        This dashboard displays real-time data from the order service API at{' '}
                        <Text as="span" fontFamily="mono" fontWeight="semibold" color="blue.700">
                            http://localhost:5000
                        </Text>
                    </Text>
                </HStack>
            </Card.Body>
        </Card.Root>
    );
}
