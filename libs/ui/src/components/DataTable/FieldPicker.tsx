import { Stack, Text } from '@mantine/core';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { useDataTableContext } from './DataTableContext';
import classes from './FieldPicker.module.css';
import {
	addFields, canMoveDown, canMoveUp, moveFieldsDown, moveFieldsUp, removeFields, sortAvailable,
} from './fieldPickerModel';
import { useLocaleCollator, useTranslate } from '../../i18n';
import { Button } from '../Button';


export type FieldPickerProps = {
	/** Every field the user may display, in no particular order. */
	selectableFields: string[],
	/** The columns shown today, in display order. */
	initialDisplayedFields: string[],
	/** Reads the chosen order back when the modal applies. */
	selectionGetterRef: React.RefObject<(() => string[]) | null>,
	translationNs: string,
};

/**
 * Two lists and the buttons that move fields between them.
 *
 * The displayed list keeps the user's order, because that order *is* the column order. The
 * available list is a pool and always reads alphabetically, so a field returned to it lands where
 * the user would look for it rather than where it happened to be removed from.
 */
export function FieldPicker(props: FieldPickerProps): React.ReactNode {
	const { tid } = useDataTableContext();
	const t = useTranslate('common');
	const tField = useTranslate(props.translationNs);
	const compareLocalized = useLocaleCollator();
	const label = React.useCallback((field: string) => tField(`fields.${field}`), [tField]);

	const [displayed, setDisplayed] = React.useState<string[]>(props.initialDisplayedFields);
	const [displayedChosen, setDisplayedChosen] = React.useState<string[]>([]);
	const [availableChosen, setAvailableChosen] = React.useState<string[]>([]);

	const available = React.useMemo(
		() => sortAvailable(
			props.selectableFields.filter(field => !displayed.includes(field)), label, compareLocalized),
		[props.selectableFields, displayed, label, compareLocalized],
	);

	// The modal reads the order back through this ref when the user applies, so the picker never
	// has to push every keystroke of state up into it.
	React.useEffect(() => {
		props.selectionGetterRef.current = () => displayed;
	}, [displayed, props.selectionGetterRef]);

	const onAdd = React.useCallback(() => {
		setDisplayed(prev => addFields(prev, availableChosen));
		setAvailableChosen([]);
	}, [availableChosen]);

	const onRemove = React.useCallback(() => {
		setDisplayed(prev => removeFields(prev, displayedChosen));
		setDisplayedChosen([]);
	}, [displayedChosen]);

	const onMoveUp = React.useCallback(() => {
		setDisplayed(prev => moveFieldsUp(prev, displayedChosen));
	}, [displayedChosen]);

	const onMoveDown = React.useCallback(() => {
		setDisplayed(prev => moveFieldsDown(prev, displayedChosen));
	}, [displayedChosen]);

	return (
		<div className={clsx(classes.panes, 'mt-2')}>
			<FieldList
				fields={displayed}
				chosen={displayedChosen}
				label={label}
				title={t('datatable.displayedFields')}
				onChange={setDisplayedChosen}
				{...tid.settingsFieldsDisplayed()}
			/>
			<MoveButtons
				canAdd={availableChosen.length > 0}
				canRemove={displayedChosen.length > 0}
				canGoUp={canMoveUp(displayed, displayedChosen)}
				canGoDown={canMoveDown(displayed, displayedChosen)}
				onAdd={onAdd}
				onRemove={onRemove}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
			/>
			<FieldList
				fields={available}
				chosen={availableChosen}
				label={label}
				title={t('datatable.availableFields')}
				onChange={setAvailableChosen}
				{...tid.settingsFieldsAvailable()}
			/>
		</div>
	);
}

/**
 * The column of move buttons between the two lists.
 *
 * `[>]` sends fields rightwards to the available pool and `[<]` brings them back, so each arrow
 * points at the list its fields are travelling to.
 */
function MoveButtons(props: {
	canAdd: boolean,
	canRemove: boolean,
	canGoUp: boolean,
	canGoDown: boolean,
	onAdd: () => void,
	onRemove: () => void,
	onMoveUp: () => void,
	onMoveDown: () => void,
}): React.ReactNode {
	const { tid } = useDataTableContext();
	const t = useTranslate('common');

	return (
		<Stack gap='xs'>
			<Button
				aria-label={t('datatable.fieldRemove')}
				disabled={!props.canRemove}
				onClick={props.onRemove}
				{...tid.settingsFieldsRemove()}
			>
				<IconChevronRight size={16} />
			</Button>
			<Button
				aria-label={t('datatable.fieldAdd')}
				disabled={!props.canAdd}
				onClick={props.onAdd}
				{...tid.settingsFieldsAdd()}
			>
				<IconChevronLeft size={16} />
			</Button>
			<Button
				aria-label={t('datatable.fieldMoveUp')}
				disabled={!props.canGoUp}
				onClick={props.onMoveUp}
				{...tid.settingsFieldsUp()}
			>
				<IconChevronUp size={16} />
			</Button>
			<Button
				aria-label={t('datatable.fieldMoveDown')}
				disabled={!props.canGoDown}
				onClick={props.onMoveDown}
				{...tid.settingsFieldsDown()}
			>
				<IconChevronDown size={16} />
			</Button>
		</Stack>
	);
}

function FieldList({
	fields, chosen, label, title, onChange, ...rest
}: {
	fields: string[],
	chosen: string[],
	label: (field: string) => string,
	title: string,
	onChange: (values: string[]) => void,
}): React.ReactNode {
	const onSelectChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		onChange(Array.from(event.currentTarget.selectedOptions, option => option.value));
	}, [onChange]);

	return (
		<Stack gap={4}>
			<Text size='sm' fw={500}>{title}</Text>
			<select
				multiple
				className={classes.list}
				value={chosen}
				onChange={onSelectChange}
				{...rest}
			>
				{fields.map(field => (
					<option key={field} value={field}>{label(field)}</option>
				))}
			</select>
		</Stack>
	);
}
