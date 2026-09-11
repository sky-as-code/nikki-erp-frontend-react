import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import type { ImportTarget } from './targets';
import type { ImportWizard } from './useImportWizard';
import type { DragEndEvent } from '@dnd-kit/core';
import type { TranslateFn } from '@nikkierp/ui/i18n';


/** One height for every cell, so the three independent columns stay aligned by row. */
const ROW_HEIGHT = 40;

type MappingStepProps = {
	t: TranslateFn,
	tid: (part: string) => Record<string, string>,
	wizard: ImportWizard,
};

/**
 * "Field Mapping": file columns and target columns are two independently sortable lists aligned
 * by index, with a read-only Mandatory switch per row. Dragging a handle moves one cell of one
 * column, which is how a user lines a file column up with the field it should feed.
 */
export function MappingStep({ t, tid, wizard }: MappingStepProps): React.ReactNode {
	const { state } = wizard;
	return (
		<Stack gap='md'>
			{/* Above the table, not below it: a refusal that names a column is what the user has to
			    act on, and under a table as long as the file's column count it scrolls out of sight
			    exactly when it matters. */}
			<ImportProblems t={t} tid={tid} wizard={wizard} />

			<Title order={4}>{t('import.fieldMapping')}</Title>
			<Group align='flex-start' grow wrap='nowrap' preventGrowOverflow={false}>
				<SortableColumn
					header={t('import.fileColumns')}
					prefix='source'
					cells={state.rows.map(row => row.source)}
					placeholder={t('import.unmapped')}
					onMove={wizard.moveSourceRow}
					tid={tid}
				/>
				<SortableColumn
					header={t('import.targetColumns')}
					prefix='target'
					cells={state.rows.map(row => row.target?.label ?? null)}
					placeholder={t('import.unmapped')}
					onMove={wizard.moveTargetRow}
					tid={tid}
				/>
				<Stack gap='xs' className='flex-none' w={120}>
					<Text fw={600} size='sm' h={24}>{t('import.mandatory')}</Text>
					{state.rows.map((row, i) => (
						// A `Group`, not a `Center`: the switch reads as a value in its column and
						// belongs under the left-aligned header above it. `Center` would also win
						// the cascade against a utility class, since its own rule sets
						// `justify-content: center`.
						<Group key={i} h={ROW_HEIGHT} align='center' justify='flex-start'>
							<Switch
								checked={Boolean(row.target?.isMandatory)}
								readOnly
								onChange={() => undefined}
								{...tid(`mandatory-${row.target?.name ?? i}`)}
							/>
						</Group>
					))}
				</Stack>
			</Group>

			<Title order={5}>{t('import.options')}</Title>
			<Switch
				label={t('import.createMissingReferences')}
				checked={state.createMissing}
				onChange={event => wizard.setCreateMissing(event.currentTarget.checked)}
				{...tid('createMissing')}
			/>
		</Stack>
	);
}

/**
 * Everything blocking the import: unmapped mandatory fields, a mapping the server rejected, or a
 * technical failure. Rendered above the mapping table, since each one names a column the user has
 * to go and fix there.
 */
function ImportProblems({ t, tid, wizard }: MappingStepProps): React.ReactNode {
	const { state, missing } = wizard;
	if (missing.length === 0 && state.requestErrors.length === 0 && !state.failure) {
		return null;
	}

	return (
		<Stack gap={2}>
			{missing.length > 0 ? (
				<Text size='sm' c='red' {...tid('missingMandatory')}>
					{t('import.missingMandatory', { fields: missing.map(target => target.label).join(', ') })}
				</Text>
			) : null}
			{state.requestErrors.map((item, i) => (
				<Text key={i} size='sm' c='red' {...(i === 0 ? tid('requestErrors') : {})}>
					{t(item.key, item.vars) || item.message}
				</Text>
			))}
			{state.failure ? <Text size='sm' c='red' {...tid('failure')}>{state.failure}</Text> : null}
		</Stack>
	);
}

type SortableColumnProps = {
	header: string,
	prefix: string,
	cells: (string | null)[],
	placeholder: string,
	onMove: (from: number, to: number) => void,
	tid: (part: string) => Record<string, string>,
};

function SortableColumn({ header, prefix, cells, placeholder, onMove, tid }: SortableColumnProps): React.ReactNode {
	const sensors = useSensors(useSensor(PointerSensor));
	const ids = cells.map((_, i) => `${prefix}-${i}`);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}
		const from = ids.indexOf(String(active.id));
		const to = ids.indexOf(String(over.id));
		if (from >= 0 && to >= 0) {
			onMove(from, to);
		}
	};

	return (
		<Stack gap='xs' className='min-w-0' {...tid(`${prefix}Column`)}>
			<Text fw={600} size='sm' h={24}>{header}</Text>
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={ids} strategy={verticalListSortingStrategy}>
					{cells.map((cell, i) => (
						<SortableCell key={ids[i]} id={ids[i]} text={cell} placeholder={placeholder} />
					))}
				</SortableContext>
			</DndContext>
		</Stack>
	);
}

type SortableCellProps = { id: string, text: string | null, placeholder: string };

function SortableCell({ id, text, placeholder }: SortableCellProps): React.ReactNode {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
	return (
		<Paper
			ref={setNodeRef}
			withBorder
			px='xs'
			h={ROW_HEIGHT}
			className={clsx('flex items-center', isDragging && 'opacity-60')}
			style={{ transform: CSS.Transform.toString(transform), transition }}
		>
			<Group gap='xs' wrap='nowrap' className='min-w-0 w-full'>
				{/* `select-none` on the handle alone, so the row's text stays selectable. The cursor
				    is an inline style rather than a `cursor-grab` utility: this Tailwind build does
				    not emit the grab/grabbing cursor classes, so the class spelling is silently
				    inert. */}
				<span
					className='flex items-center select-none'
					style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
					{...attributes}
					{...listeners}
				>
					<IconGripVertical size={16} />
				</span>
				{/* Selectable: lining a file column up with a field means reading the two names, and
				    a user checking an exact spelling has to be able to select the text to copy it. */}
				<Text size='sm' truncate c={text ? undefined : 'dimmed'} className='select-text'>
					{text ?? placeholder}
				</Text>
			</Group>
		</Paper>
	);
}

/** Localized label of a target by field name, for the summary's error table. */
export function targetLabelOf(targets: ImportTarget[], field: string | undefined): string {
	if (!field) {
		return '';
	}
	return targets.find(target => target.name === field)?.label ?? field;
}
