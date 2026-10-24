import { EnumRenderer, FloatRenderer, IntegerRenderer, MoneyRenderer } from '@nikkierp/ui/components/valueRenderers';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { registerFieldRenderers } from './register';
import {
	EnumFieldRenderer, FloatFieldRenderer, IntegerFieldRenderer, MoneyValueFieldRenderer,
} from './valueRenderers';

import type { FieldRendererFactory, IFieldRenderer, IViewRegistry } from '@nikkierp/viewengine/core';


type Element<P> = React.ReactElement<P>;

function registeredFactories(): Map<string, FieldRendererFactory> {
	const factories = new Map<string, FieldRendererFactory>();
	const registry = {
		registerFieldRenderer: (name: string, factory: FieldRendererFactory) => factories.set(name, factory),
	} as unknown as IViewRegistry;
	registerFieldRenderers(registry);
	return factories;
}

function build(spec: Record<string, unknown>): IFieldRenderer {
	return registeredFactories().get(spec.renderer as string)!(spec as never) as IFieldRenderer;
}

describe('registered value renderers', () => {
	it('builds each renderer from its spec', () => {
		expect(build({ renderer: 'integer' })).toBeInstanceOf(IntegerFieldRenderer);
		expect(build({ renderer: 'float', precision: 3 })).toBeInstanceOf(FloatFieldRenderer);
		expect(build({ renderer: 'money', currencyField: 'currency_code' })).toBeInstanceOf(MoneyValueFieldRenderer);
		expect(build({ renderer: 'enum', colorMap: { done: 'green' }, prefix: 'status.' }))
			.toBeInstanceOf(EnumFieldRenderer);
	});

	it('rejects unknown spec options', () => {
		expect(() => build({ renderer: 'float', digits: 3 })).toThrow();
	});
});

describe('IntegerFieldRenderer and FloatFieldRenderer', () => {
	it('right-align and wrap the value renderers', () => {
		const integer = new IntegerFieldRenderer();
		expect(integer.align).toBe('right');
		expect((integer.render('12', '12') as Element<object>).type).toBe(IntegerRenderer);
		const node = new FloatFieldRenderer(3).render('1.5', '1.5') as Element<{ precision?: number }>;
		expect(node.type).toBe(FloatRenderer);
		expect(node.props.precision).toBe(3);
	});

	it('leave a blank cell blank', () => {
		expect(new IntegerFieldRenderer().render('', '')).toBe('');
		expect(new FloatFieldRenderer().render('', '')).toBe('');
	});
});

describe('MoneyValueFieldRenderer', () => {
	type MoneyProps = { rawValue: unknown, currency?: { code: string } };

	it('reads the currency code from the record', () => {
		const node = new MoneyValueFieldRenderer('currency_code')
			.renderRaw('1000', '1000', { currency_code: 'USD' }) as Element<MoneyProps>;
		expect(node.type).toBe(MoneyRenderer);
		expect(node.props.currency).toEqual({ code: 'USD' });
	});

	it('falls back to the default currency without a record currency', () => {
		const node = new MoneyValueFieldRenderer('currency_code').renderRaw('1000', '1000', {}) as Element<MoneyProps>;
		expect(node.props.currency).toBeUndefined();
	});

	it('leaves a blank cell blank', () => {
		expect(new MoneyValueFieldRenderer().renderRaw(null)).toBe('');
	});

	it('shows a blank amount as 0 when asked to', () => {
		const node = new MoneyValueFieldRenderer(undefined, true).renderRaw(null) as Element<MoneyProps>;
		expect(node.type).toBe(MoneyRenderer);
		expect(node.props.rawValue).toBe(0);
	});
});

describe('EnumFieldRenderer', () => {
	type EnumProps = { colorMap: Record<string, string>, label: string };

	it('translates through the prefix and passes the colour map', () => {
		const renderer = new EnumFieldRenderer({ done: 'green' }, 'status.');
		expect(renderer.translationKey?.('done')).toBe('status.done');
		const node = renderer.render('done', 'Done') as Element<EnumProps>;
		expect(node.type).toBe(EnumRenderer);
		expect(node.props.label).toBe('Done');
		expect(node.props.colorMap).toEqual({ done: 'green' });
	});

	it('shows the raw value without a prefix, and leaves a blank cell blank', () => {
		const renderer = new EnumFieldRenderer({});
		expect(renderer.translationKey).toBeUndefined();
		expect(renderer.render('', '')).toBe('');
	});
});
