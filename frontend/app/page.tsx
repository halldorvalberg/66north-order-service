'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  NativeSelectRoot,
  NativeSelectField,
  Stack,
  Text,
  HStack,
  Separator,
  Card,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { Toaster, toaster } from '../components/ui/toaster';
import { useState } from 'react';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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

// 66°North products with prices in ISK
const PRODUCTS = [
  { id: 'snaefell-parka', name: 'Snæfell Parka', price: 89990 },
  { id: 'vatnajokull-jacket', name: 'Vatnajökull Primaloft Jacket', price: 79990 },
  { id: 'tindur-jacket', name: 'Tindur Technical Jacket', price: 119990 },
  { id: 'esja-jacket', name: 'Esja Light Jacket', price: 49990 },
  { id: 'hengill-jacket', name: 'Hengill Hooded Jacket', price: 59990 },
  { id: 'vik-sweater', name: 'Vik Hooded Sweater', price: 29990 },
  { id: 'kaldi-gloves', name: 'Kaldi Gloves', price: 12990 },
  { id: 'vikur-beanie', name: 'Víkur Beanie', price: 8990 },
];

const CURRENCIES = [
  { code: 'ISK', symbol: 'kr', rate: 1.0 },
  { code: 'USD', symbol: '$', rate: 0.0072 },
  { code: 'EUR', symbol: '€', rate: 0.0065 },
  { code: 'GBP', symbol: '£', rate: 0.0055 },
];

export default function OrderPage() {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currency, setCurrency] = useState('ISK');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCustomerId = (name: string) => {
    const cleaned = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const hash = cleaned.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `CUST-${hash.toString().slice(0, 5)}`;
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-2025-${timestamp}`;
  };

  const calculateTotal = () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return 0;

    const selectedCurrency = CURRENCIES.find(c => c.code === currency);
    const totalISK = product.price * quantity;
    return Math.round(totalISK * (selectedCurrency?.rate || 1));
  };

  const formatPrice = (amount: number, currencyCode: string) => {
    const curr = CURRENCIES.find(c => c.code === currencyCode);
    if (currencyCode === 'ISK') {
      return `${amount.toLocaleString()} kr`;
    }
    return `${curr?.symbol}${amount.toLocaleString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const order = {
      order_id: generateOrderId(),
      customer_id: generateCustomerId(customerName),
      total_amount: calculateTotal(),
      currency: currency,
      status: 'pending',
      order_date: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create order');
      }

      const result = await response.json();

      toaster.success({
        title: 'Order Placed Successfully!',
        description: `Order ${result.order_id} has been created.`,
      });

      setCustomerName('');
      setEmail('');
      setSelectedProduct('');
      setQuantity(1);
    } catch (error) {
      toaster.error({
        title: 'Order Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductDetails = PRODUCTS.find(p => p.id === selectedProduct);

  return (
    <>
      <Toaster />
      <Box bg="gray.50" minH="100vh" py={{ base: 6, md: 12 }} className={styles.page}>
        <Container maxW="container.md" className={styles.container}>
          <Stack gap={{ base: 6, md: 8 }}>
            <Box textAlign="center" py={4}>
              <Heading
                size={{ base: "xl", md: "2xl" }}
                color="gray.900"
                mb={2}
                fontWeight="bold"
                letterSpacing="tight"
              >
                66°North
              </Heading>
              <Text color="gray.600" fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                Place Your Order
              </Text>
            </Box>

            <Card.Root bg="white" shadow="lg" borderRadius="xl" overflow="hidden" className={styles.card}>
              <Card.Body p={{ base: 6, md: 8 }}>
                <form onSubmit={handleSubmit}>
                  <Stack gap={8}>
                    <Box className={styles.section}>
                      <Heading size="lg" mb={5} color="gray.900" fontWeight="semibold" className={styles.heading}>
                        Customer Information
                      </Heading>
                      <Stack gap={5}>
                        <Field required label="Full Name">
                          <Input
                            id="customer-name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            size="lg"
                            focusRingColor="blue.500"
                            className={styles.input}
                          />
                        </Field>

                        <Field required label="Email Address">
                          <Input
                            id="customer-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            size="lg"
                            focusRingColor="blue.500"
                            className={styles.input}
                          />
                        </Field>
                      </Stack>
                    </Box>

                    <Separator />

                    <Box className={styles.section}>
                      <Heading size="lg" mb={5} color="gray.900" fontWeight="semibold" className={styles.heading}>
                        Select Product
                      </Heading>
                      <Stack gap={5}>
                        <Field required label="Product">
                          <NativeSelectRoot size="lg">
                            <NativeSelectField
                              id="product-select"
                              value={selectedProduct}
                              onChange={(e) => setSelectedProduct(e.target.value)}
                              className={styles.select}
                            >
                              <option value="">Choose a product</option>
                              {PRODUCTS.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - {formatPrice(product.price, 'ISK')}
                                </option>
                              ))}
                            </NativeSelectField>
                          </NativeSelectRoot>
                        </Field>

                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                          <GridItem>
                            <Field required label="Quantity">
                              <Input
                                id="quantity-input"
                                type="number"
                                min={1}
                                max={10}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                size="lg"
                                focusRingColor="blue.500"
                                className={styles.input}
                              />
                            </Field>
                          </GridItem>

                          <GridItem>
                            <Field required label="Currency">
                              <NativeSelectRoot size="lg">
                                <NativeSelectField
                                  id="currency-select"
                                  value={currency}
                                  onChange={(e) => setCurrency(e.target.value)}
                                  className={styles.select}
                                >
                                  {CURRENCIES.map((curr) => (
                                    <option key={curr.code} value={curr.code}>
                                      {curr.code}
                                    </option>
                                  ))}
                                </NativeSelectField>
                              </NativeSelectRoot>
                            </Field>
                          </GridItem>
                        </Grid>
                      </Stack>
                    </Box>

                    {selectedProductDetails && (
                      <>
                        <Separator />
                        <Box
                          bg="blue.50"
                          p={6}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="blue.100"
                        >
                          <Heading size="md" mb={4} color="gray.900" fontWeight="semibold" className={styles.heading}>
                            Order Summary
                          </Heading>
                          <Stack gap={3}>
                            <HStack justify="space-between">
                              <Text color="gray.600">Product:</Text>
                              <Text fontWeight="semibold" color="gray.900">
                                {selectedProductDetails.name}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600">Quantity:</Text>
                              <Text fontWeight="semibold" color="gray.900">{quantity}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="gray.600">Unit Price:</Text>
                              <Text color="gray.900">
                                {formatPrice(selectedProductDetails.price, 'ISK')}
                              </Text>
                            </HStack>
                            <Separator my={2} />
                            <HStack justify="space-between">
                              <Text fontSize="xl" fontWeight="bold" color="gray.900">
                                Total:
                              </Text>
                              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                {formatPrice(calculateTotal(), currency)}
                              </Text>
                            </HStack>
                          </Stack>
                        </Box>
                      </>
                    )}

                    <Button
                      type="submit"
                      colorPalette="blue"
                      size="xl"
                      width="100%"
                      loading={isSubmitting}
                      loadingText="Placing Order..."
                      disabled={!selectedProduct || !customerName || !email}
                      _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      transition="all 0.2s"
                      className={styles.button}
                    >
                      Place Order
                    </Button>
                  </Stack>
                </form>
              </Card.Body>
            </Card.Root>

            <Card.Root
              bg="purple.50"
              borderWidth="1px"
              borderColor="purple.200"
              borderRadius="lg"
            >
              <Card.Body p={4}>
                <HStack gap={3} flexWrap="wrap">
                  <Badge colorPalette="purple" size="lg" px={3} py={1}>
                    DEMO
                  </Badge>
                  <Text fontSize="sm" color="gray.700" flex="1" minW="200px">
                    This is a demonstration order system for the 66°North case study.
                    Orders are sent to <Text as="span" fontFamily="mono" fontWeight="medium">http://localhost:5000</Text>
                  </Text>
                </HStack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Container>
      </Box>
    </>
  );
}