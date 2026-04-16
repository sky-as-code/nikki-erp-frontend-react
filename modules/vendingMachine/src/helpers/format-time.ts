import dayjs from 'dayjs';


export function formatRelativeTime(
	dateString: string,
	translate: (key: string, options?: { count?: number }) => string,
): string {
	const date = dayjs(dateString);
	const now = dayjs();

	const diffMins = now.diff(date, 'minute');
	const diffHours = now.diff(date, 'hour');
	const diffDays = now.diff(date, 'day');

	if (diffMins < 1) {
		return translate('nikki.general.time.just_now');
	}

	if (diffMins < 60) {
		return translate('nikki.general.time.minutes_ago', { count: diffMins });
	}

	if (diffHours < 24) {
		return translate('nikki.general.time.hours_ago', { count: diffHours });
	}

	return translate('nikki.general.time.days_ago', { count: diffDays });
}