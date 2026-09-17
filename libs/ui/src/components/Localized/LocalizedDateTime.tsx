import React from 'react';

import { useFormatLocale } from './formatDefaults';
import { formatLocalizedDateTime } from './localizedFormat';

import type { DateTimeKind, RawValue } from './localizedFormat';


export type LocalizedDateTimeProps = {
	/** `YYYY-MM-DD`, `HH:mm[:ss]` or an ISO 8601 timestamp, as the API sends it. */
	value: RawValue,
	/** BCP 47 tag; defaults to the user's language record, then the active UI language. */
	locale?: string,
	/** Which parts to show; inferred from the raw shape when omitted. */
	kind?: DateTimeKind,
	className?: string,
};

/** Renders a date, time or timestamp in the locale's order and separators. */
export function LocalizedDateTime({ value, locale, kind, className }: LocalizedDateTimeProps) {
	const text = formatLocalizedDateTime(value, useFormatLocale(locale), kind);
	return <span className={className}>{text}</span>;
}
