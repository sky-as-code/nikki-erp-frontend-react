import { ActionIcon, Button, Checkbox, Group, MultiSelect, Select, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileStatus, DriveFileVisibility } from '../../types';


export type DriveFileSortField = 'name' | 'createdAt';

export type DriveFileSortDirection = 'asc' | 'desc';

export type DriveFileFilterState = {
	statuses: DriveFileStatus[];
	visibilities: DriveFileVisibility[];
	/** ['folder'], ['file'], ['folder','file'] hoặc [] (tất cả) */
	isFolderValues: string[];
	sortField: DriveFileSortField;
	sortDirection: DriveFileSortDirection;
	folderFirst: boolean;
};

export type DriveFileFilterField = 'status' | 'visibility' | 'type';

export type DriveFileFilterBarProps = {
	value: DriveFileFilterState;
	onChange: (next: DriveFileFilterState) => void;
	onApply: () => void;
	enabledFields?: DriveFileFilterField[];
};

type DriveFileFilterControlsProps = {
	value: DriveFileFilterState;
	onChange: (next: DriveFileFilterState) => void;
	enabledFields?: DriveFileFilterField[];
};

function DriveFileFilterStatus({ value, onChange }: DriveFileFilterControlsProps): React.ReactNode {
	const { t } = useTranslation();
	const statusData = [
		{
			value: DriveFileStatus.ACTIVE,
			label: t('nikki.drive.fields.statusActive'),
		},
		{
			value: DriveFileStatus.IN_TRASH,
			label: t('nikki.drive.fields.statusInTrash'),
		},
		{
			value: DriveFileStatus.PARENT_IN_TRASH,
			label: t('nikki.drive.fields.statusParentInTrash'),
		},
	];

	const handleStatusChange = (next: string[]) => {
		onChange({
			...value,
			statuses: next as DriveFileStatus[],
		});
	};

	return (
		<MultiSelect
			data={statusData}
			value={value.statuses}
			onChange={handleStatusChange}
			placeholder={t('nikki.general.filters.status') ?? ''}
			clearable
			maw={220}
			size='sm'
			styles={{
				pillsList: {
					maxWidth: 220,
					overflowX: 'auto',
					flexWrap: 'nowrap',
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
			}}
		/>
	);
}

function DriveFileFilterVisibility({
	value,
	onChange,
}: DriveFileFilterControlsProps): React.ReactNode {
	const { t } = useTranslation();

	const visibilityData = [
		{
			value: DriveFileVisibility.PUBLIC,
			label: t('nikki.drive.propertiesCard.visibilityPublic'),
		},
		{
			value: DriveFileVisibility.OWNER,
			label: t('nikki.drive.propertiesCard.visibilityOwner'),
		},
		{
			value: DriveFileVisibility.SHARED,
			label: t('nikki.drive.propertiesCard.visibilityPrivate'),
		},
	];

	const handleVisibilityChange = (next: string[]) => {
		onChange({
			...value,
			visibilities: next as DriveFileVisibility[],
		});
	};

	return (
		<MultiSelect
			data={visibilityData}
			value={value.visibilities}
			onChange={handleVisibilityChange}
			placeholder={t('nikki.drive.fields.visibility') ?? ''}
			clearable
			maw={220}
			size='sm'
			styles={{
				pillsList: {
					maxWidth: 220,
					overflowX: 'auto',
					flexWrap: 'nowrap',
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
			}}
		/>
	);
}

function DriveFileFilterType({
	value,
	onChange,
}: DriveFileFilterControlsProps): React.ReactNode {
	const { t } = useTranslation();

	const handleIsFolderChange = (next: string[]) => {
		onChange({
			...value,
			isFolderValues: next,
		});
	};

	return (
		<MultiSelect
			size='sm'
			data={[
				{ value: 'folder', label: t('nikki.drive.propertiesCard.folder') },
				{ value: 'file', label: t('nikki.drive.propertiesCard.file') },
			]}
			value={value.isFolderValues}
			onChange={handleIsFolderChange}
			placeholder={t('nikki.drive.fields.isFolder') ?? ''}
			clearable
			maw={220}
			styles={{
				pillsList: {
					maxWidth: 220,
					overflowX: 'auto',
					flexWrap: 'nowrap',
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
			}}
		/>
	);
}

function DriveFileFilterControls({
	value,
	onChange,
	enabledFields = ['status', 'visibility', 'type'],
}: DriveFileFilterControlsProps): React.ReactNode {
	const { t } = useTranslation();

	return (
		<Stack gap={4}>
			<Text size='sm' fw={600}>
				{t('nikki.general.filter.title')}
			</Text>
			<Group gap='md' align='center'>
				{enabledFields.includes('status') && (
					<DriveFileFilterStatus value={value} onChange={onChange} />
				)}
				{enabledFields.includes('visibility') && (
					<DriveFileFilterVisibility value={value} onChange={onChange} />
				)}
				{enabledFields.includes('type') && (
					<DriveFileFilterType value={value} onChange={onChange} />
				)}
			</Group>
		</Stack>
	);
}

function DriveFileSortControls({ value, onChange }: DriveFileFilterControlsProps): React.ReactNode {
	const { t } = useTranslation();

	const handleSortFieldChange = (next: string | null) => {
		onChange({
			...value,
			sortField: (next ?? 'name') as DriveFileSortField,
		});
	};

	const toggleSortDirection = () => {
		onChange({
			...value,
			sortDirection: value.sortDirection === 'asc' ? 'desc' : 'asc',
		});
	};

	return (
		<Stack gap={4}>
			<Text size='sm' c='dimmed' fw={600}>
				{t('nikki.general.sort.title')}
			</Text>
			<Group gap='xs' align='center'>
				<Select
					size='sm'
					value={value.sortField}
					onChange={handleSortFieldChange}
					data={[
						{ value: 'name', label: t('nikki.drive.fields.name') },
						{ value: 'createdAt', label: t('nikki.drive.fields.createdAt') },
					]}
					maw={180}
				/>
				<Tooltip
					label={value.sortDirection === 'asc'
						? t('nikki.general.sort.asc')
						: t('nikki.general.sort.desc')}
					openDelay={200}
				>
					<ActionIcon
						size='md'
						variant='subtle'
						aria-label='Toggle sort direction'
						onClick={toggleSortDirection}
					>
						{value.sortDirection === 'asc'
							? <IconArrowUp size={14} />
							: <IconArrowDown size={14} />}
					</ActionIcon>
				</Tooltip>
				<Checkbox
					size='sm'
					checked={value.folderFirst}
					onChange={(e) => onChange({
						...value,
						folderFirst: e.currentTarget.checked,
					})}
					label={t('nikki.drive.sort.folderFirst')}
				/>
			</Group>
		</Stack>
	);
}

export function DriveFileFilterBar({
	value,
	onChange,
	onApply,
	enabledFields,
}: DriveFileFilterBarProps): React.ReactNode {
	const { t } = useTranslation();

	return (
		<Group gap='xl' align='end' w='100%'>
			<DriveFileFilterControls
				value={value}
				onChange={onChange}
				enabledFields={enabledFields}
			/>
			<DriveFileSortControls value={value} onChange={onChange} />
			<Button
				size='sm'
				onClick={onApply}
			>{t('nikki.general.actions.apply')}</Button>
		</Group>
	);
}

