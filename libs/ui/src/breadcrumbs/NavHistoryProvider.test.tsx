// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readEntryTrail } from './historyTrail';
import { NavHistoryProvider, useNavTrail } from './NavHistoryProvider';
import { useBreadcrumbsNode } from './useBreadcrumbsNode';
import { useTrailNavigate } from './useTrailNavigate';
import { Link } from '../components/Link/Link';

import type { NodeLabelResolver } from './NavHistoryProvider';


const BRANDS = '/inventory/inventory_brand';
const BRAND_B = '/inventory/inventory_brand/B';
const PRODUCT_P = '/inventory/inventory_product_template/P';
const SIGN_IN = '/signin';
const MISSING = '/inventory/inventory_brand/missing';

function Probe(): React.ReactNode {
	const trail = useNavTrail() ?? [];
	const navigate = useTrailNavigate();
	return (
		<>
			<output data-testid='trail'>{trail.map(node => node.path).join(' > ')}</output>
			<output data-testid='labels'>{trail.map(node => node.label ?? '?').join(' > ')}</output>
			<Link to={BRAND_B}>{'row B'}</Link>
			<Link to={PRODUCT_P} mode='append'>{'tab P'}</Link>
			<Link to={BRANDS} isHistoryRoot>{'menu brands'}</Link>
			<Link to={MISSING}>{'missing'}</Link>
			<button type='button' onClick={() => navigate('?graph=x', { replace: true })}>{'filter'}</button>
			<button type='button' onClick={() => navigate(BRAND_B, { replace: true })}>{'redirect B'}</button>
		</>
	);
}

const UTILITY_PAGES = new Set([SIGN_IN, MISSING]);
const TITLES: Record<string, string> = { [BRANDS]: 'Brands', [BRAND_B]: 'Brand B' };

/** Sign-in and a not-found page are no nodes; every other page registers itself. */
function TitledPage(): React.ReactNode {
	const { pathname } = useLocation();
	return UTILITY_PAGES.has(pathname) ? <Probe /> : <NodePage title={TITLES[pathname]} />;
}

function NodePage({ title }: { title: string | undefined }): React.ReactNode {
	useBreadcrumbsNode({ title });
	return <Probe />;
}

function renderApp(resolveNodeLabel?: NodeLabelResolver) {
	return render(
		<BrowserRouter>
			<NavHistoryProvider resolveNodeLabel={resolveNodeLabel}>
				<Routes><Route path='*' element={<TitledPage />} /></Routes>
			</NavHistoryProvider>
		</BrowserRouter>,
	);
}

const trailText = () => screen.getByTestId('trail').textContent;
const click = (name: string) => act(() => {
	fireEvent.click(screen.getByText(name));
});
const traverse = (delta: number) => act(async () => {
	const popped = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
	window.history.go(delta);
	await popped;
});

beforeEach(() => {
	window.history.replaceState(null, '', BRANDS);
	window.sessionStorage.clear();
});
afterEach(cleanup);

describe('NavHistoryProvider', () => {
	it('starts a one-node trail on direct access and stores it on the entry', () => {
		renderApp();
		expect(trailText()).toBe(BRANDS);
		expect(readEntryTrail()?.map(node => node.path)).toEqual([BRANDS]);
	});

	it('replaces on sibling links, appends on append links, resets on roots', () => {
		renderApp();
		click('row B');
		expect(trailText()).toBe(BRAND_B);
		click('tab P');
		expect(trailText()).toBe(`${BRAND_B} > ${PRODUCT_P}`);
		click('menu brands');
		expect(trailText()).toBe(BRANDS);
	});

	it('gives each entry its own trail back on Back and Forward', async () => {
		renderApp();
		click('row B');
		click('tab P');
		await traverse(-1);
		expect(trailText()).toBe(BRAND_B);
		await traverse(1);
		expect(trailText()).toBe(`${BRAND_B} > ${PRODUCT_P}`);
	});

	it('restores the trail and its labels after a reload', () => {
		const first = renderApp();
		click('row B');
		click('tab P');
		first.unmount();
		renderApp();
		expect(trailText()).toBe(`${BRAND_B} > ${PRODUCT_P}`);
		expect(screen.getByTestId('labels').textContent).toBe('Brand B > ?');
	});

	it('keeps the prefix when a page replaces its own entry, e.g. to write filters', () => {
		renderApp();
		click('row B');
		click('tab P');
		click('filter');
		expect(trailText()).toBe(`${BRAND_B} > ${PRODUCT_P}`);
		expect(readEntryTrail()?.[1].search).toBe('?graph=x');
	});

	it('resolves a prefix label nobody registered', async () => {
		window.history.replaceState({ navTrail: [{ path: PRODUCT_P }, { path: BRANDS }] }, '', BRANDS);
		const resolve = vi.fn<NodeLabelResolver>().mockResolvedValue('Product P');
		renderApp(resolve);
		await waitFor(() => expect(screen.getByTestId('labels').textContent).toBe('Product P > Brands'));
		expect(resolve).toHaveBeenCalledExactlyOnceWith(PRODUCT_P);
	});

	it('ends the trail after a page that is no node, so a sign-in redirect starts afresh', () => {
		window.history.replaceState(null, '', SIGN_IN);
		renderApp();
		click('redirect B');
		expect(trailText()).toBe(BRAND_B);
	});

	it('drops a page that never registered: the next link starts a new trail', () => {
		renderApp();
		click('row B');
		click('tab P');
		click('missing');
		click('tab P');
		expect(trailText()).toBe(PRODUCT_P);
	});
});
