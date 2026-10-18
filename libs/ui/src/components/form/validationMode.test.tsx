// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AutoField } from './fields';
import { AdhocFormProvider } from './formContext';

import type * as dyn from '@nikkierp/common/dynamicModel';


function requiredText(name: string): dyn.ModelSchemaField {
	return {
		name, label: { 'en-US': name }, data_type: { name: 'string' }, is_required_for_create: true,
	} as dyn.ModelSchemaField;
}

const modelSchema = {
	name: 'test_thing',
	fields: { name: requiredText('name'), code: requiredText('code') },
} as dyn.ModelSchema;

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});

afterEach(cleanup);

function renderForm() {
	const view = render(
		<MantineProvider env='test'>
			<AdhocFormProvider formVariant='create' modelSchema={modelSchema} localize={key => String(key ?? '')}>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(() => undefined)}>
						<AutoField name='name' />
						<AutoField name='code' />
						<button type='submit'>Save</button>
					</form>
				)}
			</AdhocFormProvider>
		</MantineProvider>,
	);
	const input = (name: string) => view.container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
	const isInvalid = (name: string) => input(name).getAttribute('aria-invalid') === 'true';
	return { view, input, isInvalid };
}

describe('form validation timing', () => {
	it('validates only the blurred field on blur', async () => {
		const { input, isInvalid } = renderForm();
		await act(async () => {
			fireEvent.focus(input('name'));
			fireEvent.blur(input('name'));
		});
		await waitFor(() => expect(isInvalid('name')).toBe(true));
		expect(isInvalid('code')).toBe(false);
	});

	it('does not validate while typing', async () => {
		const { input, isInvalid } = renderForm();
		await act(async () => {
			fireEvent.change(input('name'), { target: { value: 'x' } });
			fireEvent.change(input('name'), { target: { value: '' } });
		});
		expect(isInvalid('name')).toBe(false);
	});

	it('validates every field on submit', async () => {
		const { view, isInvalid } = renderForm();
		await act(async () => {
			fireEvent.submit(view.container.querySelector('form') as HTMLFormElement);
		});
		await waitFor(() => expect(isInvalid('name')).toBe(true));
		expect(isInvalid('code')).toBe(true);
	});
});
