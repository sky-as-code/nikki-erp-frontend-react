import { ActionIcon, Input, InputProps } from '@mantine/core';
import { useId } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { Controller } from 'react-hook-form';

import { BaseFieldWrapper } from './fields';
import { useFieldData, useFormField } from './formContext';
import { LocalizeFn, useI18n } from '../../i18n';
import { MultiLangInputModal, propagateCurrentLangToEmpty } from '../MultiLangInputModal';


export type LangJsonFieldProps = {
	name: string;
	inputProps?: Partial<InputProps>;
	localize: LocalizeFn;
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

	if (!fieldData) {
		return null;
	}

	const defaultValue = (modelValue?.[name] ?? {}) as dyn.ModelSchemaLangJson;
	const isDisabled = modelLoading || Boolean(inputProps?.disabled);
	const currentLangShort = i18n.language.split('-')[0].toUpperCase();

	const langButton = (
		<ActionIcon
			variant='subtle'
			size='sm'
			disabled={isDisabled}
			onClick={() => setModalOpened(true)}
			aria-label='Translate field'
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
					field.onChange(propagateCurrentLangToEmpty(next, i18n.language, supportedLngs));
				};
				return (
					<>
						<BaseFieldWrapper
							inputId={inputId}
							label={t(fieldData.label)}
							description={t(fieldData.description)}
							isRequired={fieldData.isRequired}
							error={t(fieldData.error as any)}
						>
							<Input
								id={inputId}
								value={preview}
								onChange={handleInputChange}
								disabled={isDisabled}
								placeholder={t(fieldData.placeholder)}
								rightSectionPointerEvents='all'
								rightSection={langButton}
								withAria={false}
								size='md'
								{...inputProps}
							/>
						</BaseFieldWrapper>
						<MultiLangInputModal
							opened={modalOpened}
							onClose={() => setModalOpened(false)}
							onSave={val => field.onChange(val)}
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
