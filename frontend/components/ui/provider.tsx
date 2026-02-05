'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
// import { ColorModeProvider } from '@/components/ui/color-mode';
// TODO: Update the import path below to the correct relative path if the file exists, or implement a fallback.
import { ColorModeProvider } from './color-mode';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f2ff' },
          100: { value: '#b3d9ff' },
          200: { value: '#80bfff' },
          300: { value: '#4da6ff' },
          400: { value: '#1a8cff' },
          500: { value: '#0073e6' },
          600: { value: '#005ab3' },
          700: { value: '#004280' },
          800: { value: '#002a4d' },
          900: { value: '#00121a' },
        },
      },
    },
  },
});

export function Provider(props: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ChakraProvider value={system}>
        <ColorModeProvider forcedTheme="light">
          {props.children}
        </ColorModeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}