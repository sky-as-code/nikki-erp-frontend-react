// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { buildSavedTranslations } from './MultiLangInputModal';
import { nextTypedLangJson, TranslatableInput } from './TranslatableInput';

import type * as dyn from '@nikkierp/common/dynamicModel';


const LANGUAGES = ['vi-VN', 'en-US'];

beforeAll(async () => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
	await i18next.use(initReactI18next).init({ lng: 'en-US', supportedLngs: LANGUAGES, resources: {} });
});

afterEach(cleanup);

describe('nextTypedLangJson', () => {
	it('mirrors the typed text into languages without a value', () => {
		expect(nextTypedLangJson({}, 'en-US', 'N', LANGUAGES)).toEqual({ 'en-US': 'N', 'vi-VN': 'N' });
		expect(nextTypedLangJson({ 'en-US': 'N', 'vi-VN': 'N' }, 'en-US', 'Na', LANGUAGES))
			.toEqual({ 'en-US': 'Na', 'vi-VN': 'Na' });
	});

	it('keeps a language translated differently', () => {
		expect(nextTypedLangJson({ 'en-US': 'Blue', 'vi-VN': 'Xanh' }, 'en-US', 'Navy', LANGUAGES))
			.toEqual({ 'en-US': 'Navy', 'vi-VN': 'Xanh' });
	});

	it('clears the whole value when the input is emptied', () => {
		expect(nextTypedLangJson({ 'en-US': 'Blue', 'vi-VN': 'Xanh' }, 'en-US', '', LANGUAGES)).toEqual({});
	});
});

describe('buildSavedTranslations', () => {
	it('fills empty languages from their neighbours, or saves `{}` when all are blank', () => {
		expect(buildSavedTranslations({ 'vi-VN': 'Xanh', 'en-US': '' }, ['en-US', 'vi-VN']))
			.toEqual({ 'en-US': 'Xanh', 'vi-VN': 'Xanh' });
		expect(buildSavedTranslations({ 'en-US': ' ', 'vi-VN': '' }, ['en-US', 'vi-VN'])).toEqual({});
	});
});

function Harness({ initial, onValue }: {
	initial: dyn.ModelSchemaLangJson, onValue: (value: dyn.ModelSchemaLangJson) => void,
}) {
	const [value, setValue] = React.useState(initial);
	return (
		<TranslatableInput
			value={value}
			onChange={next => { setValue(next); onValue(next); }}
			label='Name'
			supportedLngs={LANGUAGES}
			testAttrs={{ 'data-testid': 'name' }}
		/>
	);
}

describe('TranslatableInput', () => {
	it('mirrors typing and clears to `{}`', async () => {
		let latest: dyn.ModelSchemaLangJson = {};
		const view = render(
			<MantineProvider env='test'><Harness initial={{}} onValue={v => { latest = v; }} /></MantineProvider>,
		);
		const input = view.getByTestId('name') as HTMLInputElement;
		await act(async () => {
			fireEvent.change(input, { target: { value: 'Navy' } });
		});
		expect(latest).toEqual({ 'en-US': 'Navy', 'vi-VN': 'Navy' });
		expect(input.value).toBe('Navy');
		await act(async () => {
			fireEvent.change(input, { target: { value: '' } });
		});
		expect(latest).toEqual({});
	});
});
