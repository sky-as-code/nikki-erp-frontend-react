import { useCallback, useState } from 'react';


function getStored<T>(key: string, parse: (s: string) => T, fallback: T): T {
	try {
		if (typeof localStorage === 'undefined') return fallback;
		const raw = localStorage.getItem(key);
		if (raw === null) return fallback;
		return parse(raw);
	}
	catch {
		return fallback;
	}
}

function setStored(key: string, value: string): void {
	try {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(key, value);
		}
	}
	catch {
		// ignore
	}
}

/**
 * State đồng bộ với localStorage. An toàn SSR (không gọi localStorage khi chưa có window).
 * @param key - key localStorage
 * @param initialValue - giá trị khi chưa có trong storage hoặc parse lỗi
 * @param parse - parse string từ storage sang T (default: identity cho string)
 * @param serialize - serialize T sang string để lưu (default: String)
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	options?: {
		parse?: (raw: string) => T;
		serialize?: (value: T) => string;
	},
): [T, (value: T | ((prev: T) => T)) => void] {
	const parse = options?.parse ?? ((s: string) => s as T);
	const serialize = options?.serialize ?? String;

	const [state, setState] = useState<T>(() =>
		getStored(key, parse, initialValue),
	);

	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			setState((prev) => {
				const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
				setStored(key, serialize(next));
				return next;
			});
		},
		[key, serialize],
	);

	return [state, setValue];
}
