import { ActionIcon, Input, InputProps } from '@mantine/core';
import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller } from 'react-hook-form';

import { fieldErrorText } from './fieldErrors';
import { useFieldLabelHidden } from './fieldLabelContext';
import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { useFieldPartTestAttrs, useFieldTestAttrs } from './formTestIds';
import { LocalizeFn, useI18n } from '../../i18n';
import { MultiLangInputModal, propagateCurrentLangToEmpty } from '../MultiLangInputModal';


export type LangJsonFieldProps = {
	name: string,
	inputProps?: Partial<InputProps>,
	localize: LocalizeFn,
};

function useSupportedLngs(i18n: ReturnType<typeof useI18n>): string[] {
	return React.useMemo(() => {
		const raw = i18n.options.supportedLngs;
		if (!Array.isArray(raw)) {
			return ['en-US'];
		}
		return raw.filter((lng): lng is string => typeof lng === 'string' && lng !== 'cimode');
	}, [i18n.options.supportedLngs]);
}

export function LangJsonField({ name, inputProps, localize }: LangJsonFieldProps): React.ReactNode {
	const t = localize;
	const inputId = useId();
	const fieldData = useFieldData(name);
	const { control, modelValue, modelLoading } = useFormField();
	const i18n = useI18n();
	const supportedLngs = useSupportedLngs(i18n);
	const [modalOpened, setModalOpened] = React.useState(false);
	const fieldAttrs = useFieldTestAttrs(name);
	const translateAttrs = useFieldPartTestAttrs(name, 'translate');
	const labelHidden = useFieldLabelHidden();

	if (!fieldData) {
		return null;
	}

	const defaultValue = (modelValue?.[name] ?? {}) as dyn.ModelSchemaLangJson;
	const isDisabled = modelLoading || Boolean(inputProps?.disabled);
	const currentLangShort = i18n.language.split('-')[0].toUpperCase();
	// With no visible label the language the input edits goes into the hidden one, so a screen
	// reader announces it; an `aria-label` would lose to the wrapper's `aria-labelledby`.
	const label = labelHidden ? `${t(fieldData.label)} (${i18n.language})` : t(fieldData.label);

	const langButton = (
		<ActionIcon
			variant='subtle'
			size='sm'
			disabled={isDisabled}
			onClick={() => setModalOpened(true)}
			aria-label='Translate field'
			{...translateAttrs}
		>
			{currentLangShort}
		</ActionIcon>
	);

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field }) => {
				const langJson = (field.value ?? defaultValue) as dyn.ModelSchemaLangJson;
				const preview = langJson[i18n.language] ?? '';
				const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
					const next = { ...langJson, [i18n.language]: event.target.value };
					field.onChange(propagateCurrentLangToEmpty(next, i18n.language, supportedLngs, preview));
				};
				return (
					<>
						<BaseFieldWrapper
							inputId={inputId}
							label={label}
							// Uncomment to show sub-labels
							// description={t(fieldData.description)}
							isRequired={fieldData.isRequired}
							error={fieldErrorText(t, fieldData)}
						>
							<Input
								id={inputId}
								value={preview}
								onChange={handleInputChange}
								onBlur={field.onBlur}
								disabled={isDisabled}
								placeholder={t(fieldData.placeholder)}
								rightSectionPointerEvents='all'
								rightSection={langButton}
								withAria={false}
								size='md'
								{...fieldAttrs}
								{...inputProps}
							/>
						</BaseFieldWrapper>
						<MultiLangInputModal
							opened={modalOpened}
							onClose={() => setModalOpened(false)}
							onSave={val => saveTranslations(field, val)}
							title={`Translate: ${name}`}
							value={langJson}
							supportedLngs={supportedLngs}
							currentLanguage={i18n.language}
						/>
					</>
				);
			}}
		/>
	);
}

/** The modal's save is the user leaving the field, so the new value is validated at once. */
function saveTranslations(field: { onChange: (value: unknown) => void, onBlur: () => void }, value: unknown): void {
	field.onChange(value);
	field.onBlur();
}
