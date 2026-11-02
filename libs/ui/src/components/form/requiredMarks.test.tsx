// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AutoField } from './fields';
import { AdhocFormProvider } from './formContext';

import type * as dyn from '@nikkierp/common/dynamicModel';


function text(name: string, extra: Partial<dyn.ModelSchemaField>): dyn.ModelSchemaField {
	return { name, label: { 'en-US': name }, data_type: { name: 'string' }, ...extra } as dyn.ModelSchemaField;
}

const modelSchema = {
	name: 'test_thing',
	fields: {
		on_create: text('on_create', { is_required_for_create: true }),
		on_update: text('on_update', { is_required_for_update: true }),
		optional: text('optional', {}),
	},
} as dyn.ModelSchema;
const FIELDS = ['on_create', 'on_update', 'optional'];

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});

afterEach(cleanup);

function renderForm(formVariant: 'create' | 'update') {
	const view = render(
		<MantineProvider env='test'>
			<AdhocFormProvider formVariant={formVariant} modelSchema={modelSchema} localize={key => String(key ?? '')}>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(() => undefined)}>
						{FIELDS.map(name => <AutoField key={name} name={name} />)}
					</form>
				)}
			</AdhocFormProvider>
		</MantineProvider>,
	);
	const input = (name: string) => view.container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
	const marked = () => FIELDS.filter(name => input(name).getAttribute('aria-required') === 'true');
	const invalid = () => FIELDS.filter(name => input(name).getAttribute('aria-invalid') === 'true');
	const submit = () => act(async () => {
		fireEvent.submit(view.container.querySelector('form') as HTMLFormElement);
	});
	return { marked, invalid, submit };
}

describe('required fields by form variant', () => {
	it('marks and validates only create-required fields on a create form', async () => {
		const { marked, invalid, submit } = renderForm('create');
		expect(marked()).toEqual(['on_create']);
		await submit();
		await waitFor(() => expect(invalid()).toEqual(['on_create']));
	});

	it('marks and validates create- and update-required fields on an edit form', async () => {
		const { marked, invalid, submit } = renderForm('update');
		expect(marked()).toEqual(['on_create', 'on_update']);
		await submit();
		await waitFor(() => expect(invalid()).toEqual(['on_create', 'on_update']));
	});
});

describe('required_fields of a source field', () => {
	const conditionalSchema = {
		name: 'test_location',
		fields: {
			kind: text('kind', { required_fields: { transit: ['strategy'] } }),
			strategy: text('strategy', {}),
		},
	} as dyn.ModelSchema;

	it('marks the listed field once the source holds the value', async () => {
		const view = render(
			<MantineProvider env='test'>
				<AdhocFormProvider formVariant='create' modelSchema={conditionalSchema} localize={key => String(key ?? '')}>
					{() => <>{['kind', 'strategy'].map(name => <AutoField key={name} name={name} />)}</>}
				</AdhocFormProvider>
			</MantineProvider>,
		);
		const input = (name: string) => view.container.querySelector(`input[name="${name}"]`) as HTMLInputElement;
		expect(input('strategy').getAttribute('aria-required')).toBeNull();
		await act(async () => {
			fireEvent.change(input('kind'), { target: { value: 'transit' } });
		});
		await waitFor(() => expect(input('strategy').getAttribute('aria-required')).toBe('true'));
	});
});
