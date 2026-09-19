import { Switch } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { JsonLangText } from '../../../i18n';
import { LocalizedDateTime } from '../../Localized/LocalizedDateTime';
import { LocalizedMoney } from '../../Localized/LocalizedMoney';
import { LocalizedNumber } from '../../Localized/LocalizedNumber';

import type { TranslateFn } from '../../../i18n';
import type { DateTimeKind } from '../../Localized/localizedFormat';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export type CellAlignment = 'left' | 'right';

/**
 * Default, data-type-driven cell rendering for `ExcelDataTable`.
 *
 * These are *not* view-engine contributions: they are chosen by the field's declared data type,
 * not by a name in page metadata. Registrable renderers (`avatar`, `badge`, `translated`,
 * `money`) are passed in through the Provider's `fieldRenderers` and take precedence.
 */
export function applyCustomRenderer(
	renderer: IFieldRenderer,
	textValue: string,
	t: TranslateFn,
	rawValue?: unknown,
): React.ReactNode {
	// A structured value has to reach the renderer intact; `textValue` is already `String(value)`
	// by this point, which is `[object Object]` for anything but a scalar.
	if (renderer.renderRaw) {
		return renderer.renderRaw(rawValue, textValue);
	}
	// An empty value has no translation to look up: a prefixing `translationKey` would build the
	// bare prefix (`orders.tx_status.`), which resolves to nothing and renders as that raw key.
	const translatedValue = renderer.translationKey && textValue !== ''
		? t(renderer.translationKey(textValue))
		: textValue;
	return renderer.render(textValue, translatedValue);
}

/** Renders the translated form of a value and nothing else; the kit registers it as `translated`. */
export class TranslatedFieldRenderer implements IFieldRenderer {
	#transPrefix: string;

	constructor(translationKeyPrefix: string = '') {
		this.#transPrefix = translationKeyPrefix;
	}

	public render(_: string, translatedValue: string): React.ReactNode {
		return translatedValue;
	}

	public translationKey?(value: string): string {
		return `${this.#transPrefix}${value}`;
	}
}

/**
 * A money amount. The schema has no money type — money is `decimal` with a `scale` — so a page
 * declares which columns are money, and the kit registers this under the `money` spec name.
 * Blank stays blank; the formatter's `—` is for detail pages.
 *
 * Both constructor arguments are optional: the organization's own currency supplies the symbol and
 * the decimal places, and a page names them only for a column denominated in another currency.
 */
export class MoneyFieldRenderer implements IFieldRenderer {
	public readonly align: CellAlignment = 'right';
	#symbol: string | undefined;
	#fractionDigits: number | undefined;

	constructor(currencySymbol?: string, fractionDigits?: number) {
		this.#symbol = currencySymbol;
		this.#fractionDigits = fractionDigits;
	}

	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		if (rawValue === '') {
			return '';
		}
		return <LocalizedMoney value={rawValue} currencySymbol={this.#symbol} fractionDigits={this.#fractionDigits} />;
	}
}

export type DataTypeCellRenderer = {
	align?: CellAlignment,
	matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean,
	render(rawValue: unknown, textValue: string, fieldSchema?: dyn.ModelSchemaField): React.ReactNode,
};

export class BooleanCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'boolean';
	}

	public render(rawValue: unknown, _textValue: string): React.ReactNode {
		return <Switch readOnly checked={normalizeBooleanValue(rawValue)} tabIndex={-1} />;
	}
}

const numberDataTypes: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set(['int32', 'int64', 'decimal']);

export class NumberCellRenderer implements DataTypeCellRenderer {
	public readonly align: CellAlignment = 'right';

	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName !== null && numberDataTypes.has(dataTypeName);
	}

	public render(_rawValue: unknown, textValue: string, fieldSchema?: dyn.ModelSchemaField): React.ReactNode {
		if (textValue === '') {
			return '';
		}
		return <LocalizedNumber value={textValue} fractionDigits={getDecimalScale(fieldSchema)} />;
	}
}

const dateTimeKinds: Partial<Record<dyn.ModelSchemaFieldDataTypeName, DateTimeKind>> = {
	nikkiDate: 'date',
	nikkiTime: 'time',
	nikkiDateTime: 'datetime',
};

export class DateTimeCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName !== null && dataTypeName in dateTimeKinds;
	}

	public render(_rawValue: unknown, textValue: string, fieldSchema?: dyn.ModelSchemaField): React.ReactNode {
		if (textValue === '') {
			return '';
		}
		const name = typeof fieldSchema?.data_type === 'string' ? fieldSchema.data_type : fieldSchema?.data_type?.name;
		return <LocalizedDateTime value={textValue} kind={name ? dateTimeKinds[name] : undefined} />;
	}
}

export class SecretCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'secret';
	}

	public render(_rawValue: unknown, _textValue: string): React.ReactNode {
		return '********';
	}
}

export class MonospaceCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'ulid' || dataTypeName === 'uuid' || dataTypeName === 'phone';
	}

	public render(_rawValue: unknown, textValue: string): React.ReactNode {
		return <code>{textValue}</code>;
	}
}

export class JsonLangCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'nikkiLangJson';
	}

	public render(rawValue: unknown, _textValue: string): React.ReactNode {
		return <JsonLangText langJson={toLangJson(rawValue)} />;
	}
}

export class JsonMapCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'jsonmap';
	}

	public render(rawValue: unknown, _textValue: string): React.ReactNode {
		if (rawValue == null) {
			return '';
		}
		return <code>{JSON.stringify(rawValue)}</code>;
	}
}

const defaultDataTypeCellRenderers: readonly DataTypeCellRenderer[] = [
	new BooleanCellRenderer(),
	new NumberCellRenderer(),
	new DateTimeCellRenderer(),
	new SecretCellRenderer(),
	new MonospaceCellRenderer(),
	new JsonLangCellRenderer(),
	new JsonMapCellRenderer(),
];

export function findDefaultRenderer(
	dataTypeName: dyn.ModelSchemaFieldDataTypeName | null,
): DataTypeCellRenderer | undefined {
	return defaultDataTypeCellRenderers.find(r => r.matches(dataTypeName));
}

export function renderDefaultByDataType(
	rawValue: unknown,
	textValue: string,
	dataTypeName: dyn.ModelSchemaFieldDataTypeName | null,
	fieldSchema?: dyn.ModelSchemaField,
): React.ReactNode {
	const renderer = findDefaultRenderer(dataTypeName);
	return renderer ? renderer.render(rawValue, textValue, fieldSchema) : textValue;
}

/** The `scale` a decimal field declares, so `12.5` in a scale-2 column reads `12.50`. */
export function getDecimalScale(fieldSchema?: dyn.ModelSchemaField): number | undefined {
	if (!fieldSchema || typeof fieldSchema.data_type === 'string') {
		return undefined;
	}
	const scale = fieldSchema.data_type.options?.scale;
	return typeof scale === 'number' && scale >= 0 ? scale : undefined;
}

export function toLangJson(rawValue: unknown): dyn.ModelSchemaLangJson {
	if (rawValue != null && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
		return rawValue as dyn.ModelSchemaLangJson;
	}
	if (typeof rawValue === 'string') {
		try {
			const parsed: unknown = JSON.parse(rawValue);
			if (parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as dyn.ModelSchemaLangJson;
			}
			throw new Error(`Expected JSON object for nikkiLangJson, got ${typeof parsed}`);
		}
		catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`Invalid JSON for nikkiLangJson: ${rawValue}`, { cause: error });
			}
			throw error;
		}
	}
	return {};
}

export function normalizeBooleanValue(rawValue: unknown): boolean {
	if (typeof rawValue === 'boolean') {
		return rawValue;
	}
	if (typeof rawValue === 'number') {
		return rawValue !== 0;
	}
	if (typeof rawValue === 'string') {
		const normalized = rawValue.trim().toLowerCase();
		return normalized === 'yes' || normalized === 'true' || normalized === '1';
	}
	return false;
}
