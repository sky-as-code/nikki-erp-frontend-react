// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveCreateDefault, useCreateDefault } from './createDefault';

import type * as dyn from '@nikkierp/common/dynamicModel';


const harness = vi.hoisted(() => ({
	formVariant: 'create' as 'create' | 'update',
	form: undefined as UseFormReturn<any> | undefined,
}));

vi.mock('./formContext', () => ({
	useFormField: () => ({ formVariant: harness.formVariant, getFieldDef: (name: string) => FIELDS[name] }),
	useCrudFormRuntime: () => (harness.form ? { form: harness.form } : null),
}));

function field(name: string, overrides: Partial<dyn.ModelSchemaField>): dyn.ModelSchemaField {
	return { name, label: name, data_type: { name: 'string' }, ...overrides } as dyn.ModelSchemaField;
}

const MODE_TYPE = { name: 'enumString', options: { enumValues: ['instant', 'dynamic', 'never'] } };
const FIELDS: Record<string, dyn.ModelSchemaField> = {
	mode: field('mode', { data_type: MODE_TYPE, default_value: 'dynamic' } as Partial<dyn.ModelSchemaField>),
	code: field('code', {}),
};

afterEach(() => {
	cleanup();
	harness.formVariant = 'create';
	harness.form = undefined;
});

function Host({ initial, fields }: { initial: Record<string, unknown>, fields: string[] }): React.ReactNode {
	const form = useForm({ defaultValues: initial });
	harness.form = form;
	return <>{fields.map(name => <Field key={name} name={name} />)}</>;
}

function Field({ name }: { name: string }): null {
	useCreateDefault(name);
	return null;
}

describe('resolveCreateDefault', () => {
	it('takes a scalar default, and an enum default only when it is one of the options', () => {
		expect(resolveCreateDefault(FIELDS.mode)).toBe('dynamic');
		const unknownOption = field('mode', { data_type: MODE_TYPE, default_value: 'later' } as Partial<dyn.ModelSchemaField>);
		expect(resolveCreateDefault(unknownOption)).toBeUndefined();
		expect(resolveCreateDefault(field('flag', { data_type: { name: 'boolean' }, default_value: false }))).toBe(false);
	});

	it('skips fields without a default, non-scalar defaults and server-owned fields', () => {
		expect(resolveCreateDefault(FIELDS.code)).toBeUndefined();
		expect(resolveCreateDefault(field('tags', { default_value: ['a'] }))).toBeUndefined();
		expect(resolveCreateDefault(field('id', { default_value: 'x', is_auto_generated: true }))).toBeUndefined();
		expect(resolveCreateDefault(undefined)).toBeUndefined();
	});
});

describe('useCreateDefault', () => {
	it('pre-fills a rendered create field without marking it dirty', () => {
		render(<Host initial={{}} fields={['mode']} />);
		expect(harness.form?.getValues('mode')).toBe('dynamic');
		expect(harness.form?.formState.dirtyFields).toEqual({});
	});

	it('never overrides a value the page provided, null included', () => {
		render(<Host initial={{ mode: null }} fields={['mode']} />);
		expect(harness.form?.getValues('mode')).toBeNull();
	});

	it('restores the default after a reset that drops it', () => {
		render(<Host initial={{}} fields={['mode']} />);
		act(() => harness.form?.reset({ org_id: 'o1' }));
		expect(harness.form?.getValues()).toEqual({ org_id: 'o1', mode: 'dynamic' });
	});

	it('leaves update forms and unrendered fields alone', () => {
		harness.formVariant = 'update';
		render(<Host initial={{}} fields={['mode']} />);
		expect(harness.form?.getValues('mode')).toBeUndefined();
		cleanup();
		harness.formVariant = 'create';
		render(<Host initial={{}} fields={['code']} />);
		expect(harness.form?.getValues()).toEqual({});
	});
});
