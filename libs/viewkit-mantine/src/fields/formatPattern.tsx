import { FormatPatternValue, groupingExample, strftimeExample, useFormatLocale } from '@nikkierp/ui/components';
import { NumberGroupingField, StrftimeFormatField } from '@nikkierp/ui/components/form';
import React from 'react';
import { z } from 'zod';

import type { FieldInputOptions, IFieldRenderer } from '@nikkierp/viewengine/core';


export const strftimeFormatSpecSchema = z.object({ renderer: z.literal('strftimeFormat') }).strict();

export const numberGroupingSpecSchema = z.object({ renderer: z.literal('numberGrouping') }).strict();

/** A string sibling of the row, or `undefined`. */
function textOf(record: Record<string, unknown> | undefined, field: string): string | undefined {
	const value = record?.[field];
	return typeof value === 'string' ? value : undefined;
}

/** Prints in the row's own `locale_code` when it is a language record, else the user's locale. */
function StrftimeValue({ pattern, recordLocale }: { pattern: string, recordLocale?: string }) {
	const locale = useFormatLocale(recordLocale || undefined);
	return <FormatPatternValue pattern={pattern} example={strftimeExample(pattern, locale, new Date())} />;
}

/**
 * `date_format`, `time_format`, `short_time_format` of a language record: read mode shows the
 * pattern and what it prints today, edit mode `StrftimeFormatField`.
 */
export class StrftimeFormatFieldRenderer implements IFieldRenderer {
	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return <StrftimeValue pattern={rawValue} />;
	}

	public renderRaw(_rawValue: unknown, textValue: string, record?: Record<string, unknown>): React.ReactNode {
		return <StrftimeValue pattern={textValue} recordLocale={textOf(record, 'locale_code')} />;
	}

	public renderInput(field: string, options: FieldInputOptions): React.ReactNode {
		return <StrftimeFormatField name={field} disabled={options.disabled} />;
	}
}

/** `grouping` of a language record, grouped with the row's own `thousands_separator`. */
export class NumberGroupingFieldRenderer implements IFieldRenderer {
	public render(rawValue: string, _translatedValue: string): React.ReactNode {
		return <FormatPatternValue pattern={rawValue} example={groupingExample(rawValue, ',')} />;
	}

	public renderRaw(_rawValue: unknown, textValue: string, record?: Record<string, unknown>): React.ReactNode {
		const separator = textOf(record, 'thousands_separator') ?? ',';
		return <FormatPatternValue pattern={textValue} example={groupingExample(textValue, separator)} />;
	}

	public renderInput(field: string, options: FieldInputOptions): React.ReactNode {
		return <NumberGroupingField name={field} disabled={options.disabled} />;
	}
}
