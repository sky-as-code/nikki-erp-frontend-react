import { Checkbox } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { JsonLangText } from '../../i18n';

import type { TranslateFn } from '../../i18n';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


/**
 * Default, data-type-driven cell rendering for {@link DataTable}.
 *
 * These are *not* view-engine contributions: they are chosen by the field's
 * declared data type, not by a name in page metadata. The registrable field
 * renderers (`avatar`, `badge`, `translated`) live in the view kit instead.
 */
export function applyCustomRenderer(
	renderer: IFieldRenderer,
	textValue: string,
	t: TranslateFn,
): React.ReactNode {
	const translatedValue = renderer.translationKey
		? t(renderer.translationKey(textValue))
		: textValue;
	return renderer.render(textValue, translatedValue);
}

/**
 * Renders the translated form of a value and nothing else.
 *
 * Lives here rather than in the view kit because {@link DataTable} instantiates
 * it directly for its own settings column; it has no component-library
 * dependency. The kit still registers it under the `translated` spec name.
 */
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

type DataTypeCellRenderer = {
	matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean,
	render(rawValue: unknown, textValue: string): React.ReactNode,
};

export class BooleanCellRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'boolean';
	}

	public render(rawValue: unknown, _textValue: string): React.ReactNode {
		return <Checkbox readOnly checked={normalizeBooleanValue(rawValue)} />;
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

const defaultDataTypeCellRenderers: readonly DataTypeCellRenderer[] = [
	new BooleanCellRenderer(),
	new SecretCellRenderer(),
	new MonospaceCellRenderer(),
	new JsonLangCellRenderer(),
];

export function renderDefaultByDataType(
	rawValue: unknown,
	textValue: string,
	dataTypeName: dyn.ModelSchemaFieldDataTypeName | null,
): React.ReactNode {
	const renderer = defaultDataTypeCellRenderers.find(r => r.matches(dataTypeName));
	return renderer ? renderer.render(rawValue, textValue) : textValue;
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

function normalizeBooleanValue(rawValue: unknown): boolean {
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
