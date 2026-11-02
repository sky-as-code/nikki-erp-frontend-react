import React from 'react';

import { currencySegmentProps, DecimalInputField } from './fields';
import { useFormField } from './formContext';
import { currencyMarkerOf, currencySymbolPosition } from '../Localized';
import { LocalizedNumberInput } from '../LocalizedNumberInput';
import { useValueFormatDefaults } from '../valueRenderers/useValueFormatDefaults';

import type { CurrencySegment } from './fields';
import type { LocalizedNumberInputProps } from '../LocalizedNumberInput';


export type MoneyInputFieldProps = {
	name: string,
	disabled?: boolean,
};

/**
 * A money amount's input: the decimal input with the system currency's marker as a left or right
 * segment, on the side the currency writes its symbol (the locale's when the currency names none).
 * Without a system currency it is a plain decimal input, as a money renderer shows a plain number.
 */
export function MoneyInputField({ name, disabled }: MoneyInputFieldProps): React.ReactNode {
	const { getFieldDef, localize } = useFormField();
	const ref = React.useRef<HTMLInputElement>(null);
	const segment = useSystemCurrencySegment();

	return (
		<DecimalInputField
			name={name}
			localize={localize}
			ref={ref}
			scale={getFieldDef(name)?.data_type.options?.scale as number | undefined}
			inputProps={disabled ? { disabled } : undefined}
			currencySegment={segment}
		/>
	);
}

/** {@link MoneyInputField} for a controlled input outside a schema form, such as a diagnostic tool's. */
export function MoneyInput(props: LocalizedNumberInputProps): React.ReactNode {
	const segment = useSystemCurrencySegment();
	return <LocalizedNumberInput {...currencySegmentProps(segment)} {...props} />;
}

function useSystemCurrencySegment(): CurrencySegment | undefined {
	const defaults = useValueFormatDefaults();
	return React.useMemo<CurrencySegment | undefined>(() => {
		const marker = currencyMarkerOf(defaults.currency);
		if (!marker) {
			return undefined;
		}
		const position = defaults.currency?.symbolPosition
			?? (defaults.locale && currencySymbolPosition(defaults.locale) === 'prefix' ? 'before' : 'after');
		return { marker, position };
	}, [defaults.currency, defaults.locale]);
}
