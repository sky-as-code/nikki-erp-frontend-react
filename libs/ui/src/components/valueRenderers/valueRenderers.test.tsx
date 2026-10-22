import { MantineProvider } from '@mantine/core';
import { CommandBus } from '@nikkierp/common/commandBus';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	configureValueRenderers, EnumRenderer, fetchValueFormatDefaults, FloatRenderer, IntegerRenderer,
	MoneyRenderer, resetValueRendererSettings, resolveMoneyCurrency, toFormatDefaults,
} from './index';
import { FormatDefaultsProvider } from '../Localized/formatDefaults';

import type { FormatDefaults } from '../Localized/formatDefaults';
import type { ICommandBus } from '@nikkierp/common/commandBus';


const VI: FormatDefaults = {
	locale: 'vi-VN',
	currency: { code: 'VND', symbol: '₫', decimalPlaces: 0 },
};

function html(node: React.ReactNode, defaults: FormatDefaults = VI): string {
	const tree = <FormatDefaultsProvider value={defaults}>{node}</FormatDefaultsProvider>;
	return renderToStaticMarkup(<MantineProvider>{tree}</MantineProvider>)
		.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
		.normalize('NFKC');
}

function fakeBus(data: unknown): ICommandBus {
	const publish = vi.fn(async () => ({ result: { data }, error: null }));
	return { publish } as unknown as ICommandBus;
}

const USER_CONTEXT = {
	accountSettings: {
		language: { isoCode: 'en-US', decimalSeparator: '.', thousandsSeparator: ',' },
		currency: { code: 'USD', symbol: '$', decimalPlaces: 2 },
	},
};

afterEach(() => {
	CommandBus.instance = undefined;
	configureValueRenderers({});
	resetValueRendererSettings();
});

describe('IntegerRenderer and FloatRenderer', () => {
	it('formats with the user locale separators', () => {
		expect(html(<IntegerRenderer rawValue='1234567' />)).toContain('1.234.567');
		expect(html(<FloatRenderer rawValue='1234.5' />)).toContain('1.234,50');
		expect(html(<FloatRenderer rawValue='1234.5' />, { locale: 'en-US' })).toContain('1,234.50');
	});

	it('honours an explicit precision', () => {
		expect(html(<FloatRenderer rawValue='3.14159' precision={3} />, { locale: 'en-US' })).toContain('3.142');
	});

	it('renders - for empty or unparsable values', () => {
		expect(html(<IntegerRenderer rawValue={null} />)).toBe('<span>-</span>');
		expect(html(<FloatRenderer rawValue='' />)).toBe('<span>-</span>');
		expect(html(<FloatRenderer rawValue='abc' />)).toBe('<span>-</span>');
	});
});

describe('MoneyRenderer', () => {
	it('takes precision and marker from the default currency', () => {
		expect(html(<MoneyRenderer rawValue='15000.4' />)).toContain('15.000 ₫');
	});

	it('takes precision from the given currency', () => {
		const usd = { code: 'USD', symbol: '$', decimalPlaces: 2 };
		expect(html(<MoneyRenderer rawValue='12' currency={usd} />, { locale: 'en-US' })).toContain('$12.00');
	});

	it('falls back to precision 2 and no marker without any currency', () => {
		expect(html(<MoneyRenderer rawValue='12' />, { locale: 'en-US' })).toBe('<span>12.00</span>');
	});

	it('renders - for an empty amount', () => {
		expect(html(<MoneyRenderer rawValue={undefined} />)).toBe('<span>-</span>');
	});
});

describe('resolveMoneyCurrency', () => {
	it('fills a same-code currency from the default', () => {
		expect(resolveMoneyCurrency({ code: 'VND' }, VI.currency)).toEqual(VI.currency);
	});

	it('keeps a foreign currency as given', () => {
		expect(resolveMoneyCurrency({ code: 'USD' }, VI.currency)).toEqual({ code: 'USD' });
	});
});

describe('EnumRenderer', () => {
	it('renders a filled badge coloured from the map, with the label', () => {
		const out = html(<EnumRenderer rawValue='done' colorMap={{ done: 'green' }} label='Done' />);
		expect(out).toContain('data-variant="filled"');
		expect(out).toContain('var(--mantine-color-green-filled)');
		expect(out).toContain('Done');
	});

	it('renders - for an empty value', () => {
		expect(html(<EnumRenderer rawValue='' />)).toBe('<span>-</span>');
	});
});

describe('fetchValueFormatDefaults', () => {
	it('maps the user context from the default command and caches it', async () => {
		const bus = fakeBus(USER_CONTEXT);
		CommandBus.instance = bus;
		const first = await fetchValueFormatDefaults();
		await fetchValueFormatDefaults();
		expect(first).toEqual(toFormatDefaults(USER_CONTEXT));
		expect(first.locale).toBe('en-US');
		expect(bus.publish).toHaveBeenCalledTimes(1);
		expect(bus.publish).toHaveBeenCalledWith({ name: 'shell.user_context.get' });
	});

	it('publishes the configured command', async () => {
		const bus = fakeBus(USER_CONTEXT);
		CommandBus.instance = bus;
		configureValueRenderers({ userSettingsCommand: 'custom.settings.get' });
		await fetchValueFormatDefaults();
		expect(bus.publish).toHaveBeenCalledWith({ name: 'custom.settings.get' });
	});

	it('does not cache a context the shell has not loaded yet', async () => {
		const bus = fakeBus(null);
		CommandBus.instance = bus;
		expect(await fetchValueFormatDefaults()).toEqual({});
		await Promise.resolve();
		await fetchValueFormatDefaults();
		expect(bus.publish).toHaveBeenCalledTimes(2);
	});

	it('answers empty defaults without a command bus', async () => {
		expect(await fetchValueFormatDefaults()).toEqual({});
	});
});
