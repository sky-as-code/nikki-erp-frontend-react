// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TextInputField } from './fields';
import { isLongTextField } from './longText';
import { InlineControlsScope } from '../Input/inlineControls';

import type * as dyn from '@nikkierp/common/dynamicModel';


const harness = vi.hoisted(() => ({ fieldDef: undefined as unknown, register: undefined as unknown }));

vi.mock('./formContext', async importOriginal => ({
	...await importOriginal<object>(),
	useFieldData: () => ({ label: 'Notes', isRequired: false, fieldDef: harness.fieldDef }),
	useFormField: () => ({ register: harness.register, modelValue: null, modelLoading: false, formVariant: 'update' }),
}));

function stringField(maxLength?: number): dyn.ModelSchemaField {
	const options = maxLength === undefined ? undefined : { length: [0, maxLength] };
	return { name: 'notes', label: 'Notes', data_type: { name: 'string', options } } as unknown as dyn.ModelSchemaField;
}

beforeAll(() => {
	// The autosizing textarea re-measures when web fonts load, which jsdom does not model.
	const noop = () => undefined;
	(document as { fonts?: unknown }).fonts ??= { addEventListener: noop, removeEventListener: noop };
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
});
afterEach(cleanup);

function Host({ inline = false }: { inline?: boolean }): React.ReactNode {
	const form = useForm();
	harness.register = form.register;
	const field = <TextInputField name='notes' type='text' ref={React.createRef()} localize={value => String(value ?? '')} />;
	return inline ? <InlineControlsScope>{field}</InlineControlsScope> : field;
}

function renderField(fieldDef: dyn.ModelSchemaField, inline = false) {
	harness.fieldDef = fieldDef;
	return render(<MantineProvider env='test'><Host inline={inline} /></MantineProvider>);
}

describe('isLongTextField', () => {
	it('is a string allowing at least 1000 characters', () => {
		expect(isLongTextField(stringField(1000))).toBe(true);
		expect(isLongTextField(stringField(4000))).toBe(true);
		expect(isLongTextField(stringField(999))).toBe(false);
		expect(isLongTextField(stringField())).toBe(false);
		expect(isLongTextField({ ...stringField(2000), data_type: { name: 'email', options: { length: [0, 2000] } } }))
			.toBe(false);
		expect(isLongTextField(undefined)).toBe(false);
	});
});

describe('TextInputField for a long string', () => {
	it('edits a long string in a resizable textarea', () => {
		const { container } = renderField(stringField(2000));
		const textarea = container.querySelector('textarea');
		expect(textarea?.getAttribute('rows')).toBe('3');
		expect(textarea?.closest('[style*="--input-resize: vertical"]')).not.toBeNull();
		expect(textarea).not.toBeNull();
		expect(textarea?.getAttribute('name')).toBe('notes');
		expect(container.querySelector('input[type="text"]')).toBeNull();
	});

	it('keeps a one-line input for a short string', () => {
		const { container } = renderField(stringField(200));
		expect(container.querySelector('textarea')).toBeNull();
		expect(container.querySelector('input[type="text"]')).not.toBeNull();
	});

	it('starts a single row tall in an inline-edited table row', () => {
		const { container } = renderField(stringField(2000), true);
		expect(container.querySelector('textarea')?.getAttribute('rows')).toBe('1');
	});
});
