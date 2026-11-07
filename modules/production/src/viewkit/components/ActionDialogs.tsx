import { Alert, Checkbox, Group, Stack, Textarea } from '@mantine/core';
import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Input, LocalizedNumberInput, Modal, Select } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useActionLock, useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { actionDialogsPropsSchema } from './actionTypes';
import { PRODUCTION_MODULE } from '../../constants';
import { actionCommand } from '../../features/commands';
import { ACTION_DIALOGS } from '../ids';

import type { ActionDialogsProps, ActionField, ActionSpec } from './actionTypes';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const TEST_ID = `${PRODUCTION_MODULE}.actions`;
const PAGE_SIZE = 200;

type RecordState = { values: Record<string, unknown>, refresh: () => void };

export const actionDialogsRenderer: IComponentRenderer<ActionDialogsProps> = {
	type: ACTION_DIALOGS,
	propsSchema: actionDialogsPropsSchema,
	render(props) {
		return (
			<ComponentAnchor id={ACTION_DIALOGS}>
				<ActionDialogs {...props} />
			</ComponentAnchor>
		);
	},
};

/**
 * The record's business actions. Each button follows the backend's state rule (shown only in the states the
 * action accepts) and its entitlement (locked, never hidden, when the caller lacks it). Hidden while the
 * form is being edited: an action acts on the saved record and refreshes the page.
 */
function ActionDialogs({ actions }: ActionDialogsProps): React.ReactNode {
	const update = useOptionalResourceUpdateContext();
	const updateMode = useResourceFormView()?.updateMode ?? false;
	const record = update?.resource as Record<string, unknown> | undefined;
	if (!record || !update?.refresh || updateMode) {
		return null;
	}
	const state: RecordState = { values: record, refresh: update.refresh };
	const visible = actions.filter(action => !action.condition
		|| action.condition.in.includes(String(record[action.condition.field] ?? '')));
	if (visible.length === 0) {
		return null;
	}
	return (
		<Group gap='xs' {...testAttrs(TEST_ID)}>
			{visible.map(action => <ActionButton key={action.key} action={action} record={state} />)}
		</Group>
	);
}

function ActionButton({ action, record }: { action: ActionSpec, record: RecordState }): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const lock = useActionLock(action.schemaName, action.actionCode);
	const [opened, setOpened] = React.useState(false);
	return (
		<>
			<Button
				variant='outline'
				size='compact-sm'
				locked={lock.locked}
				lockedMissing={lock.missing}
				onClick={() => setOpened(true)}
				{...testAttrs(TEST_ID, action.key)}
			>
				{t(action.label)}
			</Button>
			{opened ? <ActionModal action={action} record={record} onClose={() => setOpened(false)} /> : null}
		</>
	);
}

function payloadOf(action: ActionSpec, record: RecordState, values: Record<string, unknown>): Record<string, unknown> {
	const payload: Record<string, unknown> = { ...values, action: action.key, collection: action.collection };
	if (action.collection) {
		payload[action.recordAs ?? 'id'] = record.values.id;
		payload.org_id = record.values.org_id;
	}
	else {
		payload.id = record.values.id;
		payload.etag = record.values.etag;
	}
	if (values.lots !== undefined) {
		payload.lots = String(values.lots).split('\n').map(line => line.trim()).filter(Boolean)
			.map(name => ({ lot_name: name, quantity: '1' }));
	}
	return payload;
}

function ActionModal({ action, record, onClose }: { action: ActionSpec, record: RecordState, onClose: () => void }) {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const translateError = useClientErrorTranslate([PRODUCTION_MODULE, 'common']);
	const run = useCommand(actionCommand(action.schemaName));
	const [values, setValues] = React.useState<Record<string, unknown>>({});
	const missing = action.fields.some(field => field.required && (values[field.name] === undefined || values[field.name] === ''));
	const submit = async () => {
		const response = await run.publish(payloadOf(action, record, values));
		if (response.error == null && (response.result?.clientErrors ?? []).length === 0) {
			record.refresh();
			onClose();
		}
	};
	return (
		<Modal opened onClose={onClose} title={t(action.label)} centered size='md'>
			<Stack gap='sm' {...testAttrs(TEST_ID, action.key, 'modal')}>
				{action.fields.map(field => (
					<ActionInput
						key={field.name}
						field={field}
						record={record.values}
						value={values[field.name]}
						onChange={value => setValues(previous => ({ ...previous, [field.name]: value }))}
					/>
				))}
				{run.clientErrors.length > 0 ? (
					<Alert color='red' variant='light' {...testAttrs(TEST_ID, action.key, 'errors')}>
						{run.clientErrors.map((item, index) => <div key={index}>{translateError(item)}</div>)}
					</Alert>
				) : null}
				<Group justify='flex-end'>
					<Button color='gray' onClick={onClose}>{t('common:action.close', { defaultValue: 'Close' })}</Button>
					<Button
						variant='filled'
						disabled={missing}
						loading={run.isPending}
						onClick={() => void submit()}
						{...testAttrs(TEST_ID, action.key, 'submit')}
					>
						{t('common:action.confirm', { defaultValue: 'Confirm' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

type InputProps = {
	field: ActionField,
	record: Record<string, unknown>,
	value: unknown,
	onChange: (value: unknown) => void,
};

function ActionInput({ field, record, value, onChange }: InputProps): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const label = t(`fields.${field.name}`);
	const testId = testAttrs(TEST_ID, 'field', field.name);
	switch (field.kind) {
		case 'select':
			return (
				<Select
					label={label}
					required={field.required}
					data={(field.options ?? []).map(option => ({ value: option, label: t(`${field.name}.${option}`) }))}
					value={(value as string | undefined) ?? null}
					onChange={next => onChange(next ?? '')}
					{...testId}
				/>
			);
		case 'number':
			return (
				<LocalizedNumberInput
					label={label}
					required={field.required}
					value={(value as number | string | undefined) ?? ''}
					onChange={next => onChange(String(next))}
					{...testId}
				/>
			);
		case 'boolean':
			return (
				<Checkbox
					label={label}
					checked={Boolean(value)}
					onChange={event => onChange(event.currentTarget.checked)}
					{...testId}
				/>
			);
		case 'lines':
			return (
				<Textarea
					label={t('fields.lot_name')}
					description={t('produce_lines_hint', { defaultValue: 'One lot or serial number per line' })}
					autosize
					minRows={3}
					value={(value as string | undefined) ?? ''}
					onChange={event => onChange(event.currentTarget.value)}
					{...testId}
				/>
			);
		case 'relation':
			return <RelationInput field={field} record={record} label={label} value={value} onChange={onChange} />;
		default:
			return (
				<Input.Wrapper label={label} required={field.required}>
					<Input
						value={(value as string | undefined) ?? ''}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value)}
						{...testId}
					/>
				</Input.Wrapper>
			);
	}
}

function RelationInput({ field, record, label, value, onChange }: InputProps & { label: string }): React.ReactNode {
	const options = useRelationOptions(field, record);
	return (
		<Select
			label={label}
			required={field.required}
			searchable
			clearable
			data={options}
			value={(value as string | undefined) ?? null}
			onChange={next => onChange(next ?? '')}
			{...testAttrs(TEST_ID, 'field', field.name)}
		/>
	);
}

/** The options of a relation field: the target's rows, narrowed by the field's filter. */
type Option = { value: string, label: string };

function useRelationOptions(field: ActionField, record: Record<string, unknown>): Option[] {
	const bus = useCommandBus();
	const [options, setOptions] = React.useState<Array<{ value: string, label: string }>>([]);
	const filter = field.filterField ? filterValueOf(field.filterValue ?? '', record) : '';
	React.useEffect(() => {
		if (!field.schema) {
			return;
		}
		let active = true;
		const graph = field.filterField && filter !== '' ? { if: [field.filterField, '=', filter] } : undefined;
		void bus.publish<dyn.RestSearchResponse<Record<string, unknown>>>({
			name: resourceCommands(field.schema).SEARCH,
			payload: { page: 0, size: PAGE_SIZE, fields: ['id', field.labelField ?? 'id'], graph },
		}).then((response) => {
			const items = response.result?.data?.items ?? [];
			if (active) {
				setOptions(items.map(item => ({ value: String(item.id), label: labelOf(item[field.labelField ?? 'id'], item.id) })));
			}
		});
		return () => {
			active = false;
		};
	}, [bus, field.schema, field.labelField, field.filterField, filter]);
	return options;
}

function filterValueOf(spec: string, record: Record<string, unknown>): string {
	if (spec.startsWith('@')) {
		return String(record[spec.slice(1)] ?? '');
	}
	return spec.startsWith('=') ? spec.slice(1) : spec;
}

function labelOf(value: unknown, fallback: unknown): string {
	if (value && typeof value === 'object') {
		const texts = Object.values(value as Record<string, unknown>).filter(text => typeof text === 'string');
		return String(texts[0] ?? fallback);
	}
	return String(value ?? fallback);
}
