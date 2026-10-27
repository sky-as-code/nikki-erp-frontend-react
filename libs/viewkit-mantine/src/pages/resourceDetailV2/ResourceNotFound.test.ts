import { MantineProvider } from '@mantine/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { HideWhenNotFound, ResourceNotFound } from './ResourceNotFound';
import { ResourceUpdateContext } from '../resourceDetail/resourceUpdateContext';

import type { ResourceUpdateContextValue } from '../resourceDetail/resourceUpdateContext';


vi.mock('@nikkierp/ui/i18n', () => ({ useTranslate: () => (key: string) => key }));

vi.mock('../resourceDetail/ResourceDetailProvider', () => ({
	useResourceDetailTestAttrs: () => (...segments: string[]) => ({ 'data-testid': ['roleDetail', ...segments].join('.') }),
}));

function render(linkHref?: string): string {
	const value = { backLinkTitle: linkHref ? { linkHref } : undefined } as ResourceUpdateContextValue;
	return renderToStaticMarkup(React.createElement(MantineProvider, null,
		React.createElement(MemoryRouter, { initialEntries: ['/identity/roles/missing'] },
			React.createElement(Routes, null, React.createElement(Route, {
				path: '/:moduleSlug/roles/:id',
				element: React.createElement(ResourceUpdateContext.Provider, { value },
					React.createElement(ResourceNotFound)),
			})),
		),
	));
}

describe('ResourceNotFound', () => {
	it('renders the not-found state with a Go back link to the list by default', () => {
		const html = render();
		expect(html).toContain('data-testid="roleDetail.notFound"');
		expect(html).toContain('page_not_found');
		expect(html).toContain('unauthorized_go_back');
		// `'../'` resolves path-relative against `/identity/roles/missing`.
		expect(html).toMatch(/<a[^>]*data-testid="roleDetail\.notFound\.goBack"[^>]*href="\/identity\/roles\/"/);
	});

	it('hides the sections after the update view only when the record is not found', () => {
		const renderGuard = (notFound: boolean): string => renderToStaticMarkup(
			React.createElement(ResourceUpdateContext.Provider, { value: { notFound } as ResourceUpdateContextValue },
				React.createElement(HideWhenNotFound, null, React.createElement('section', null, 'related'))),
		);
		expect(renderGuard(false)).toBe('<section>related</section>');
		expect(renderGuard(true)).toBe('');
	});

	it('points Go back at the page back link', () => {
		expect(render('roles')).toMatch(/<a[^>]*href="\/identity\/roles"/);
		expect(render('/essential/essential_uom')).toMatch(/<a[^>]*href="\/essential\/essential_uom"/);
	});
});
