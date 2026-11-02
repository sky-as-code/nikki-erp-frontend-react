import { RadioEnumField } from '@nikkierp/ui/components/form';
import React from 'react';
import { z } from 'zod';

import type { FieldInputOptions, IFieldRenderer } from '@nikkierp/viewengine/core';


export const radioSpecSchema = z.object({
	renderer: z.literal('radio'),
	/** Translation key prefix of the value's label in read mode, as for `enum`. */
	prefix: z.string().optional(),
}).strict();

/**
 * An enum field edited as radios instead of a select: one per schema enum value, labelled as the
 * select labels them. Read mode shows the label as plain text, no badge.
 */
export class RadioFieldRenderer implements IFieldRenderer {
	public readonly translationKey?: (value: string) => string;

	public constructor(prefix?: string) {
		this.translationKey = prefix === undefined ? undefined : (value: string) => `${prefix}${value}`;
	}

	public render(rawValue: string, translatedValue: string): React.ReactNode {
		return rawValue ? translatedValue || rawValue : '';
	}

	public renderInput(field: string, options: FieldInputOptions): React.ReactNode {
		return <RadioEnumField name={field} disabled={options.disabled} />;
	}
}
