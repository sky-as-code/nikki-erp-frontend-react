import { Box, Group, Modal, Stack, Tabs, Text } from '@mantine/core';
import React from 'react';

import { FieldPicker } from './FieldPicker';
import { useTranslate } from '../../../i18n';
import { Button } from '../../Button';
import { Select } from '../../Select';
import { useExcelDataTableContext } from '../context';
import classes from '../ExcelDataTable.module.css';
import { allowedPageSizes, parseStoredPageSize, writeStoredPageSize } from '../storage';


import type * as dyn from '@nikkierp/common/dynamicModel';


const pageSizeSelectData = allowedPageSizes.map(n => ({ value: String(n), label: String(n) }));

function TableSettingsPanel(props: { draftPageSize: string, onDraftPageSizeChange: (value: string) => void }) {
	const t = useTranslate('common');
	const { tid } = useExcelDataTableContext();
	return (
		<Stack gap='xs'>
			<Text size='sm' fw={500}>{t('datatable.pageSize')}</Text>
			<Select
				allowDeselect={false}
				data={pageSizeSelectData}
				onChange={value => value && props.onDraftPageSizeChange(value)}
				value={props.draftPageSize}
				{...tid.settingsPageSize()}
			/>
		</Stack>
	);
}

/**
 * The table settings modal: displayed columns and page size, applied together on Apply.
 * The field picker is remounted each time the modal opens so a cancelled edit leaves no trace.
 */
export function SettingsModal({ opened, onClose }: { opened: boolean, onClose: () => void }) {
	const t = useTranslate('common');
	const context = useExcelDataTableContext();
	const { tid, modelSchema, fields: desiredFields, searchRequest, setSearchRequest } = context;
	const [activeTab, setActiveTab] = React.useState<string | null>('fields-settings');
	const [draftPageSize, setDraftPageSize] = React.useState(String(allowedPageSizes[0]));
	const selectionGetterRef = React.useRef<(() => string[]) | null>(null);
	const [nonce, setNonce] = React.useState(0);
	const selectableFields = React.useMemo(
		() => getSelectableFields(modelSchema, desiredFields), [modelSchema, desiredFields],
	);

	React.useEffect(() => {
		if (opened) {
			setNonce(n => n + 1);
			setDraftPageSize(String(parseStoredPageSize(String(searchRequest.size)) ?? allowedPageSizes[0]));
		}
	}, [opened, searchRequest.size]);

	const apply = () => {
		const size = parseStoredPageSize(draftPageSize) ?? allowedPageSizes[0];
		writeStoredPageSize(size);
		const fieldOrder = selectionGetterRef.current?.() ?? [];
		setSearchRequest(prev => ({ ...prev, fields: fieldOrder.length > 0 ? fieldOrder : undefined, page: 0, size }));
		onClose();
	};

	return (
		<Modal
			onClose={onClose}
			opened={opened}
			size='auto'
			classNames={{ body: classes.settingsModalBody }}
			styles={{ title: { fontWeight: 'bold' } }}
			title={t('datatable.viewSettings')}
		>
			<Stack h='100%'>
				<Tabs onChange={setActiveTab} style={{ flex: 1, overflow: 'auto' }} value={activeTab}>
					<Tabs.List>
						<Tabs.Tab value='fields-settings' className='capitalize' {...tid.settingsTab('fields')}>
							{t('datatable.fields')}
						</Tabs.Tab>
						<Tabs.Tab value='table-settings' className='capitalize' {...tid.settingsTab('view')}>
							{t('datatable.view')}
						</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel pt='sm' value='fields-settings'>
						<FieldPicker
							key={nonce}
							initialDisplayedFields={desiredFields}
							selectableFields={selectableFields}
							selectionGetterRef={selectionGetterRef}
							translationNs={context.translationNs ?? 'common'}
						/>
					</Tabs.Panel>
					<Tabs.Panel pt='sm' value='table-settings'>
						<TableSettingsPanel draftPageSize={draftPageSize} onDraftPageSizeChange={setDraftPageSize} />
					</Tabs.Panel>
				</Tabs>
				<Box className='border-t border-gray-300 mt-auto pt-3'>
					<Group justify='flex-end'>
						<Button onClick={onClose} variant='default' {...tid.settingsCancel()}>{t('action.cancel')}</Button>
						<Button onClick={apply} {...tid.settingsApply()}>{t('action.apply')}</Button>
					</Group>
				</Box>
			</Stack>
		</Modal>
	);
}

/**
 * The columns a user may choose from: the schema's own readable fields plus the displayed
 * edge columns, which are not fields of this schema and would otherwise vanish from the picker.
 * Keys, foreign keys, edge models and opaque ids are excluded; computed fields are kept.
 */
export function getSelectableFields(schema: dyn.ModelSchema | undefined, desiredFields: string[]): string[] {
	if (!schema) {
		return [...desiredFields];
	}
	const own = Object.values(schema.fields)
		.filter(field => !field.is_system_field && !field.is_edge_model && !field.is_foreign_key)
		.filter(field => !isOpaqueIdField(schema, field))
		.map(field => field.name);
	const related = desiredFields.filter(field => field.includes('.'));
	return Array.from(new Set([...own, ...related]));
}

/** An id with nothing readable in it; the record label is the one id worth showing. */
function isOpaqueIdField(schema: dyn.ModelSchema, field: dyn.ModelSchemaField): boolean {
	const typeName = typeof field.data_type === 'string' ? field.data_type : field.data_type?.name;
	return typeName === 'ulid' && field.name !== schema.record_label_field;
}
