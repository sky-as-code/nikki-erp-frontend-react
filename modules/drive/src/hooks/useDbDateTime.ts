import { useMemo } from 'react';

/** Chuỗi thời gian từ DB (ISO 8601), ví dụ: "2026-03-08T17:59:19.289899Z" */
export type DbDateTimeString = string;

export interface UseDbDateTimeReturn {
	/** Parse chuỗi DB sang Date. Trả về null nếu invalid. */
	parse: (isoString: DbDateTimeString) => Date | null;
	/** Format theo ngày (locale), ví dụ: "08/03/2026" */
	formatDate: (date: Date | DbDateTimeString) => string;
	/** Format ngày + giờ (locale), ví dụ: "08/03/2026, 17:59" */
	formatDateTime: (date: Date | DbDateTimeString) => string;
	/** Format tương đối, ví dụ: "2 giờ trước", "3 ngày trước" */
	formatRelative: (date: Date | DbDateTimeString) => string;
	/** Kiểm tra chuỗi có parse được thành Date hợp lệ không */
	isValid: (isoString: DbDateTimeString) => boolean;
}

const RELATIVE_THRESHOLD_DAYS = 7;

function toDate(value: Date | DbDateTimeString): Date | null {
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function useDbDateTime(locale?: string): UseDbDateTimeReturn {
	const localeOrDefault = locale ?? typeof navigator !== 'undefined' ? navigator.language : 'vi-VN';

	return useMemo(() => {
		const dateFormatter = new Intl.DateTimeFormat(localeOrDefault, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
		const dateTimeFormatter = new Intl.DateTimeFormat(localeOrDefault, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
		const relativeFormatter = new Intl.RelativeTimeFormat(localeOrDefault, {
			numeric: 'auto',
			style: 'long',
		});

		function parse(isoString: DbDateTimeString): Date | null {
			if (typeof isoString !== 'string' || !isoString.trim()) return null;
			const d = new Date(isoString.trim());
			return Number.isNaN(d.getTime()) ? null : d;
		}

		function formatDate(date: Date | DbDateTimeString): string {
			const d = toDate(date);
			return d ? dateFormatter.format(d) : '';
		}

		function formatDateTime(date: Date | DbDateTimeString): string {
			const d = toDate(date);
			return d ? dateTimeFormatter.format(d) : '';
		}

		function formatRelative(date: Date | DbDateTimeString): string {
			const d = toDate(date);
			if (!d) return '';
			const now = new Date();
			const diffMs = d.getTime() - now.getTime();
			const diffSec = Math.round(diffMs / 1000);
			const diffMin = Math.round(diffSec / 60);
			const diffHour = Math.round(diffMin / 60);
			const diffDay = Math.round(diffHour / 24);

			if (Math.abs(diffSec) < 60) return relativeFormatter.format(diffSec, 'second');
			if (Math.abs(diffMin) < 60) return relativeFormatter.format(diffMin, 'minute');
			if (Math.abs(diffHour) < 24) return relativeFormatter.format(diffHour, 'hour');
			if (Math.abs(diffDay) < RELATIVE_THRESHOLD_DAYS) return relativeFormatter.format(diffDay, 'day');
			return formatDate(d);
		}

		function isValid(isoString: DbDateTimeString): boolean {
			return parse(isoString) !== null;
		}

		return {
			parse,
			formatDate,
			formatDateTime,
			formatRelative,
			isValid,
		};
	}, [localeOrDefault]);
}
