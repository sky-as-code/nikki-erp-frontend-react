import { Button, Group, Modal, Stack, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { AutoField } from '@nikkierp/ui/components/form';
import { AdhocFormProvider, FormStyleProvider, FormTestIdProvider } from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import {
	useResourceDetailContext, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from './ResourceDetailProvider';

import type { ActionPrompt, ActionPromptField } from './props';


export type ActionPromptModalProps = {
	opened: boolean,
	onClose: () => void,
	prompt: ActionPrompt,
	/** Names the dialog's test ids, matching the button that opened it. */
	actionKey: string,
	/** The record the action will run against; prompt defaults are read from it. */
	resource: Record<string, unknown>,
	isSubmitting: boolean,
	onSubmit: (values: Record<string, unknown>) => void,
};

/**
 * The dialog a contextual action opens to collect values before it fires.
 *
 * It reuses the page's own schema rather than describing its fields itself, so an input gets the
 * label, data type, validation and renderer the resource already declares. That is why the prompt
 * spec lists field *names*: anything richer would be a second description of the same fields,
 * free to drift from the first.
 *
 * The caller renders this only while `opened`, so the form is created fresh on each open and
 * destroyed on close. That is deliberate — see the note on `AdhocFormProvider` below.
 */
export function ActionPromptModal(props: ActionPromptModalProps): React.ReactNode {
	const { schemaPack, testId } = useResourceDetailContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const localize = useLocalize(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const baseSchema = schemaPack?.modelSchema;

	const promptSchema = React.useMemo(
		() => (baseSchema ? buildPromptSchema(baseSchema, props.prompt.fields) : null),
		[baseSchema, props.prompt.fields],
	);
	const defaults = React.useMemo(
		() => buildPromptDefaults(props.prompt.fields, props.resource),
		[props.prompt.fields, props.resource],
	);

	if (!promptSchema) {
		return null;
	}

	return (
		<Modal
			opened={props.opened}
			onClose={props.onClose}
			title={<Title order={4}>{t(props.prompt.title)}</Title>}
			size='md'
			centered
			closeOnClickOutside={!props.isSubmitting}
			closeOnEscape={!props.isSubmitting}
			{...tid('actionPrompt', props.actionKey)}
		>
			<FormStyleProvider layout='onecol'>
				<FormTestIdProvider testId={testId}>
					<AdhocFormProvider
						formVariant='create'
						modelSchema={promptSchema}
						modelValue={defaults}
						localize={localize}
					>
						{({ handleSubmit }) => (
							<form
								onSubmit={handleSubmit(values => props.onSubmit(values as Record<string, unknown>))}
								noValidate
							>
								<PromptBody {...props} />
							</form>
						)}
					</AdhocFormProvider>
				</FormTestIdProvider>
			</FormStyleProvider>
		</Modal>
	);
}

/**
 * The fields and the footer, split out to keep the component above inside the line budget.
 */
function PromptBody(props: ActionPromptModalProps): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();

	return (
		<Stack gap='sm'>
			{props.prompt.fields.map(field => (
				<AutoField key={field.name} name={field.name} inputProps={{ disabled: props.isSubmitting }} />
			))}
			<Group justify='flex-end' mt='sm'>
				<Button
					variant='outline'
					size='compact-md'
					onClick={props.onClose}
					disabled={props.isSubmitting}
					{...tid('actionPrompt', props.actionKey, 'cancel')}
				>
					{t('action.cancel')}
				</Button>
				<Button
					type='submit'
					variant='filled'
					size='compact-md'
					disabled={props.isSubmitting}
					loading={props.isSubmitting}
					{...tid('actionPrompt', props.actionKey, 'submit')}
				>
					{t(props.prompt.submitLabel ?? props.prompt.title)}
				</Button>
			</Group>
		</Stack>
	);
}

/**
 * Narrows the resource's schema to the prompt's own fields.
 *
 * This is what makes the dialog usable at all. `AdhocFormProvider` builds its zod resolver over
 * every field of the schema it is handed, so passing the whole resource schema would demand every
 * required field the record has — and the dialog, which asks for two or three, could never submit.
 *
 * Unknown names are dropped rather than passed through: a typo should cost one missing input, not
 * a resolver referring to a field that does not exist.
 */
export function buildPromptSchema(base: dyn.ModelSchema, fields: ActionPromptField[]): dyn.ModelSchema {
	const picked: dyn.ModelSchemaFieldsMap = {};

	fields.forEach(field => {
		const definition = base.fields[field.name];
		if (!definition) {
			return;
		}
		picked[field.name] = field.required === undefined
			? definition
			: { ...definition, is_required_for_create: field.required };
	});

	return { ...base, fields: picked };
}

/**
 * Reads each field's prefill off the current record.
 *
 * Absent values are omitted rather than set to null, so a field with no default renders blank
 * instead of pre-filled with an empty value the user then has to clear.
 */
export function buildPromptDefaults(
	fields: ActionPromptField[], resource: Record<string, unknown>,
): Record<string, unknown> {
	const defaults: Record<string, unknown> = {};

	fields.forEach(field => {
		if (!field.defaultFromField) {
			return;
		}
		const value = resource[field.defaultFromField];
		if (value !== undefined && value !== null) {
			defaults[field.name] = value;
		}
	});

	return defaults;
}
