import { useId } from '@mantine/hooks';
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldTestAttrs } from './formTestIds';
import { groupingExample, strftimeExample } from '../formatPattern/formatPatternExamples';
import { FormatPatternExample, StrftimeHelpButton } from '../formatPattern/FormatPatternParts';
import { useFormInputSize } from '../Input/inlineControls';
import { Input } from '../Input/Input';
import { formInputProps } from '../Input/inputDensity';
import { useFormatLocale } from '../Localized/useFormatLocale';

import type { InputProps } from '../Input/Input';


export type FormatPatternFieldProps = {
	name: string,
	disabled?: boolean,
};

type PatternInputFieldProps = FormatPatternFieldProps & {
	/** What the typed pattern prints, or `null` when it cannot be rendered. */
	exampleOf: (pattern: string) => string | null,
	help?: React.ReactNode,
};

/** A text input for a format pattern with the live example of the typed value below it. */
function PatternInputField({ name, disabled, exampleOf, help }: PatternInputFieldProps) {
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading, localize: t } = useFormField();
	const fieldAttrs = useFieldTestAttrs(name);
	const size = useFormInputSize();
	if (!fieldData) {
		return null;
	}
	return (
		<BaseFieldWrapper
			inputId={inputId} label={t(fieldData.label)} isRequired={fieldData.isRequired}
			error={fieldErrorText(t, fieldData)}
		>
			<Controller
				name={name} control={control} defaultValue={modelValue?.[name]}
				render={({ field }) => (
					<div>
						<Input
							id={inputId} value={String(field.value ?? '')} name={field.name} ref={field.ref}
							onChange={event => field.onChange(event.currentTarget.value)} onBlur={field.onBlur}
							error={fieldData.error} disabled={modelLoading || disabled}
							rightSection={help} rightSectionPointerEvents='all'
							{...fieldAttrs} {...formInputProps<InputProps>(undefined, size)}
						/>
						<FormatPatternExample example={exampleOf(String(field.value ?? ''))} />
					</div>
				)}
			/>
		</BaseFieldWrapper>
	);
}

/**
 * The locale a language form's examples print in: the record's own `locale_code` while it holds one,
 * so a Vietnamese record shows Vietnamese month names, else the user's.
 */
function useRecordLocale(): string {
	const { control } = useFormField();
	const recordLocale = useWatch({ control, name: 'locale_code' }) as unknown;
	const userLocale = useFormatLocale();
	return typeof recordLocale === 'string' && recordLocale ? recordLocale : userLocale;
}

/** A strftime date or time pattern (`%d/%m/%Y`): its input, today's example and the directive help. */
export function StrftimeFormatField(props: FormatPatternFieldProps) {
	const locale = useRecordLocale();
	const now = React.useMemo(() => new Date(), []);
	return (
		<PatternInputField
			{...props}
			exampleOf={pattern => strftimeExample(pattern, locale, now)}
			help={<StrftimeHelpButton locale={locale} />}
		/>
	);
}

/** A digit grouping (`[3,2,-1]`): its input and the sample number grouped with the record's separator. */
export function NumberGroupingField(props: FormatPatternFieldProps) {
	const { control } = useFormField();
	const separator = useWatch({ control, name: 'thousands_separator' }) as unknown;
	const glyph = typeof separator === 'string' ? separator : ',';
	return <PatternInputField {...props} exampleOf={grouping => groupingExample(grouping, glyph)} />;
}
