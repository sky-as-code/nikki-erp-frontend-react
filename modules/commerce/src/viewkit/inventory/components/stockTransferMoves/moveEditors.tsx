import { Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Select } from '@nikkierp/ui/components';
import { useI18n, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { ATTRIBUTE_FIELD, VALUE_FIELD } from './moveGroups';
import { MoveOptionsContext, toAttributeOptions, toValueOptions, useLoadedOptions } from './moveOptions';
import { INVENTORY_MODULE } from '../../../../constants/inventory';

import type { AttributeOption, LoadedOptions, ValueOption } from './moveOptions';
import type { NewRowFieldEditor, NewRowFieldEditorProps } from '@nikkierp/ui/components/ExcelDataTable';
import type { UseFormReturn } from 'react-hook-form';


export const MOVES_TEST_ID_PREFIX = 'inventory.stockTransferMoves';

/**
 * What the attributes modal's rows edit for: the move's template and the attribute each row picked (by row id),
 * so a row offers only the template's attributes no other row uses.
 */
export type MoveAttributeScope = { templateId: string | undefined, attributeByRow: Map<string, string> };

export const MoveAttributeScopeContext = React.createContext<MoveAttributeScope>(
	{ templateId: undefined, attributeByRow: new Map() },
);

/** The picked template's variant-generating attributes; none until a template is picked. */
export function useAttributeOptions(templateId: string | undefined): LoadedOptions<AttributeOption> {
	const loaders = React.useContext(MoveOptionsContext);
	const { language } = useI18n();
	const map = React.useCallback(
		(items: Record<string, unknown>[]) => toAttributeOptions(items, language), [language],
	);
	return useLoadedOptions(templateId ?? '', loaders?.attributesOf, map);
}

export function useValueOptions(templateAttributeId: string | undefined): LoadedOptions<ValueOption> {
	const loaders = React.useContext(MoveOptionsContext);
	const { language } = useI18n();
	const map = React.useCallback((items: Record<string, unknown>[]) => toValueOptions(items, language), [language]);
	return useLoadedOptions(templateAttributeId ?? '', loaders?.valuesOf, map);
}

type PickerForm = Pick<UseFormReturn<any>, 'setValue' | 'clearErrors'>;

/**
 * Another attribute clears the value, which belonged to the old one. Both are marked dirty, so a
 * table-scope row writes them in one group update.
 */
export function pickAttribute(form: PickerForm, field: string, picked: string | null): void {
	form.setValue(field, picked, { shouldDirty: true });
	form.setValue(VALUE_FIELD, null, { shouldDirty: true });
	form.clearErrors([field, VALUE_FIELD]);
}

/** The attributes the move's other rows already use; the insert row (no id) excludes every row's. */
function useSiblingAttributeIds(props: NewRowFieldEditorProps): string[] {
	const { attributeByRow } = React.useContext(MoveAttributeScopeContext);
	const ownId = String((props.form.form.getValues() as Record<string, unknown>).id ?? '');
	return React.useMemo(
		() => [...attributeByRow].filter(([rowId]) => rowId !== ownId).map(([, attributeId]) => attributeId),
		[attributeByRow, ownId],
	);
}

/** The template's attributes less those the move already uses, the row's own pick kept. */
export function withoutUsedAttributes(
	options: AttributeOption[], usedIds: string[], current: string | undefined,
): AttributeOption[] {
	return options.filter(option => option.value === current || !usedIds.includes(option.value));
}

function useWatched(props: NewRowFieldEditorProps, name: string): string | undefined {
	const value = useWatch({ control: props.form.form.control, name }) as string | null | undefined;
	return value ?? undefined;
}

/**
 * `[Attribute v]`: the template's attributes that make variants, disabled until the move has a template.
 * Picking another attribute clears the value, which belonged to the old one. A lone option is picked.
 */
function AttributeEditor(props: NewRowFieldEditorProps): React.ReactNode {
	const { field, form } = props;
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const { templateId } = React.useContext(MoveAttributeScopeContext);
	const value = useWatched(props, field);
	const attributes = useAttributeOptions(templateId);
	const usedIds = useSiblingAttributeIds(props);
	// The server refuses one attribute twice in a move (`selection_duplicate_attribute`): never offer it.
	const options = React.useMemo(
		() => withoutUsedAttributes(attributes.options, usedIds, value), [attributes.options, usedIds, value],
	);
	const onChange = (picked: string | null) => pickAttribute(form.form, field, picked);
	const placeholder = !templateId ? 'stock_transfer_moves_pick_template' : 'stock_transfer_moves_pick_attribute';
	return (
		<>
			<Select
				data={options}
				value={value ?? null}
				onChange={onChange}
				autoSelectItem={options.length === 1}
				disabled={!templateId || attributes.isPending}
				placeholder={t(attributes.isPending ? 'messages.loading' : placeholder)}
				allowDeselect={false}
				{...testAttrs(MOVES_TEST_ID_PREFIX, 'attribute')}
			/>
			<LoadFailure failed={attributes.failed} />
		</>
	);
}

/** `[Value v]`: the values the template offers for the picked attribute, disabled until one is picked. */
function ValueEditor(props: NewRowFieldEditorProps): React.ReactNode {
	const { field, form } = props;
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const { templateId } = React.useContext(MoveAttributeScopeContext);
	const attributeId = useWatched(props, ATTRIBUTE_FIELD);
	const value = useWatched(props, field);
	const attributes = useAttributeOptions(templateId);
	const line = attributes.options.find(option => option.value === attributeId);
	const values = useValueOptions(line?.templateAttributeId);
	const onChange = (picked: string | null) => {
		form.form.setValue(field, picked, { shouldDirty: true });
		form.form.clearErrors(field);
	};
	const pending = attributes.isPending || values.isPending;
	return (
		<>
			<Select
				data={values.options}
				value={value ?? null}
				onChange={onChange}
				autoSelectItem={values.options.length === 1}
				disabled={!line || pending}
				placeholder={t(pending ? 'messages.loading' : 'stock_transfer_moves_pick_value')}
				allowDeselect={false}
				{...testAttrs(MOVES_TEST_ID_PREFIX, 'value')}
			/>
			<LoadFailure failed={values.failed} />
		</>
	);
}

function LoadFailure({ failed }: { failed: boolean }): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	if (!failed) {
		return null;
	}
	return (
		<Text size='xs' c='var(--mantine-color-error)'>
			{t('stock_transfer_moves_options_failed', { defaultValue: 'The options could not be loaded.' })}
		</Text>
	);
}

/** The attributes modal's row editors; module-level, so the rows keep their editor state across renders. */
export const ATTRIBUTE_ROW_EDITORS: Record<string, NewRowFieldEditor> = {
	[ATTRIBUTE_FIELD]: AttributeEditor,
	[VALUE_FIELD]: ValueEditor,
};
