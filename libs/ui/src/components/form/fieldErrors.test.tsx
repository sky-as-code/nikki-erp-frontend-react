// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { ClientErrorItem } from '@nikkierp/common/types';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { fieldErrorText } from './fieldErrors';
import { AutoField } from './fields';
import { AdhocFormProvider } from './formContext';

import type * as dyn from '@nikkierp/common/dynamicModel';


const modelSchema = {
	name: 'test_thing',
	fields: {
		name: { name: 'name', label: { 'en-US': 'name' }, data_type: { name: 'string' } },
		code: { name: 'code', label: { 'en-US': 'code' }, data_type: { name: 'string' } },
	},
} as unknown as dyn.ModelSchema;

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});

afterEach(cleanup);

// A sentence with quotes and a colon: re-translating or `$ref`-extracting it would mangle it.
const SERVER_TEXT = "Code 'X1' is taken: pick another";

function renderWithServerErrors(clientErrors: ClientErrorItem[]) {
	let unattached: ClientErrorItem[] = [];
	const view = render(
		<MantineProvider env='test'>
			<AdhocFormProvider formVariant='create' modelSchema={modelSchema} localize={key => String(key ?? '')}>
				{({ setServerErrors }) => (
					<form>
						<AutoField name='name' />
						<AutoField name='code' />
						<button type='button' onClick={() => { unattached = setServerErrors(clientErrors); }}>Apply</button>
					</form>
				)}
			</AdhocFormProvider>
		</MantineProvider>,
	);
	return { view, unattached: () => unattached };
}

describe('server field errors', () => {
	it('shows the server text verbatim on its field and returns the non-field items', async () => {
		const fieldItem = new ClientErrorItem({ field: 'code', key: '', message: SERVER_TEXT, type: 'validation' });
		const formItem = new ClientErrorItem({ key: 'common:resource_in_use', message: 'In use', type: 'business' });
		const { view, unattached } = renderWithServerErrors([fieldItem, formItem]);
		await act(async () => {
			fireEvent.click(view.getByText('Apply'));
		});
		await waitFor(() => expect(view.getByText(SERVER_TEXT)).toBeTruthy());
		expect(unattached()).toEqual([formItem]);
		const nameInput = view.container.querySelector('input[name="name"]') as HTMLInputElement;
		expect(nameInput.getAttribute('aria-invalid')).not.toBe('true');
	});

	it('returns an error for a field the form does not show, as field-less', async () => {
		const hiddenItem = new ClientErrorItem({
			field: 'id', key: 'common:resource_in_use', message: 'In use', type: 'business',
		});
		const { view, unattached } = renderWithServerErrors([hiddenItem]);
		await act(async () => {
			fireEvent.click(view.getByText('Apply'));
		});
		expect(unattached()).toEqual([hiddenItem]);
	});
});

describe('fieldErrorText', () => {
	it('translates a client-side key', () => {
		const translate = vi.fn((key: string) => `T(${key})`);
		expect(fieldErrorText(translate, { error: 'common:err_required' })).toBe('T(common:err_required)');
	});

	it('does not translate a server message', () => {
		const translate = vi.fn((key: string) => `T(${key})`);
		expect(fieldErrorText(translate, { error: SERVER_TEXT, isServerError: true })).toBe(SERVER_TEXT);
		expect(translate).not.toHaveBeenCalled();
	});

	it('returns undefined without an error', () => {
		expect(fieldErrorText(key => key, {})).toBeUndefined();
	});
});
