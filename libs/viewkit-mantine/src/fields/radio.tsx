import { RadioEnumField } from '@nikkierp/ui/components/form';
import React from 'react';
import { z } from 'zod';

import { EnumFieldRenderer } from './valueRenderers';

import type { FieldInputOptions } from '@nikkierp/viewengine/core';


export const radioSpecSchema = z.object({
	renderer: z.literal('radio'),
	colorMap: z.record(z.string(), z.string()).default({}),
	/** Translation key prefix of the value's label in read mode, as for `enum`. */
	prefix: z.string().optional(),
}).strict();

/**
 * An enum field edited as radios instead of a select: one per schema enum value, labelled as the
 * select labels them. Read mode and list cells render exactly as the `enum` renderer.
 */
export class RadioFieldRenderer extends EnumFieldRenderer {
	public renderInput(field: string, options: FieldInputOptions): React.ReactNode {
		return <RadioEnumField name={field} disabled={options.disabled} />;
	}
}
