// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { polyfillMatchMedia, TEST_ID, TEST_SCHEMA_PACK } from './audit/auditTestHarness';
import { ResourceCreateSaveBar } from './resourceCreateParts';
import { ResourceCreateContext } from '../resourceDetail/resourceCreateContext';
import { ResourceDetailProvider } from '../resourceDetail/ResourceDetailProvider';
import { SplitViewSecondaryContext } from '../resourceSplitView/splitViewContext';

import type { LinkSpec } from '../resourceDetail/props';
import type { ResourceCreateContextValue } from '../resourceDetail/resourceCreateContext';


vi.mock('@nikkierp/ui/i18n', async importOriginal => {
	const { testI18nMock } = await import('./audit/auditTestI18n');
	return { ...await importOriginal<object>(), ...testI18nMock };
});

vi.mock('../../permissions', async importOriginal => ({
	...await importOriginal<object>(),
	useActionLock: () => ({ locked: false, missing: [] }),
}));

beforeAll(polyfillMatchMedia);
afterEach(cleanup);

const noop = (): void => undefined;

function createContext(backLinkTitle?: LinkSpec): ResourceCreateContextValue {
	return {
		commands: {}, backLinkTitle, onSubmit: noop, isSubmitting: false,
		registerAfterSave: () => noop, registerFileField: () => noop, bindServerErrorSink: () => noop,
	} as unknown as ResourceCreateContextValue;
}

type RenderOptions = { backLinkTitle?: LinkSpec, inSplitPane?: boolean };

function renderSaveBar({ backLinkTitle, inSplitPane = false }: RenderOptions = {}) {
	const pane = { isSecondary: inSplitPane, isPrimaryOpen: inSplitPane };
	const page = (
		<ResourceDetailProvider
			translationNs='iam' schemaPack={TEST_SCHEMA_PACK} isReading={false} isWriting={false} testId={TEST_ID}
		>
			<SplitViewSecondaryContext.Provider value={pane}>
				<ResourceCreateContext.Provider value={createContext(backLinkTitle)}>
					<ResourceCreateSaveBar />
				</ResourceCreateContext.Provider>
			</SplitViewSecondaryContext.Provider>
		</ResourceDetailProvider>
	);
	return render(
		<MantineProvider env='test'>
			<MemoryRouter initialEntries={['/iam_user/new']}>
				<Routes>
					<Route path='/iam_user/new' element={page} />
					<Route path='/iam_user' element={<div data-testid='list' />} />
					<Route path='/people' element={<div data-testid='people' />} />
				</Routes>
			</MemoryRouter>
		</MantineProvider>,
	);
}

const discardButton = () => screen.getByTestId(`${TEST_ID}.action.discard`);

describe('ResourceCreateSaveBar Discard', () => {
	it('sits right of Save', () => {
		renderSaveBar({ backLinkTitle: { linkHref: '../' } });
		const save = screen.getByTestId(`${TEST_ID}.action.save`);
		expect(save.compareDocumentPosition(discardButton()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('goes where the breadcrumb root parent points', () => {
		renderSaveBar({ backLinkTitle: { linkHref: '../' } });
		fireEvent.click(discardButton());
		expect(screen.getByTestId('list')).toBeTruthy();
	});

	it('resolves an absolute root parent the same way', () => {
		renderSaveBar({ backLinkTitle: { linkHref: '/people' } });
		fireEvent.click(discardButton());
		expect(screen.getByTestId('people')).toBeTruthy();
	});

	it('falls back to the list one segment up without a backLinkTitle', () => {
		renderSaveBar();
		fireEvent.click(discardButton());
		expect(screen.getByTestId('list')).toBeTruthy();
	});

	it('closes the split pane like its close button', () => {
		renderSaveBar({ backLinkTitle: { linkHref: '/people' }, inSplitPane: true });
		fireEvent.click(discardButton());
		expect(screen.getByTestId('list')).toBeTruthy();
	});
});
