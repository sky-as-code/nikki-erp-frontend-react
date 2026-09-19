import { Pill } from '@mantine/core';
import React from 'react';
import { z } from 'zod';

import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export const attributePillsSpecSchema = z.object({
	renderer: z.literal('attributePills'),
	/**
	 * Separator between the attribute name and its value inside one pill. Only the spacing after
	 * it is fixed, so a locale that writes `Size = Big` can say so.
	 */
	separator: z.string().default(':'),
}).strict();

/**
 * One value of the rendered cell: an attribute and the value this record has for it.
 *
 * The value alone is ambiguous on a listing — "Big" says nothing without "Size" beside it — so a
 * pill carries both.
 */
export type AttributePair = {
	name?: string,
	value?: string,
};

export type AttributePillsFieldRendererProps = {
	separator: string,
};

/**
 * Renders a record's attributes as one pill per attribute: `[Size: Big] [Colour: Red]`.
 *
 * Implements `renderRaw` rather than `render` because the cell is built from a list of pairs, and
 * the text form a plain `render` receives is `String(value)` — `[object Object]` for anything but
 * a scalar. The list is produced by the backend as a single readable field: the names live three
 * edges from the record that shows them, further than a column selection can reach.
 */
export class AttributePillsFieldRenderer implements IFieldRenderer {
	private readonly separator: string;

	constructor(props: AttributePillsFieldRendererProps) {
		this.separator = props.separator;
	}

	public render(_: string, translatedValue: string): React.ReactNode {
		return translatedValue;
	}

	public renderRaw(rawValue: unknown, _textValue: string): React.ReactNode {
		const pairs = toAttributePairs(rawValue);
		if (pairs.length === 0) {
			// Not an empty pill: a record with no attributes has nothing to say, and a blank cell
			// is what the rest of the table uses for an absent value.
			return '';
		}
		return (
			<Pill.Group>
				{pairs.map((pair, index) => (
					<Pill key={`${pair.name ?? ''}-${pair.value ?? ''}-${index}`}>
						{attributePillText(pair, this.separator)}
					</Pill>
				))}
			</Pill.Group>
		);
	}
}

/** The text of one pill: the attribute name, then its value, or the value where there is no name. */
export function attributePillText(pair: AttributePair, separator: string): string {
	if (!pair.name) {
		return pair.value ?? '';
	}
	return `${pair.name}${separator} ${pair.value ?? ''}`.trimEnd();
}

/**
 * Reads the cell value into pairs, accepting the shapes the backend may send it in.
 *
 * A list of `{name, value}` objects is the intended form. A list of plain strings is accepted
 * because a value with no attribute to qualify it is still worth showing, and a single string is
 * accepted so a scalar column can be pointed at this renderer without producing one pill that
 * says `[object Object]`.
 */
export function toAttributePairs(rawValue: unknown): AttributePair[] {
	if (rawValue == null || rawValue === '') {
		return [];
	}
	const values = Array.isArray(rawValue) ? rawValue : [rawValue];
	return values
		.map(entry => toAttributePair(entry))
		.filter((pair): pair is AttributePair => pair !== null);
}

function toAttributePair(entry: unknown): AttributePair | null {
	if (entry == null || entry === '') {
		return null;
	}
	if (typeof entry === 'object') {
		const record = entry as Record<string, unknown>;
		const name = readText(record.name ?? record.attribute ?? record.attribute_name);
		const value = readText(record.value ?? record.attribute_value ?? record.attribute_value_name);
		return name || value ? { name, value } : null;
	}
	return { value: String(entry) };
}

function readText(value: unknown): string | undefined {
	if (value == null || value === '') {
		return undefined;
	}
	return typeof value === 'string' ? value : String(value);
}
