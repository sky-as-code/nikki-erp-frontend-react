import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResourceUpdateContext } from './resourceUpdateContext';
import { useBackLinkTarget } from './useBackLinkTarget';

import type { ResourceUpdateContextValue } from './resourceUpdateContext';
import type { BackLinkTarget } from './useBackLinkTarget';


const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async importOriginal => ({
	...await importOriginal<typeof import('react-router-dom')>(),
	useNavigate: () => navigate,
}));

function resolve(linkHref?: string): BackLinkTarget {
	let target: BackLinkTarget | undefined;
	function Probe(): null {
		target = useBackLinkTarget();
		return null;
	}
	const value = { backLinkTitle: linkHref ? { linkHref } : undefined } as ResourceUpdateContextValue;
	renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: ['/identity/roles/r1'] },
		React.createElement(Routes, null, React.createElement(Route, {
			path: '/:moduleSlug/roles/:id',
			element: React.createElement(ResourceUpdateContext.Provider, { value }, React.createElement(Probe)),
		})),
	));
	return target!;
}

describe('useBackLinkTarget', () => {
	beforeEach(() => navigate.mockClear());

	it('falls back to the list when the page has no back link', () => {
		expect(resolve().href).toBe('../');
	});

	it('keeps a path-relative back link as is', () => {
		expect(resolve('../../').href).toBe('../../');
	});

	it('resolves a page route path against the current module and params', () => {
		expect(resolve('roles/:id/users').href).toBe('/identity/roles/r1/users');
	});

	it('navigates path-relative and replaces the history entry', () => {
		resolve('roles').go();
		expect(navigate).toHaveBeenCalledWith('/identity/roles', { relative: 'path', replace: true });
	});
});
