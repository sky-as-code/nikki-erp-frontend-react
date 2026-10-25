import { ActionIcon } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { propagateCurrentLangToEmpty } from './langJson';
import { MultiLangInputModal } from './MultiLangInputModal';
import { useI18n, useTranslate } from '../../i18n';
import { Input } from '../Input/Input';
import { formInputProps } from '../Input/inputDensity';

import type { FormInputSize } from '../Input/inputDensity';
import type { InputProps } from '@mantine/core';
import type { TestIdAttributes } from '@nikkierp/common/utils';


export type TranslatableInputProps = {
	value: dyn.ModelSchemaLangJson | null | undefined,
	onChange: (value: dyn.ModelSchemaLangJson) => void,
	onBlur?: () => void,
	/** The field's localized label: the translation modal's title, and the input's name when none labels it. */
	label: string,
	required?: boolean,
	/** Styles the input as invalid; the message itself is the enclosing field wrapper's to show. */
	error?: boolean,
	disabled?: boolean,
	size?: FormInputSize,
	id?: string,
	placeholder?: string,
	testAttrs?: TestIdAttributes,
	translateTestAttrs?: TestIdAttributes,
	inputProps?: Partial<InputProps>,
	/** Languages the modal offers and typing mirrors into; defaults to i18n's supported languages. */
	supportedLngs?: string[],
	'aria-labelledby'?: string,
	'aria-describedby'?: string,
	'aria-required'?: boolean,
	'aria-invalid'?: boolean,
};

export function useSupportedLngs(): string[] {
	const i18n = useI18n();
	const raw = i18n.options.supportedLngs;
	return React.useMemo(() => {
		if (!Array.isArray(raw)) {
			return ['en-US'];
		}
		return raw.filter((lng): lng is string => typeof lng === 'string' && lng !== 'cimode');
	}, [raw]);
}

/**
 * The text typed into the active language's input as the next LangJSON value: mirrored into every
 * language that is empty or still mirroring, or `{}` once the input is cleared.
 */
export function nextTypedLangJson(
	langJson: dyn.ModelSchemaLangJson, language: string, text: string, supportedLngs: readonly string[],
): dyn.ModelSchemaLangJson {
	if (!text) {
		return {};
	}
	const previous = langJson[language] ?? '';
	return propagateCurrentLangToEmpty({ ...langJson, [language]: text }, language, supportedLngs, previous);
}

function TranslateButton({ disabled, onClick, testAttrs }: {
	disabled?: boolean, onClick: () => void, testAttrs?: TestIdAttributes,
}): React.ReactNode {
	const i18n = useI18n();
	const t = useTranslate();
	return (
		<ActionIcon
			variant='subtle'
			size='sm'
			disabled={disabled}
			onClick={onClick}
			aria-label={t('translatable.translateField')}
			{...testAttrs}
		>
			{i18n.language.split('-')[0].toUpperCase()}
		</ActionIcon>
	);
}

/**
 * A LangJSON editor independent of any form library: one input for the active language, plus a
 * button opening the modal that edits every language. Aria props given by an enclosing field
 * wrapper (`BaseFieldWrapper` clones them in) reach the input.
 */
export function TranslatableInput({
	value, onChange, onBlur, label, required, error, size, testAttrs, translateTestAttrs, inputProps,
	supportedLngs: lngsProp, ...inputAttrs
}: TranslatableInputProps): React.ReactNode {
	const i18n = useI18n();
	const defaultLngs = useSupportedLngs();
	const supportedLngs = lngsProp ?? defaultLngs;
	const [modalOpened, setModalOpened] = React.useState(false);
	const langJson = value ?? {};
	const handleSave = (saved: dyn.ModelSchemaLangJson) => {
		// The modal's save is the user leaving the field, so the value is validated at once.
		onChange(saved);
		onBlur?.();
	};
	return (
		<>
			<Input
				aria-label={inputAttrs['aria-labelledby'] ? undefined : label}
				aria-required={required || undefined}
				aria-invalid={error || undefined}
				{...inputAttrs}
				value={langJson[i18n.language] ?? ''}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(
					nextTypedLangJson(langJson, i18n.language, event.target.value, supportedLngs),
				)}
				onBlur={onBlur}
				error={error}
				rightSectionPointerEvents='all'
				rightSection={(
					<TranslateButton
						disabled={inputAttrs.disabled}
						onClick={() => setModalOpened(true)}
						testAttrs={translateTestAttrs}
					/>
				)}
				withAria={false}
				{...testAttrs}
				{...formInputProps(inputProps, size)}
			/>
			<MultiLangInputModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSave={handleSave}
				title={label}
				value={langJson}
				supportedLngs={supportedLngs}
			/>
		</>
	);
}
