import { ActionIcon, Group, Stack, Text, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { toDisplayedEntitlements } from '@nikkierp/common/entitlements';
import { useShowLockedFeature } from '@nikkierp/ui/components';
import { maskedFieldMissing } from '@nikkierp/ui/components/ExcelDataTable';
import { AutoField, ReadOnlyBooleanSwitch, useComputedField } from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { IconLock } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { useDetailFieldDisplay } from './detailFieldDisplay';
import { fieldLockView, type FieldLockView } from './fieldLocks';
import { fieldPresentation, isBlockVisible } from './fieldVisibility';
import classes from './ResourceDetail.module.css';
import { ResourceUpdateContext } from './resourceUpdateContext';
import { EdgeFieldValue } from '../../components/edgeFieldValue';
import { renderDisplayFieldValue } from '../../components/fieldValue';
import { formBlockSpanClass } from '../../components/formBlockSpan';
import { StandardActionCode, useFieldLocks } from '../../permissions';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTranslationNs,
} from '../resourceDetail/ResourceDetailProvider';

import type { FieldVisibilityMode } from './fieldVisibility';
import type { OwnPropertySection } from '../resourceDetail/props';


export function OwnPropertiesBlock({
	block, isLoading, fieldValues, updateMode,
}: {
	block: OwnPropertySection,
	isLoading: boolean,
	fieldValues: Record<string, unknown>,
	updateMode: boolean,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const { stableFieldLayout } = useDetailFieldDisplay();
	const modelSchema = schemaPack?.modelSchema;
	const t = useTranslate(useResourceDetailTranslationNs());
	const mode = updateMode ? 'update' : 'read';

	// A header over nothing reads as a broken section, so a block whose fields all filter out is
	// dropped along with its title.
	if (!modelSchema || !isBlockVisible(modelSchema, block.fields ?? [], mode, stableFieldLayout)) {
		return null;
	}

	return (
		<Stack gap='sm' className={clsx(classes.formBlock, formBlockSpanClass(block))}>
			{block.header && block.showTitle ? <Title order={5} className='uppercase'>{t(block.header)}</Title> : null}
			<FieldGroupVertical
				fields={block.fields ?? []}
				isLoading={isLoading}
				modelSchema={modelSchema}
				fieldValues={fieldValues}
				mode={mode}
				lockedFields={block.lockedFields}
				readOnlyFields={block.readOnlyFields}
			/>
		</Stack>
	);
}

type LockedFields = OwnPropertySection['lockedFields'];

/** The hint of `field` while the record locks it in update mode, else `undefined`. */
export function lockedFieldHint(
	lockedFields: LockedFields, field: string, mode: FieldVisibilityMode, fieldValues: Record<string, unknown>,
): string | undefined {
	const lock = lockedFields?.[field];
	return lock && mode === 'update' && fieldValues[lock.unless] === false ? lock.hint : undefined;
}

/**
 * The fields of one block in any mode. A field the server owns — a key, an auto-generated
 * timestamp, a computed value — has no input to offer, but it is still part of the record the user
 * is looking at, so update mode keeps it on screen as read-only text rather than letting the layout
 * reshuffle the moment Update is pressed. With `stableFieldLayout` create mode does the same.
 */
export function FieldGroupVertical({
	fields, isLoading, modelSchema, fieldValues, mode, lockedFields, readOnlyFields,
}: {
	fields: string[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	mode: FieldVisibilityMode,
	lockedFields?: LockedFields,
	readOnlyFields?: string[],
}): React.ReactNode {
	const { stableFieldLayout } = useDetailFieldDisplay();
	const lockOf = useFieldLockViews(fields, mode, modelSchema);
	return (
		<div className={classes.formFieldWrapper}>
			{fields.map(field => {
				const presentation = readOnlyFields?.includes(field) && mode === 'update'
					? 'readonly'
					: fieldPresentation(modelSchema, field, mode, stableFieldLayout);
				if (presentation === 'hidden') {
					return null;
				}
				const fieldLock = lockOf(field, presentation === 'input');
				if (fieldLock) {
					return <LockedFieldValue key={field} field={field} modelSchema={modelSchema} lock={fieldLock} />;
				}
				if (presentation === 'readonly') {
					return (
						<ReadOnlyFieldValue
							key={field}
							field={field}
							modelSchema={modelSchema}
							fieldValues={fieldValues}
						/>
					);
				}
				const lockHint = lockedFieldHint(lockedFields, field, mode, fieldValues);
				return (
					<Stack key={field} gap={4}>
						<AutoField name={field} inputProps={{ disabled: isLoading || lockHint !== undefined }} />
						{lockHint ? <LockedFieldHint hint={lockHint} /> : null}
					</Stack>
				);
			})}
		</div>
	);
}

/**
 * The field-level permission locks of one block: a function answering, per field, how it renders
 * locked, or null. Create mode locks nothing (see `fieldLockView`).
 */
function useFieldLockViews(
	fields: string[], mode: FieldVisibilityMode, modelSchema: dyn.ModelSchema,
): (field: string, editable: boolean) => FieldLockView | null {
	const schemaName = useResourceDetailSchemaName();
	const maskedFields = React.useContext(ResourceUpdateContext)?.maskedFields;
	const lockSchema = mode === 'create' ? null : schemaName;
	const readLocks = useFieldLocks(lockSchema, fields, StandardActionCode.Read);
	const updateLocks = useFieldLocks(mode === 'update' ? lockSchema : null, fields, StandardActionCode.Update);
	return React.useCallback((field: string, editable: boolean) => {
		if (!schemaName) {
			return null;
		}
		const maskedMissing = maskedFieldMissing(modelSchema, field, maskedFields) ?? undefined;
		return fieldLockView({
			schemaName, field, mode, editable,
			readLock: readLocks[field],
			updateLock: updateLocks[field],
			masked: maskedMissing !== undefined,
			maskedMissing,
		});
	}, [schemaName, mode, readLocks, updateLocks, maskedFields, modelSchema]);
}

/**
 * A field the caller may not read (or, in update mode, may not update): its label over a lock
 * button explaining the refusal. Locked, never hidden, so the form keeps its layout and the user
 * learns the field exists and what grant opens it.
 */
function LockedFieldValue({
	field, modelSchema, lock,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	lock: FieldLockView,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	const t = useTranslate(useResourceDetailTranslationNs());
	const showLocked = useShowLockedFeature();
	const fieldDef = modelSchema.fields[field];
	const messageKey = lock.kind === 'read' ? 'permission.field_read_locked' : 'permission.field_update_locked';
	const onClick = (): void => {
		const expression = toDisplayedEntitlements(lock.missing).join(', ');
		showLocked(lock.missing, t(messageKey, { expression }));
	};
	return (
		<Stack gap={4}>
			<Text size='md' fw='600'>{fieldDef ? localize(fieldDef.label) : field}</Text>
			<Group>
				<ActionIcon
					variant='subtle'
					color='gray'
					aria-label={t(messageKey, { expression: toDisplayedEntitlements(lock.missing).join(', ') })}
					onClick={onClick}
					data-locked='true'
					data-testid={`resourceForm.fieldLock.${field}`}
				>
					<IconLock size={16} />
				</ActionIcon>
			</Group>
		</Stack>
	);
}

function LockedFieldHint({ hint }: { hint: string }): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	return (
		<Group gap={4} wrap='nowrap' data-testid='resourceForm.lockedFieldHint'>
			<IconLock size={14} aria-hidden />
			<Text size='xs' c='dimmed'>{t(hint)}</Text>
		</Group>
	);
}

/**
 * One field as label-over-value text.
 *
 * A field the record left unset still renders, as its label over a dash: the reader is asking
 * what this record holds, and "no short name" is an answer, while a row that silently disappears
 * is indistinguishable from a field that does not exist.
 */
function ReadOnlyFieldValue({
	field, modelSchema, fieldValues,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	// Called before the early return, since hooks cannot be skipped. It no-ops for every field
	// that is not function-computed with a declared dependency.
	const computed = useComputedField(field);
	// Optional: a create form with a stable layout renders read-only fields too, and has no record.
	const edgeLabels = React.useContext(ResourceUpdateContext)?.edgeLabels ?? noEdgeLabels;
	const { fieldRenderers } = useDetailFieldDisplay();
	const fieldDef = modelSchema.fields[field];
	// A foreign key resolves to the relation it owns the key for, the same dispatch edit mode
	// uses to choose `RelationSelectField`.
	const relation = dyn.findRelationBySrcField(modelSchema, field);
	// A live recompute wins over the loaded value, which went stale the moment the user edited the
	// field it derives from. Before the first answer arrives there is nothing fresher to show, so
	// the loaded value stands.
	const rawValue = computed.isLive && computed.value !== undefined
		? computed.value
		: fieldValues[field];
	if (!fieldDef) {
		return null;
	}
	// A boolean is a switch in both modes, so flipping into update mode does not change its look.
	if (fieldDef.data_type?.name === 'boolean') {
		return (
			<Stack gap={4}>
				<Text size='md' fw='600'>{localize(fieldDef.label)}</Text>
				<ReadOnlyBooleanSwitch value={rawValue} />
			</Stack>
		);
	}

	const plainValue = hasDisplayableValue(rawValue)
		? renderDisplayFieldValue(rawValue, fieldDef, localize, fieldRenderers?.[field], fieldValues)
		: emptyFieldPlaceholder;

	return (
		<Stack gap={4}>
			<Text size='md' fw='600'>{localize(fieldDef.label)}</Text>
			<Text size='md' component='div'>
				{relation ? (
					<EdgeFieldValue
						relation={relation}
						labelField={edgeLabels[relation.edge]}
						fieldValues={fieldValues}
						fallback={plainValue}
					/>
				) : plainValue}
			</Text>
		</Stack>
	);
}

const emptyFieldPlaceholder = '-';
const noEdgeLabels: Record<string, string> = {};

/** Whether a raw field value is worth putting on screen at all. */
function hasDisplayableValue(value: unknown): boolean {
	if (value === null || value === undefined || value === '') {
		return false;
	}
	return !(Array.isArray(value) && value.length === 0);
}
