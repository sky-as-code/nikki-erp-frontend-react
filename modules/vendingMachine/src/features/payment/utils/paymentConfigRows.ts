import type { CustomFieldValueType, PaymentMethod, PaymentMethodConfig, PaymentMethodConfigValue } from '@/features/payment/types';



export type PaymentConfigRow = {
	key: string;
	value: string;
	valueType: CustomFieldValueType;
};

export function paymentConfigToRows(config?: PaymentMethod['config']): PaymentConfigRow[] {
	if (!config || typeof config !== 'object') {
		return [];
	}
	return Object.entries(config).map(([entryKey, raw]) => {
		if (raw && typeof raw === 'object' && 'value' in raw && 'valueType' in raw) {
			const v = raw as PaymentMethodConfigValue;
			return {
				key: v.key || entryKey,
				value: String(v.value ?? ''),
				valueType: v.valueType,
			};
		}
		return {
			key: entryKey,
			value: String(raw ?? ''),
			valueType: 'string' as const,
		};
	});
}

export function paymentRowsToConfig(rows: PaymentConfigRow[]): PaymentMethod['config'] | undefined {
	const trimmed = rows.filter((r) => r.key.trim());
	if (trimmed.length === 0) {
		return undefined;
	}
	const out: PaymentMethodConfig = {};
	for (const r of trimmed) {
		const key = r.key.trim();
		out[key] = { key, value: r.value, valueType: r.valueType };
	}
	return out;
}
