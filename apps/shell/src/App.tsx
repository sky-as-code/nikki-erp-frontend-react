import React from 'react';
import '@mantine/core/styles.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

import './styles/index.css';

const router = createRouter({ routeTree });

export default function App() {
	return (
		<React.StrictMode>
			<RouterProvider router={router} />
		</React.StrictMode>
	);
}
