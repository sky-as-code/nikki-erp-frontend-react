import { ColorInput, Group, Tooltip } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { withInputDensity } from '@nikkierp/ui/components';
import { AutoField } from '@nikkierp/ui/components/form';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useController } from 'react-hook-form';

import { COLOR_FIELD, NAME_FIELD } from './attributeValueDrafts';
import { INVENTORY_MODULE } from '../../../constants';

import type { ClientErrorItem } from '@nikkierp/common/types';
import type { NewRowFieldEditor, NewRowFieldEditorProps } from '@nikkierp/ui/components/ExcelDataTable';


/**
 * Whether the attribute being edited shows its values as colour swatches. The colour editor reads
 * it: it renders inside the row's own form, which cannot see the attribute form's `display_type`.
 */
export const ColorDisplayContext = React.createContext(false);

/** No `size`: the row's inline-controls scope sizes the box, like every other input in it. */
const COLOR_INPUT_CLASS_NAMES = withInputDensity({});

/**
 * `#RRGGBB` picker, enabled only while the attribute's display type is Color. Under any other
 * display type the stored colour is kept and shown, but not edited: it is meaningless there.
 */
function ColorHexEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const t = useTranslate([INVENTORY_MODULE, 'common']);
	const isColor = React.useContext(ColorDisplayContext);
	const { field: input, fieldState } = useController({ control: form.form.control, name: field });
	const value = typeof input.value === 'string' ? input.value : '';
	const error = fieldState.error?.message;
	return (
		<Tooltip label={t('product_attribute_values_colorOnlyForColorDisplay')} disabled={isColor} withinPortal>
			<div>
				<ColorInput
					classNames={COLOR_INPUT_CLASS_NAMES}
					format='hex'
					value={value}
					onChange={next => input.onChange(next === '' ? null : next)}
					onBlur={input.onBlur}
					disabled={!isColor}
					error={error ? t(error, { defaultValue: error }) : undefined}
					aria-label={t('fields.color_hex')}
					data-testid='inventory.attributeValues.colorInput'
				/>
			</div>
		</Tooltip>
	);
}

/** The last save's errors of one table row, by row id; none outside a rejected save. */
export const ValueRowErrorsContext = React.createContext<(rowId: string) => ClientErrorItem[]>(() => []);

const ROW_ID_FIELD = 'id';

/**
 * The name's default input, behind a warning icon while the last save rejected this row. The rows
 * edit inline, so the icon sits in the editor; the insert row has no id and never shows one.
 */
function NameEditor({ field, form }: NewRowFieldEditorProps): React.ReactNode {
	const translateError = useClientErrorTranslate([INVENTORY_MODULE, 'common']);
	const errorsOf = React.useContext(ValueRowErrorsContext);
	const rowId = form.form.getValues(ROW_ID_FIELD) as unknown;
	const rowErrors = typeof rowId === 'string' && rowId !== '' ? errorsOf(rowId) : [];
	if (rowErrors.length === 0) {
		return <AutoField name={field} labelHidden />;
	}
	return (
		<Group gap='xs' wrap='nowrap'>
			<Tooltip label={rowErrors.map(translateError).join('\n')} multiline maw={360} withinPortal>
				<IconAlertCircle
					size={16}
					className='flex-none'
					color='var(--mantine-color-red-filled)'
					{...testAttrs('inventory.attributeValues', 'rowError')}
				/>
			</Tooltip>
			<div className='min-w-0 flex-1'><AutoField name={field} labelHidden /></div>
		</Group>
	);
}

/** Module level, so the table never remounts an editor (and loses its open dropdown) on a re-render. */
export const VALUE_FIELD_EDITORS: Record<string, NewRowFieldEditor> = {
	[NAME_FIELD]: NameEditor,
	[COLOR_FIELD]: ColorHexEditor,
};
