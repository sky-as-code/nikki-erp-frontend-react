import { Box } from '@mantine/core';
import React from 'react';

import type * as dyn from '@nikkierp/common/dynamicModel';


/** Room for a quantity or price with its separators, and a currency segment, with little leeway. */
const NUMBER_WIDTH = '10rem';
const DECIMAL_WIDTH = '11rem';
/** A code or symbol (≤ 10 characters), and a short label (≤ 50). Longer text takes the whole track. */
const SHORT_TEXT_WIDTH = '8rem';
const MEDIUM_TEXT_WIDTH = '16rem';
const SHORT_TEXT_MAX_LENGTH = 10;
const MEDIUM_TEXT_MAX_LENGTH = 50;

/**
 * The width an input needs for the values its schema allows, or `undefined` to fill its track: a
 * number is never wider than its digits, a short string never wider than its maximum length. Types
 * whose input sizes itself (selects, dates, switches) and long text are left alone.
 */
export function autoInputWidthOf(fieldDef: dyn.ModelSchemaField | undefined): string | undefined {
	if (!fieldDef || fieldDef.data_type.is_array) {
		return undefined;
	}
	switch (fieldDef.data_type.name) {
		case 'int32':
		case 'int64':
			return NUMBER_WIDTH;
		case 'decimal':
			return DECIMAL_WIDTH;
		case 'string':
		case 'nikkiResourceCode':
			return textWidthOf(fieldDef);
		default:
			return undefined;
	}
}

function textWidthOf(fieldDef: dyn.ModelSchemaField): string | undefined {
	const length = fieldDef.data_type.options?.length;
	const maxLength = Array.isArray(length) ? Number(length[1]) : Number.NaN;
	if (!Number.isFinite(maxLength)) {
		return undefined;
	}
	if (maxLength <= SHORT_TEXT_MAX_LENGTH) {
		return SHORT_TEXT_WIDTH;
	}
	return maxLength <= MEDIUM_TEXT_MAX_LENGTH ? MEDIUM_TEXT_WIDTH : undefined;
}

const ExplicitWidthContext = React.createContext(false);

/** Marks the inputs below as sized by their page (a field group's `widths`): the automatic width steps aside. */
export function ExplicitInputWidth({ children }: React.PropsWithChildren): React.ReactNode {
	return <ExplicitWidthContext.Provider value={true}>{children}</ExplicitWidthContext.Provider>;
}

/** Boxes an input to its automatic width, never past its container, unless its page sized it. */
export function AutoWidthBox({ fieldDef, children }: React.PropsWithChildren<{
	fieldDef: dyn.ModelSchemaField | undefined,
}>): React.ReactNode {
	const explicit = React.useContext(ExplicitWidthContext);
	const width = explicit ? undefined : autoInputWidthOf(fieldDef);
	return width ? <Box w={width} maw='100%'>{children}</Box> : children;
}
