import { Alert, Badge, ColorSwatch, Group, Stack, Switch, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { resolveLangJson } from '@nikkierp/ui/components';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useClientErrorTranslate, useI18n, useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import {
	actionRequirement, FormDataTable, useDetailSavePayload, useResourceFormView,
} from '@nikkierp/viewkit-mantine';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { z } from 'zod';

import {
	ARCHIVED_FIELD, COLOR_FIELD, isDraftRow, isEditedRow, mapValueErrors, mergeDraftRows, NAME_FIELD, VALUE_COLUMNS,
} from './attributeValueDrafts';
import { useValueDraftState } from './attributeValuesData';
import { ColorDisplayContext, VALUE_FIELD_EDITORS, ValueRowErrorsContext } from './valueEditors';
import { INVENTORY_MODULE, PRODUCT_ATTRIBUTE_SCHEMA_NAME, PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../../../constants/inventory';
import { ATTRIBUTE_VALUES } from '../../ids';

import type { ValueErrors } from './attributeValueDrafts';
import type { ValueDraftState } from './attributeValuesData';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ExcelDataTableCapability, SearchItem } from '@nikkierp/ui/components/ExcelDataTable';
import type { FieldRendererMap, IComponentRenderer } from '@nikkierp/viewengine/core';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';
import type { Control } from 'react-hook-form';


const TEST_ID_PREFIX = 'inventory.attributeValues';
const CAPABILITIES: ExcelDataTableCapability[] = ['create', 'update', 'delete'];
const VALUE_ORDER: dyn.OrderBy = [['sequence', 'asc'], ['code', 'asc']];
/** A new attribute has no values yet; `attribute_id` is required, so this matches nothing. */
const NO_SAVED_VALUES: dyn.SearchGraph = { if: ['attribute_id', 'not_set'] };
const DISPLAY_TYPE_FIELD = 'display_type';
const COLOR_DISPLAY = 'color';

/** The values ride the attribute's own write, which the backend authorizes as that create or update. */
const CREATE_REQUIREMENT = actionRequirement(PRODUCT_ATTRIBUTE_SCHEMA_NAME, 'create');
const UPDATE_REQUIREMENT = actionRequirement(PRODUCT_ATTRIBUTE_SCHEMA_NAME, 'update');

export const attributeValuesRenderer: IComponentRenderer<Record<string, never>> = {
	type: ATTRIBUTE_VALUES,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={ATTRIBUTE_VALUES}>
				<AttributeValuesGuard />
			</ComponentAnchor>
		);
	},
};

/** The section needs the attribute form (for `display_type`) and its save; outside one it renders nothing. */
function AttributeValuesGuard(): React.ReactNode {
	const save = useDetailSavePayload();
	const runtime = useCrudFormRuntime();
	if (!save || !runtime) {
		return null;
	}
	return <AttributeValuesSection save={save} control={runtime.form.control} />;
}

type SectionProps = { save: DetailSavePayload, control: Control<any> };

/**
 * The attribute's values. In create and update mode every row edits inline (`updateScope='table'`)
 * and each write only drafts a change: the table badges added rows "New" and edited ones "Changed",
 * a deleted saved value leaves the view, and all of it rides the attribute's own create or update
 * request on Save, in one transaction. Cancel or a successful Save discards the drafts, which brings
 * deleted values back; a rejected save keeps them, lists every error above the table and marks each
 * row's name input.
 */
function AttributeValuesSection({ save, control }: SectionProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const displayType = useWatch({ control, name: DISPLAY_TYPE_FIELD });
	const section = useValuesSection(save);
	const lock = save.mode === 'create' ? CREATE_REQUIREMENT : UPDATE_REQUIREMENT;
	return (
		<Stack gap='xs' {...testAttrs(TEST_ID_PREFIX)}>
			<Group justify='flex-end'>
				<Switch
					size='xs'
					label={t('product_attribute_values_showArchived', { defaultValue: 'Show archived values' })}
					checked={section.showArchived}
					onChange={event => section.setShowArchived(event.currentTarget.checked)}
					{...testAttrs(TEST_ID_PREFIX, 'showArchived')}
				/>
			</Group>
			<ValueSaveErrors errors={section.errors} rowLabel={section.rowLabel} />
			<ColorDisplayContext.Provider value={displayType === COLOR_DISPLAY}>
				<ValueRowErrorsContext.Provider value={section.rowErrors}>
					<FormDataTable
						key={`${section.loadCount}:${section.showArchived}`}
						schemaName={PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME}
						baseGraph={section.baseGraph}
						fields={VALUE_COLUMNS}
						includeArchived={section.showArchived}
						transformItems={section.transformItems}
						capabilities={CAPABILITIES}
						updateScope='table'
						enableChangeIndicator
						isNewRow={isDraftRow}
						isChangedRow={section.isChangedRow}
						indexColumnVisible={false}
						newRowPrompt={t('product_attribute_values_add', { defaultValue: 'Add a value' })}
						fieldEditors={VALUE_FIELD_EDITORS}
						onCreated={section.onCreated}
						onUpdated={section.onUpdated}
						onDeleted={section.onDeleted}
						createEntitlement={lock}
						updateEntitlement={lock}
						deleteEntitlement={lock}
						fieldRenderers={section.fieldRenderers}
						emptyMessage={t('product_attribute_values_empty', { defaultValue: 'No values yet' })}
						testId={TEST_ID_PREFIX}
					/>
				</ValueRowErrorsContext.Provider>
			</ColorDisplayContext.Provider>
		</Stack>
	);
}

function useValuesSection(save: DetailSavePayload) {
	const routeId = useParams().id ?? '';
	const attributeId = save.mode === 'create' ? '' : routeId;
	const updateMode = useResourceFormView()?.updateMode ?? true;
	const [showArchived, setShowArchived] = React.useState(false);
	// A save re-reads the rows: the table remounts and runs its search again.
	const [loadCount, setLoadCount] = React.useState(0);
	const baseGraph = React.useMemo((): dyn.SearchGraph => (attributeId
		? { if: ['attribute_id', '=', attributeId], order: VALUE_ORDER }
		: NO_SAVED_VALUES), [attributeId]);
	const draftState = useValueDraftState({
		attributeId, save, updateMode, onSaved: () => setLoadCount(count => count + 1),
	});
	const { drafts, sent } = draftState;
	// The rows as last loaded or drafted, removed ones too, so an error list can name the row it points at.
	const knownRows = React.useRef(new Map<string, SearchItem>());
	const transformItems = React.useCallback((items: SearchItem[]) => {
		const rows = mergeDraftRows(items, drafts);
		knownRows.current = new Map([...items, ...rows].map(row => [String(row.id), row]));
		return rows;
	}, [drafts]);
	// Drafts outlive the table's own change tracking, which a remount (a reload, the archived switch) resets.
	const isChangedRow = React.useCallback((row: SearchItem) => isEditedRow(row, drafts), [drafts]);
	// `sent` is written by the save's build, just before the request whose errors arrive here.
	const errors = React.useMemo(
		() => (updateMode ? mapValueErrors(save.saveClientErrors, sent.current) : NO_ERRORS),
		[save.saveClientErrors, updateMode, sent],
	);
	const rowLabel = React.useCallback((rowId: string) => knownRows.current.get(rowId), []);
	const rowErrors = React.useCallback((rowId: string) => errors.byRow[rowId] ?? NO_ROW_ERRORS, [errors]);
	return {
		baseGraph, loadCount, showArchived, setShowArchived, transformItems, isChangedRow, errors, rowLabel, rowErrors,
		...useDraftSinks(draftState),
		fieldRenderers: useValueRenderers(),
	};
}

const NO_ERRORS: ValueErrors = { byRow: {}, general: [] };
const NO_ROW_ERRORS: ClientErrorItem[] = [];

/** The table's row writes, as drafts. */
function useDraftSinks(draftState: ValueDraftState) {
	const onCreated = (values: Record<string, unknown>): boolean => {
		draftState.add(values);
		return true;
	};
	const onUpdated = (values: Record<string, unknown>): boolean => {
		draftState.update(values);
		return true;
	};
	// The table deletes one row at a time.
	const onDeleted = (items: SearchItem[]) => items.forEach(item => draftState.remove(item));
	return { onCreated, onUpdated, onDeleted };
}

/** `name` in the active language; `color_hex` shows a swatch; `is_archived` a badge. */
function useValueRenderers(): FieldRendererMap {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const archived = t('product_attribute_values_archived', { defaultValue: 'Archived' });
	const language = useI18n().language;
	return React.useMemo((): FieldRendererMap => ({
		[NAME_FIELD]: {
			render: text => text,
			renderRaw: raw => nameText(raw, language),
		},
		[COLOR_FIELD]: {
			render: text => text,
			renderRaw: (raw, text) => (typeof raw === 'string' && raw !== '' ? (
				<Group gap={6} wrap='nowrap'>
					<ColorSwatch color={raw} size={14} />
					<Text size='sm'>{text}</Text>
				</Group>
			) : ''),
		},
		[ARCHIVED_FIELD]: {
			render: text => text,
			renderRaw: raw => (raw === true ? <Badge size='xs' color='gray' variant='light'>{archived}</Badge> : ''),
		},
	}), [archived, language]);
}

function nameText(raw: unknown, language: string): string {
	if (typeof raw === 'string') {
		return raw;
	}
	if (raw === null || typeof raw !== 'object') {
		return '';
	}
	return resolveLangJson(raw as dyn.ModelSchemaLangJson, language);
}

/**
 * Every rejection of the delta, row errors named by their row. The page's own error area cannot show
 * them: it pins field errors on the inputs of that name, and no input is named `values.*`.
 */
function ValueSaveErrors({ errors, rowLabel }: {
	errors: ValueErrors,
	rowLabel: (rowId: string) => SearchItem | undefined,
}): React.ReactNode {
	const translateError = useClientErrorTranslate([INVENTORY_MODULE, 'common']);
	const lines = [
		...errors.general.map(item => translateError(item)),
		...Object.entries(errors.byRow).flatMap(([rowId, items]) => {
			const row = rowLabel(rowId);
			const label = row ? rowLabelText(row) : rowId;
			return items.map(item => `${label}: ${translateError(item)}`);
		}),
	];
	if (lines.length === 0) {
		return null;
	}
	return (
		<Alert variant='light' color='red' {...testAttrs(TEST_ID_PREFIX, 'errors')}>
			{lines.map((line, index) => <div key={index}>{line}</div>)}
		</Alert>
	);
}

/** A value's code: unlike its name it is one plain string, and unique within the attribute. */
function rowLabelText(row: SearchItem): string {
	const code = row.code;
	return typeof code === 'string' && code !== '' ? code : String(row.id);
}
