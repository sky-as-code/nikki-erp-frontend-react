import '@mantine/core/styles.css';

import { createRouter, RouterProvider } from '@tanstack/react-router'

import { routeTree  } from './routeTree.gen'
import { MantineProvider } from '@mantine/core';
import { theme } from './styles/theme';

import './styles/index.css';

const router = createRouter({ routeTree })

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
