import { MoneyInputField } from '@nikkierp/ui/components/form';
import { EnumRenderer, FloatRenderer, IntegerRenderer, MoneyRenderer } from '@nikkierp/ui/components/valueRenderers';
import React from 'react';
import { z } from 'zod';

import type { FieldInputOptions, IFieldRenderer } from '@nikkierp/viewengine/core';


/** `compact` abbreviates large values with `K` / `M` / `B`, the same letters in every language. */
export const integerSpecSchema = z.object({
	renderer: z.literal('integer'),
	compact: z.boolean().optional(),
}).strict();

export const floatSpecSchema = z.object({
	renderer: z.literal('float'),
	precision: z.number().int().min(0).max(20).optional(),
	compact: z.boolean().optional(),
}).strict();

/**
 * Shows a sibling field of the record in place of this one, read mode only: a unit relation read as
 * its `uom_symbol` rather than its name. Editing keeps the field's own input.
 */
export const fieldTextSpecSchema = z.object({
	renderer: z.literal('fieldText'),
	field: z.string().min(1),
}).strict();

export class FieldTextRenderer implements IFieldRenderer {
	public constructor(private readonly field: string) {}

	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return rawValue;
	}

	/** Blank when the sibling is: this field's own value (an id, typically) is not meant for reading. */
	public renderRaw(_rawValue: unknown, _textValue?: string, record?: Record<string, unknown>): React.ReactNode {
		const shown = record?.[this.field];
		return typeof shown === 'string' ? shown : '';
	}
}

export const moneySpecSchema = z.object({
	renderer: z.literal('money'),
	/**
	 * A sibling field holding the record's currency code, e.g. a sales order's `currency_code`.
	 * Omitted or empty, the amount is in the user's default currency.
	 */
	currencyField: z.string().min(1).optional(),
	/** Shows a blank amount as 0, for a field whose NULL means "nothing added" (an extra price). */
	blankAsZero: z.boolean().optional(),
	compact: z.boolean().optional(),
}).strict();

export const enumSpecSchema = z.object({
	renderer: z.literal('enum'),
	colorMap: z.record(z.string(), z.string()).default({}),
	/** Translation key prefix of the value's label; omitted, the raw value is shown. */
	prefix: z.string().optional(),
}).strict();

type CellAlignment = 'left' | 'right';

/** Blank stays blank in a list cell; a detail page prints `-` before a renderer is reached. */
function isBlank(rawValue: unknown): boolean {
	return rawValue === null || rawValue === undefined || rawValue === '';
}

export class IntegerFieldRenderer implements IFieldRenderer {
	public readonly align: CellAlignment = 'right';

	public constructor(private readonly compact = false) {}

	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return isBlank(rawValue) ? '' : <IntegerRenderer rawValue={rawValue} compact={this.compact} />;
	}
}

export class FloatFieldRenderer implements IFieldRenderer {
	public readonly align: CellAlignment = 'right';

	public constructor(private readonly precision?: number, private readonly compact = false) {}

	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return isBlank(rawValue)
			? ''
			: <FloatRenderer rawValue={rawValue} precision={this.precision} compact={this.compact} />;
	}
}

/**
 * The decimal places of a record currency other than the user's default are not known here — the
 * frontend has no currency catalogue — so such an amount falls back to the system default precision.
 */
export class MoneyValueFieldRenderer implements IFieldRenderer {
	public readonly align: CellAlignment = 'right';

	public constructor(
		private readonly currencyField?: string, private readonly blankAsZero = false, private readonly compact = false,
	) {}

	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return this.renderRaw(rawValue);
	}

	public renderRaw(rawValue: unknown, _textValue?: string, record?: Record<string, unknown>): React.ReactNode {
		if (isBlank(rawValue) && !this.blankAsZero) {
			return '';
		}
		const amount = isBlank(rawValue) ? 0 : rawValue as string | number;
		const code = this.currencyField ? record?.[this.currencyField] : undefined;
		const currency = typeof code === 'string' && code !== '' ? { code } : undefined;
		return <MoneyRenderer rawValue={amount} currency={currency} compact={this.compact} />;
	}

	/** Edited with the system currency as a segment, on the side the currency writes it. */
	public renderInput(field: string, options: FieldInputOptions): React.ReactNode {
		return <MoneyInputField name={field} disabled={options.disabled} />;
	}
}

export class EnumFieldRenderer implements IFieldRenderer {
	public readonly translationKey?: (value: string) => string;

	public constructor(private readonly colorMap: Record<string, string>, prefix?: string) {
		this.translationKey = prefix === undefined ? undefined : (value: string) => `${prefix}${value}`;
	}

	public render(rawValue: string, translatedValue: string): React.ReactNode {
		if (isBlank(rawValue)) {
			return '';
		}
		return <EnumRenderer rawValue={rawValue} colorMap={this.colorMap} label={translatedValue || rawValue} />;
	}
}
