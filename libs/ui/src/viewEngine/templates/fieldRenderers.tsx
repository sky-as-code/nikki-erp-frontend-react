import { Avatar, Badge, Checkbox } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import React from 'react';

import type { TranslateFn } from '../../i18n';


export interface IFieldRenderer {
	/** Render the value.
	 * @param rawValue The raw value as display text (or string form for custom renderers).
	 * @param translatedValue Translated value; same as `rawValue` when `translationKey` is not set.
	 */
	render(rawValue: string, translatedValue: string): React.ReactNode;

	/** When set, the value is translated with this key before `render` runs. */
	translationKey?(value: string): string;
}

export type FieldRendererMap = Record<string, IFieldRenderer>;

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

export class AvatarFieldRenderer implements IFieldRenderer {
	public render(rawValue: string, _: string): React.ReactNode {
		return <Avatar src={rawValue || undefined} size='lg' radius='md' />;
	}
}

export type BadgeFieldRendererProps = {
	colorMap: Record<string, string>,
	translationKey?: (value: string) => string,
};

export class BadgeFieldRenderer implements IFieldRenderer {
	private readonly colorMap: Record<string, string>;
	public readonly translationKey?: (value: string) => string;

	constructor(props: BadgeFieldRendererProps) {
		this.colorMap = props.colorMap;
		this.translationKey = props.translationKey;
	}

	public render(rawValue: string, translatedValue: string): React.ReactNode {
		return <Badge variant='filled' color={this.colorMap[rawValue]}>{translatedValue}</Badge>;
	}
}

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

export class BooleanFieldRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'boolean';
	}

	public render(rawValue: unknown, _textValue: string): React.ReactNode {
		return <Checkbox readOnly checked={normalizeBooleanValue(rawValue)} />;
	}
}

export class SecretFieldRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'secret';
	}

	public render(_rawValue: unknown, _textValue: string): React.ReactNode {
		return '********';
	}
}

export class MonospaceFieldRenderer implements DataTypeCellRenderer {
	public matches(dataTypeName: dyn.ModelSchemaFieldDataTypeName | null): boolean {
		return dataTypeName === 'ulid' || dataTypeName === 'uuid' || dataTypeName === 'phone';
	}

	public render(_rawValue: unknown, textValue: string): React.ReactNode {
		return <code>{textValue}</code>;
	}
}

const defaultDataTypeCellRenderers: readonly DataTypeCellRenderer[] = [
	new BooleanFieldRenderer(),
	new SecretFieldRenderer(),
	new MonospaceFieldRenderer(),
];

export function renderDefaultByDataType(
	rawValue: unknown,
	textValue: string,
	dataTypeName: dyn.ModelSchemaFieldDataTypeName | null,
): React.ReactNode {
	const renderer = defaultDataTypeCellRenderers.find(r => r.matches(dataTypeName));
	return renderer ? renderer.render(rawValue, textValue) : textValue;
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
