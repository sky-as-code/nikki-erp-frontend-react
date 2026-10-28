import { Textarea } from '@mantine/core';
import React from 'react';

import { useInlineControls } from '../Input/inlineControls';

import type { TextareaProps } from '@mantine/core';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** From this declared maximum length a `string` field edits in a textarea rather than a one-line input. */
export const LONG_TEXT_MIN_LENGTH = 1000;

/** A `string` field whose `length` option allows at least {@link LONG_TEXT_MIN_LENGTH} characters. */
export function isLongTextField(fieldDef: dyn.ModelSchemaField | undefined): boolean {
	if (fieldDef?.data_type.name !== 'string' || fieldDef.data_type.is_array) {
		return false;
	}
	const length = fieldDef.data_type.options?.length;
	const maxLength = Array.isArray(length) ? Number(length[1]) : Number.NaN;
	return Number.isFinite(maxLength) && maxLength >= LONG_TEXT_MIN_LENGTH;
}

export type LongTextInputProps = Omit<TextareaProps, 'ref'> & {
	ref?: React.Ref<HTMLTextAreaElement>,
};

/**
 * The textarea of a long `string` field: three rows in a form, one in an inline-edited table row,
 * where a taller cell would push the rest of the table down. The user drags the browser's own
 * handle to make it taller. It does not autosize, because autosizing would reset the height on
 * every keystroke. Enter in it is a new line; the row's own Enter-to-save leaves a textarea alone.
 *
 * Not the `Input` wrapper's density box: that fixes the control height, which a resizable textarea
 * cannot have. It takes the form's `size` alone, so its text matches the other inputs.
 */
export function LongTextInput({ size, ...props }: LongTextInputProps): React.ReactNode {
	const inline = useInlineControls();
	const rows = inline ? 1 : 3;
	return (
		<Textarea
			rows={rows}
			resize='vertical'
			size={size}
			{...props}
		/>
	);
}
