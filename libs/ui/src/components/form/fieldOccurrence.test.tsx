// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { FieldOccurrenceRegistry, fieldOccurrenceTestSegment } from './fieldOccurrence';
import { AutoField } from './fields';
import { AdhocFormProvider } from './formContext';

import type * as dyn from '@nikkierp/common/dynamicModel';


const modelSchema = {
	name: 'test_thing',
	fields: {
		name: {
			name: 'name', label: { 'en-US': 'name' }, data_type: { name: 'string' }, is_required_for_create: true,
		},
		qty: { name: 'qty', label: { 'en-US': 'qty' }, data_type: { name: 'int32' } },
	},
} as unknown as dyn.ModelSchema;

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});

afterEach(cleanup);

function renderTwice(onSubmit: (data: Record<string, unknown>) => void = () => undefined) {
	const view = render(
		<MantineProvider env='test'>
			<AdhocFormProvider formVariant='create' modelSchema={modelSchema} localize={key => String(key ?? '')}>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(data => onSubmit(data))}>
						<AutoField name='name' />
						<AutoField name='qty' />
						<AutoField name='name' />
						<AutoField name='qty' />
						<button type='submit'>Save</button>
					</form>
				)}
			</AdhocFormProvider>
		</MantineProvider>,
	);
	const byTestId = (testId: string) => view.container.querySelector(`[data-testid="${testId}"]`) as HTMLInputElement;
	return { view, byTestId };
}

describe('a field shown more than once', () => {
	it('gives every copy after the first its own test id', () => {
		const { view } = renderTwice();
		const ids = [...view.container.querySelectorAll('[data-testid^="form.field."]')]
			.map(element => element.getAttribute('data-testid'));
		expect(ids).toEqual(['form.field.name', 'form.field.qty', 'form.field.name.copy2', 'form.field.qty.copy2']);
	});

	it('binds every copy to the one form value, text and number alike', async () => {
		const { byTestId } = renderTwice();
		await act(async () => {
			fireEvent.change(byTestId('form.field.name.copy2'), { target: { value: 'Kiosk' } });
			fireEvent.change(byTestId('form.field.qty'), { target: { value: '12' } });
		});
		expect(byTestId('form.field.name').value).toBe('Kiosk');
		expect(byTestId('form.field.name.copy2').value).toBe('Kiosk');
		expect(byTestId('form.field.qty.copy2').value).toBe('12');
	});

	it('shows its error on the first copy only', async () => {
		const { view, byTestId } = renderTwice();
		await act(async () => {
			fireEvent.submit(view.container.querySelector('form') as HTMLFormElement);
		});
		await waitFor(() => expect(byTestId('form.field.name').getAttribute('aria-invalid')).toBe('true'));
		expect(byTestId('form.field.name.copy2').getAttribute('aria-invalid')).not.toBe('true');
	});

	it('submits the field once, with the value typed into any copy', async () => {
		const submitted: Record<string, unknown>[] = [];
		const { view, byTestId } = renderTwice(data => submitted.push(data));
		await act(async () => {
			fireEvent.change(byTestId('form.field.name.copy2'), { target: { value: 'Kiosk' } });
			fireEvent.submit(view.container.querySelector('form') as HTMLFormElement);
		});
		await waitFor(() => expect(submitted).toHaveLength(1));
		expect(Object.keys(submitted[0]).filter(key => key === 'name')).toEqual(['name']);
		expect(submitted[0].name).toBe('Kiosk');
	});
});

describe('FieldOccurrenceRegistry', () => {
	it('numbers copies in registration order and renumbers when one leaves', () => {
		const registry = new FieldOccurrenceRegistry();
		const leaveFirst = registry.register('uom_id', 'a');
		registry.register('uom_id', 'b');
		expect([registry.indexOf('uom_id', 'a'), registry.indexOf('uom_id', 'b'), registry.countOf('uom_id')])
			.toEqual([0, 1, 2]);
		leaveFirst();
		expect([registry.indexOf('uom_id', 'b'), registry.countOf('uom_id')]).toEqual([0, 1]);
	});

	it('names the test id segment of later copies only', () => {
		expect([0, 1, 2].map(fieldOccurrenceTestSegment)).toEqual([undefined, 'copy2', 'copy3']);
	});
});
