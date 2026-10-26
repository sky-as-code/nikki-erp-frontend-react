import { ActionIcon, Group, Stack, Table, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, INLINE_CONTROLS_ATTRS, Select } from '@nikkierp/ui/components';
import { EditRowActions } from '@nikkierp/ui/components/ExcelDataTable';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { attributeLabel, TEST_ID_PREFIX, valueLabel } from './sectionText';
import { addExclusion, removeExclusion } from './templateConfigDrafts';

import type { AttributeCatalogue } from './attributeCatalogue';
import type { SectionText } from './sectionText';
import type { TemplateConfigDraft } from './templateConfigDrafts';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** Modes whose values enter the combination key; a never-mode value cannot be excluded. */
const GENERATING_MODES = new Set(['instant', 'dynamic']);

type ExclusionsProps = {
	draft: TemplateConfigDraft,
	catalogue: AttributeCatalogue,
	editable: boolean,
	exclusionErrors: Record<string, ClientErrorItem[]>,
	onChange: (next: TemplateConfigDraft) => void,
	text: SectionText,
};

/** Pairs of selected values, of two different variant-creating attributes, that never form a variant together. */
export function ExclusionsTable(props: ExclusionsProps): React.ReactNode {
	const { draft, editable, text } = props;
	if (draft.exclusions.length === 0 && !editable) {
		return null;
	}
	return (
		<Stack gap='xs' {...testAttrs(TEST_ID_PREFIX, 'exclusions')}>
			<Text size='sm' fw={600}>{text.t('product_template_config_exclusions')}</Text>
			{draft.exclusions.length === 0 ? (
				<Text size='sm' c='dimmed'>{text.t('product_template_config_exclusionsEmpty')}</Text>
			) : null}
			<ExclusionRows {...props} />
		</Stack>
	);
}

function ExclusionRows({ draft, editable, exclusionErrors, onChange, text, catalogue }: ExclusionsProps) {
	const label = (valueId: string) => qualifiedValueLabel(catalogue, valueId, text);
	return (
		<Table withTableBorder verticalSpacing={4}>
			<Table.Tbody>
				{draft.exclusions.map(item => (
					<Table.Tr key={item.key} {...testAttrs(TEST_ID_PREFIX, 'exclusion')}>
						<Table.Td>
							<Text size='sm'>{label(item.leftValueId)} × {label(item.rightValueId)}</Text>
							{(exclusionErrors[item.key] ?? []).map((error, index) => (
								<Text key={index} size='xs' c='red'>{text.translateError(error)}</Text>
							))}
						</Table.Td>
						{editable ? (
							<Table.Td w={48}>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onChange(removeExclusion(draft, item.key))}
									aria-label={text.t('product_template_config_remove')}
									{...testAttrs(TEST_ID_PREFIX, 'removeExclusion')}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Table.Td>
						) : null}
					</Table.Tr>
				))}
				{editable ? (
					<ExclusionAddRow draft={draft} catalogue={catalogue} onChange={onChange} text={text} />
				) : null}
			</Table.Tbody>
		</Table>
	);
}

type ExclusionAddProps = Pick<ExclusionsProps, 'draft' | 'catalogue' | 'onChange' | 'text'>;

/**
 * The table's last row, in the ExcelDataTable add-line style: `[+ Add exclusion]` until clicked,
 * then the two value pickers with Add / Discard. Add keeps the row open for the next pair.
 */
function ExclusionAddRow(props: ExclusionAddProps): React.ReactNode {
	const [isAdding, setIsAdding] = React.useState(false);
	return (
		<Table.Tr {...INLINE_CONTROLS_ATTRS}>
			<Table.Td colSpan={2}>
				{isAdding ? <ExclusionInsert {...props} onClose={() => setIsAdding(false)} /> : (
					<Button
						variant='subtle'
						leftSection={<IconPlus size={14} />}
						onClick={() => setIsAdding(true)}
						{...testAttrs(TEST_ID_PREFIX, 'addExclusion')}
					>
						{props.text.t('product_template_config_addExclusion')}
					</Button>
				)}
			</Table.Td>
		</Table.Tr>
	);
}

type ExclusionInsertProps = ExclusionAddProps & { onClose: () => void };

function ExclusionInsert({ draft, catalogue, onChange, text, onClose }: ExclusionInsertProps) {
	const [left, setLeft] = React.useState<string | null>(null);
	const [right, setRight] = React.useState<string | null>(null);
	const groups = selectableValueGroups(draft, catalogue, text);
	const leftAttribute = left ? catalogue.values.get(left)?.attributeId : undefined;
	const rightGroups = groups.filter(group => group.attributeId !== leftAttribute);
	const add = () => {
		if (left && right) {
			onChange(addExclusion(draft, left, right));
			setLeft(null);
			setRight(null);
		}
	};
	return (
		<Group gap='xs' align='center'>
			<Select
				searchable w={220} data={groups} value={left}
				placeholder={text.t('product_template_config_exclusionLeft')}
				onChange={next => {
					setLeft(next);
					setRight(null);
				}}
				{...testAttrs(TEST_ID_PREFIX, 'exclusionLeft')}
			/>
			<Text size='sm'>×</Text>
			<Select
				searchable w={220} data={rightGroups} value={right} disabled={!left}
				placeholder={text.t('product_template_config_exclusionRight')}
				onChange={setRight}
				{...testAttrs(TEST_ID_PREFIX, 'exclusionRight')}
			/>
			<EditRowActions
				mode='create'
				busy={!left || !right}
				onConfirm={add}
				onDiscard={onClose}
				confirmTestId={testAttrs(TEST_ID_PREFIX, 'confirmExclusion')}
				discardTestId={testAttrs(TEST_ID_PREFIX, 'discardExclusion')}
			/>
		</Group>
	);
}

/** The selected values of each variant-creating line, grouped under the attribute's name. */
function selectableValueGroups(draft: TemplateConfigDraft, catalogue: AttributeCatalogue, text: SectionText) {
	return draft.lines
		.filter(line => {
			const mode = line.snapshot ?? catalogue.attributes.get(line.attributeId)?.mode;
			return line.attributeId !== '' && mode !== undefined && GENERATING_MODES.has(mode) && line.valueIds.length > 0;
		})
		.map(line => ({
			attributeId: line.attributeId,
			group: attributeLabel(catalogue, line.attributeId, text),
			items: line.valueIds.map(id => {
				const value = catalogue.values.get(id);
				return { value: id, label: value ? valueLabel(value, text) : id };
			}),
		}));
}

/** `Color: Red`, so a pair reads unambiguously even when two attributes share a value name. */
export function qualifiedValueLabel(catalogue: AttributeCatalogue, valueId: string, text: SectionText): string {
	const value = catalogue.values.get(valueId);
	if (!value) {
		return valueId;
	}
	return `${attributeLabel(catalogue, value.attributeId, text)}: ${valueLabel(value, text)}`;
}
