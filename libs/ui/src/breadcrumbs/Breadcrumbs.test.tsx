// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Breadcrumbs } from './Breadcrumbs';
import { NavHistoryProvider } from './NavHistoryProvider';

import type { BreadcrumbsProps } from './Breadcrumbs';
import type { TrailNode } from './trail';


beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
	window.ResizeObserver ??= class { observe(): void {} disconnect(): void {} unobserve(): void {} };
});
afterEach(cleanup);

function renderAt(path: string, trail: TrailNode[], props: BreadcrumbsProps = {}) {
	// MemoryRouter's first location is a POP, so the provider adopts the entry's stored trail.
	window.history.replaceState({ navTrail: trail }, '');
	return render(
		<MantineProvider>
			<MemoryRouter initialEntries={[path]}>
				<NavHistoryProvider>
					<Breadcrumbs {...props} />
				</NavHistoryProvider>
			</MemoryRouter>
		</MantineProvider>,
	);
}

const brandB = { path: '/inventory/inventory_brand/B', label: 'Brand B' };
const product = { path: '/inventory/inventory_product_template/P', label: 'Product P' };

describe('Breadcrumbs', () => {
	it('renders link crumbs and the current page as plain text', () => {
		renderAt(product.path, [brandB, product], { lastNodeLabel: 'Product P' });
		expect(screen.getByTestId('breadcrumbs.link').getAttribute('href')).toBe(brandB.path);
		expect(screen.getByTestId('breadcrumbs.last').tagName).toBe('H3');
		expect(screen.getByTestId('breadcrumbs.last').textContent).toBe('Product P');
	});

	it('shows the implicit list parent of a page reached directly', () => {
		renderAt(brandB.path, [{ path: brandB.path }], { lastNodeLabel: 'Brand B', rootParent: { to: '../', label: 'Brands' } });
		const parent = screen.getByTestId('breadcrumbs.parent');
		expect(parent.textContent).toBe('Brands');
		expect(parent.getAttribute('href')).toBe('/inventory/inventory_brand');
	});

	it('renders nothing for a one-node trail with the last node hidden', () => {
		const { container } = renderAt('/inventory/inventory_brand', [{ path: '/inventory/inventory_brand' }], { hideLastNode: true });
		expect(container.querySelector('nav')).toBeNull();
	});

	it('shows only the prefix when the last node is hidden', () => {
		renderAt(product.path, [brandB, product], { hideLastNode: true });
		expect(screen.queryByTestId('breadcrumbs.last')).toBeNull();
		expect(screen.getByTestId('breadcrumbs.link').textContent).toBe('Brand B');
	});

	it('collapses crumbs beyond the limit into (...), which counts towards it', () => {
		const trail = ['a', 'b', 'c', 'd'].map(key => ({ path: `/m/${key}/1`, label: key.toUpperCase() }));
		// jsdom measures no width, so this is the compact limit: `(...) / D`.
		renderAt('/m/d/1', trail, { nodeLimits: 2 });
		expect(screen.getByTestId('breadcrumbs.collapsed').textContent).toBe('(...)');
		expect(screen.queryAllByTestId('breadcrumbs.link')).toHaveLength(0);
		expect(screen.getByTestId('breadcrumbs.last').textContent).toBe('D');
	});

	it('capitalises the implicit list parent', () => {
		renderAt('/m/inventory_brand/1', [{ path: '/m/inventory_brand/1', label: 'Brand B' }], {
			rootParent: { to: '../', label: 'brands' },
		});
		expect(screen.getByTestId('breadcrumbs.parent').textContent).toBe('Brands');
	});
});
