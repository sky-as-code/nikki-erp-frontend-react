import { strftimeToDayjs, dayjsLocaleOf } from '../Localized/strftime';
import { useValueFormatDefaults } from '../valueRenderers/useValueFormatDefaults';

import type { WeekDayIndex } from '../Localized/strftime';


export type DatePickerFormat = {
	/** dayjs locale for month and weekday names (`vi`). */
	locale: string,
	/** The language record's patterns in dayjs syntax; absent leaves Mantine's default. */
	valueFormat?: string,
	firstDayOfWeek?: WeekDayIndex,
};

/**
 * What a Mantine date picker takes from the user's language record: its date (and, `withTime`, short
 * time) pattern as `valueFormat`, which also parses typed text, and its first day of the week. A
 * pattern the browser cannot render leaves `valueFormat` out, so the picker keeps Mantine's default.
 */
export function useDatePickerFormat(withTime: boolean): DatePickerFormat {
	const defaults = useValueFormatDefaults();
	const date = strftimeToDayjs(defaults.dateFormat);
	const time = withTime ? strftimeToDayjs(defaults.shortTimeFormat) : '';
	const format: DatePickerFormat = { locale: dayjsLocaleOf(defaults.locale) };
	if (date !== null && time !== null) {
		format.valueFormat = time ? `${date} ${time}` : date;
	}
	if (defaults.firstDayOfWeek !== undefined) {
		format.firstDayOfWeek = defaults.firstDayOfWeek;
	}
	return format;
}
