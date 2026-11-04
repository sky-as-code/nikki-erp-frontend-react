import { ActionIcon, Group, Stack, Text } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { toDisplayedEntitlements } from '@nikkierp/common/entitlements';
import { joinTestId } from '@nikkierp/common/utils';
import { FieldLabelText, localizeFieldDescription, useShowLockedFeature } from '@nikkierp/ui/components';
import { maskedFieldMissing } from '@nikkierp/ui/components/ExcelDataTable';
import {
	AutoField, fieldOccurrenceTestSegment, ReadOnlyBooleanSwitch, RelationSearchScopeContext, useComputedField,
	useFieldOccurrence, useWatchedFormValues,
} from '@nikkierp/ui/components/form';
import { type LocalizeFn, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { evaluateCondition } from '@nikkierp/viewengine/metadata';
import { IconLock } from '@tabler/icons-react';
import React from 'react';

import { useDetailFieldDisplay } from './detailFieldDisplay';
import { isDottedField } from './dottedFields';
import { fieldLockView, type FieldLockView } from './fieldLocks';
import {
	applyConditionalHiding, applyVisibleWhen, fieldPresentation, isBlockVisible, isNeverShownField,
	visibleWhenSourceFields,
} from './fieldVisibility';
import { FieldPair, FieldRuns, fieldValueClass, FormSection } from './formSection';
import { useRelationSearchScopes } from './relationSearchScope';
import { ResourceUpdateContext } from './resourceUpdateContext';
import { EdgeFieldValue } from '../../components/edgeFieldValue';
import { renderDisplayFieldValue } from '../../components/fieldValue';
import { readFieldValue, relationDestSchemaName, resolveSchemaField } from '../../data/fieldPaths';
import { useRelatedSchemas } from '../../data/useRelatedSchemas';
import { StandardActionCode, useFieldLocks } from '../../permissions';
import { columnFieldNames } from '../resourceDetail/formColumnFields';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTranslationNs,
} from '../resourceDetail/ResourceDetailProvider';

import type { FieldVisibilityMode } from './fieldVisibility';
import type { FormColumnField } from '../resourceDetail/formColumnFields';
import type { OwnPropertySection } from '../resourceDetail/props';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


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
	const fields = useVisibleBlockFields(block, mode, fieldValues);

	// A header over nothing reads as a broken section, so a block whose fields all filter out is
	// dropped along with its title.
	if (!modelSchema || !isBlockVisible(modelSchema, columnFieldNames(fields), mode, stableFieldLayout)) {
		return null;
	}

	return (
		<FormSection
			block={block} title={block.header && block.showTitle ? t(block.header) : undefined}
			description={block.description ? t(block.description) : undefined}
		>
			<FieldGroupVertical
				fields={fields}
				isLoading={isLoading}
				modelSchema={modelSchema}
				fieldValues={fieldValues}
				mode={mode}
				lockedFields={block.lockedFields}
				readOnlyFields={block.readOnlyFields}
				relationSearch={block.relationSearch}
			/>
		</FormSection>
	);
}

/**
 * The block's `fields` less those whose `visibleWhen` fails or that a source field's
 * `required_fields`/`optional_fields` hide: tested against the record in read mode, and against
 * the live form while editing, so a field shows the moment its condition holds.
 */
export function useVisibleBlockFields(
	block: OwnPropertySection, mode: FieldVisibilityMode, record: Record<string, unknown>,
): FormColumnField[] {
	const { fields, visibleWhen } = block;
	const modelSchema = useResourceDetailContext().schemaPack?.modelSchema;
	const sources = React.useMemo(
		() => [...new Set([...visibleWhenSourceFields(visibleWhen), ...dyn.conditionalSourceFields(modelSchema)])]
			.sort(),
		[visibleWhen, modelSchema],
	);
	const live = useWatchedFormValues(mode === 'read' ? noFields : sources);
	return React.useMemo(() => {
		const values = live ? { ...record, ...live } : record;
		const shown = visibleWhen ? applyVisibleWhen(fields ?? noFields, visibleWhen, values) : fields ?? noFields;
		return applyConditionalHiding(shown, dyn.conditionalFieldRules(modelSchema, values).hidden);
	}, [fields, visibleWhen, record, live, modelSchema]);
}

const noFields: string[] = [];

type LockedFields = OwnPropertySection['lockedFields'];

/** The hint of `field` while the record locks it in update mode, else `undefined`. */
export function lockedFieldHint(
	lockedFields: LockedFields, field: string, mode: FieldVisibilityMode, fieldValues: Record<string, unknown>,
): string | undefined {
	const lock = lockedFields?.[field];
	if (!lock || mode !== 'update') {
		return undefined;
	}
	const locked = lock.when
		? evaluateCondition(lock.when, fieldValues)
		: lock.unless !== undefined && fieldValues[lock.unless] === false;
	return locked ? lock.hint : undefined;
}

/**
 * The fields of one block in any mode. A field the server owns — a key, an auto-generated
 * timestamp, a computed value — has no input to offer, but it is still part of the record the user
 * is looking at, so update mode keeps it on screen as read-only text rather than letting the layout
 * reshuffle the moment Update is pressed. With `stableFieldLayout` create mode does the same.
 */
export function FieldGroupVertical({
	fields, isLoading, modelSchema, fieldValues, mode, lockedFields, readOnlyFields, relationSearch,
}: {
	fields: FormColumnField[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	mode: FieldVisibilityMode,
	lockedFields?: LockedFields,
	readOnlyFields?: string[],
	relationSearch?: OwnPropertySection['relationSearch'],
}): React.ReactNode {
	const { stableFieldLayout, fieldRenderers } = useDetailFieldDisplay();
	const searchScopes = useRelationSearchScopes(relationSearch, mode);
	const fieldNames = React.useMemo(() => columnFieldNames(fields).filter(name => !isDottedField(name)), [fields]);
	const lockOf = useFieldLockViews(fieldNames, mode, modelSchema);
	const semantic = mode === 'read';
	const localize = useLocalize(useResourceDetailTranslationNs());
	const labelOf = (field: string): string => {
		const label = modelSchema.fields[field]?.label;
		return label ? localize(label) : field;
	};
	const renderField = (field: string, labelHidden: boolean): React.ReactNode => {
		const asTerm = semantic && !labelHidden;
		const presentation = readOnlyFields?.includes(field) && mode === 'update' && !isNeverShownField(field)
			? 'readonly'
			: fieldPresentation(modelSchema, field, mode, stableFieldLayout);
		if (presentation === 'hidden') {
			return null;
		}
		const fieldLock = lockOf(field, presentation === 'input');
		if (fieldLock) {
			return (
				<LockedFieldValue
					field={field} modelSchema={modelSchema} lock={fieldLock} labelHidden={labelHidden} asTerm={asTerm}
				/>
			);
		}
		if (presentation === 'readonly' && isDottedField(field)) {
			return (
				<DottedFieldValue
					field={field} modelSchema={modelSchema} fieldValues={fieldValues}
					labelHidden={labelHidden} asTerm={asTerm}
				/>
			);
		}
		if (presentation === 'readonly') {
			return (
				<ReadOnlyFieldValue
					field={field} modelSchema={modelSchema} fieldValues={fieldValues}
					labelHidden={labelHidden} asTerm={asTerm}
				/>
			);
		}
		const lockHint = lockedFieldHint(lockedFields, field, mode, fieldValues);
		const disabled = isLoading || lockHint !== undefined;
		return (
			<Stack gap={4}>
				<AutoField
					name={field} labelHidden={labelHidden || undefined} inputProps={{ disabled }}
					renderControl={pageInputOf(fieldRenderers?.[field], disabled)}
				/>
				{lockHint ? <LockedFieldHint hint={lockHint} /> : null}
			</Stack>
		);
	};
	const body = <FieldRuns fields={fields} semantic={semantic} renderField={renderField} labelOf={labelOf} />;
	return searchScopes
		? <RelationSearchScopeContext.Provider value={searchScopes}>{body}</RelationSearchScopeContext.Provider>
		: body;
}

/** The page's own input for a field whose `fieldRenderers` entry renders one (`renderInput`). */
function pageInputOf(
	renderer: IFieldRenderer | undefined, disabled: boolean,
): ((props: { name: string }) => React.ReactNode) | undefined {
	const renderInput = renderer?.renderInput?.bind(renderer);
	return renderInput ? props => renderInput(props.name, { disabled }) : undefined;
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
	field, modelSchema, lock, labelHidden, asTerm,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	lock: FieldLockView,
	labelHidden?: boolean,
	asTerm: boolean,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	const t = useTranslate(useResourceDetailTranslationNs());
	const showLocked = useShowLockedFeature();
	const copy = fieldOccurrenceTestSegment(useFieldOccurrence(field));
	const related = useRelatedSchemas(modelSchema, isDottedField(field) ? [field] : undefined);
	const fieldDef = resolveSchemaField(modelSchema, field, name => related[name]);
	const messageKey = lock.kind === 'read' ? 'permission.field_read_locked' : 'permission.field_update_locked';
	const onClick = (): void => {
		const expression = toDisplayedEntitlements(lock.missing).join(', ');
		showLocked(lock.missing, t(messageKey, { expression }));
	};
	return (
		<FieldPair
			asTerm={asTerm}
			label={labelHidden ? null : <FieldLabelValue field={field} fieldDef={fieldDef} localize={localize} />}
		>
			<Group>
				<ActionIcon
					variant='subtle'
					color='gray'
					aria-label={t(messageKey, { expression: toDisplayedEntitlements(lock.missing).join(', ') })}
					onClick={onClick}
					data-locked='true'
					data-testid={joinTestId('resourceForm.fieldLock', field, copy)}
				>
					<IconLock size={16} />
				</ActionIcon>
			</Group>
		</FieldPair>
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
	field, modelSchema, fieldValues, labelHidden, asTerm, edgeLabels: ownEdgeLabels, computedField,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	/** The edge labels of `fieldValues`, for a nested record; else the detail read's. */
	edgeLabels?: Record<string, string>,
	/** The form field a live recompute is keyed by, when not `field` itself. */
	computedField?: string,
	/** In an inline row the surrounding text names the value, so only the value shows. */
	labelHidden?: boolean,
	/** Read mode: a `dt`/`dd` pair of the column's `dl`. */
	asTerm: boolean,
}): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	// Called before the early return, since hooks cannot be skipped. It no-ops for every field
	// that is not function-computed with a declared dependency.
	const computed = useComputedField(computedField ?? field);
	// Optional: a create form with a stable layout renders read-only fields too, and has no record.
	const contextEdgeLabels = React.useContext(ResourceUpdateContext)?.edgeLabels ?? noEdgeLabels;
	const edgeLabels = ownEdgeLabels ?? contextEdgeLabels;
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
	const label = labelHidden ? null : <FieldLabelValue field={field} fieldDef={fieldDef} localize={localize} />;
	// A boolean is a switch in both modes, so flipping into update mode does not change its look.
	if (fieldDef.data_type?.name === 'boolean') {
		return <FieldPair asTerm={asTerm} label={label}><ReadOnlyBooleanSwitch value={rawValue} /></FieldPair>;
	}

	const plainValue = hasDisplayableValue(rawValue)
		? renderDisplayFieldValue(rawValue, fieldDef, localize, fieldRenderers?.[field], fieldValues)
		: emptyFieldPlaceholder;

	return (
		<FieldPair asTerm={asTerm} label={label} valueClassName={fieldValueClass(fieldDef)}>
			{/* A page renderer for the field wins over the relation's label: the page chose how it reads. */}
			{relation && !fieldRenderers?.[field] ? (
				<EdgeFieldValue
					relation={relation}
					labelField={edgeLabels[relation.edge]}
					fieldValues={fieldValues}
					fallback={plainValue}
				/>
			) : plainValue}
		</FieldPair>
	);
}

/**
 * An `edge.leaf` field: the leaf of the record a to-one edge points at, read-only in every mode, as the detail read
 * nested it (`{ setting: { ui_mode } }`). A foreign-key leaf shows its record's label, keyed `edge.leafEdge` in the
 * read's `edge_labels`. Blank until the destination schema has loaded.
 */
function DottedFieldValue({
	field, modelSchema, fieldValues, labelHidden, asTerm,
}: {
	field: string,
	modelSchema: dyn.ModelSchema,
	fieldValues: Record<string, unknown>,
	labelHidden?: boolean,
	asTerm: boolean,
}): React.ReactNode {
	const [edge, leaf] = [field.slice(0, field.indexOf('.')), field.slice(field.indexOf('.') + 1)];
	const related = useRelatedSchemas(modelSchema, [field]);
	const destSchema = related[relationDestSchemaName(modelSchema, edge) ?? ''];
	const allLabels = React.useContext(ResourceUpdateContext)?.edgeLabels ?? noEdgeLabels;
	const nestedLabels = React.useMemo(() => Object.fromEntries(Object.entries(allLabels)
		.filter(([path]) => path.startsWith(`${edge}.`))
		.map(([path, labelField]) => [path.slice(edge.length + 1), labelField])), [allLabels, edge]);
	if (!destSchema) {
		return null;
	}
	const nested = readFieldValue(fieldValues, edge);
	return (
		<ReadOnlyFieldValue
			field={leaf} modelSchema={destSchema} computedField={field} edgeLabels={nestedLabels}
			fieldValues={(nested && typeof nested === 'object' ? nested : {}) as Record<string, unknown>}
			labelHidden={labelHidden} asTerm={asTerm}
		/>
	);
}

/** The label of a read-only or locked field, with the same description mark as an input's label. */
function FieldLabelValue({ field, fieldDef, localize }: {
	field: string,
	fieldDef: dyn.ModelSchemaField | undefined,
	localize: LocalizeFn,
}): React.ReactNode {
	return (
		<FieldLabelText
			label={fieldDef ? localize(fieldDef.label) : field}
			description={localizeFieldDescription(localize, fieldDef?.description)}
			announce
		/>
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
