import { Box, Heading, Text } from '@chakra-ui/react';
import styles from '../admin.module.css';

export function DashboardHeader() {
    return (
        <Box className={styles.header}>
            <Heading 
                size={{ base: "xl", md: "2xl" }} 
                color="gray.900" 
                mb={2}
                fontWeight="bold"
                letterSpacing="tight"
            >
                Admin Dashboard
            </Heading>
            <Text color="gray.600" fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                66°North Order Management
            </Text>
        </Box>
    );
}
