import { ActionIcon, Button, Checkbox, Group, MultiSelect, MultiSelectProps, Select, Stack, Text, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { DriveFileStatus, DriveFileType, DriveFileVisibility } from '../../types';
import { DriveFileStatusBadge, DriveFileTypeDisplay, DriveFileVisibilityBadge } from '../enum-display';


export type DriveFileSortField = 'name' | 'createdAt';

export type DriveFileSortDirection = 'asc' | 'desc';

export type DriveFileFilterState = {
	statuses: DriveFileStatus[];
	visibilities: DriveFileVisibility[];
	types: DriveFileType[];
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
	applyOnChange?: boolean;
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

	const renderStatusOption: MultiSelectProps['renderOption'] = (option) => {
		return <DriveFileStatusBadge variant='light' e={option.option.value as DriveFileStatus} />;
	};

	return (
		<MultiSelect
			data={statusData}
			value={value.statuses}
			renderOption={renderStatusOption}
			onChange={handleStatusChange}
			placeholder={t('nikki.general.filters.status') ?? ''}
			clearable
			maw={220}
			size='sm'
			color='red'
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
			label: t('nikki.drive.enum.visibility.public'),
		},
		{
			value: DriveFileVisibility.SHARED,
			label: t('nikki.drive.enum.visibility.shared'),
		},
		{
			value: DriveFileVisibility.OWNER,
			label: t('nikki.drive.enum.visibility.owner'),
		},
	];

	const handleVisibilityChange = (next: string[]) => {
		onChange({
			...value,
			visibilities: next as DriveFileVisibility[],
		});
	};

	const renderVisibilityOption: MultiSelectProps['renderOption'] = (option) => {
		return <DriveFileVisibilityBadge variant='light' e={option.option.value as DriveFileVisibility} />;
	};

	return (
		<MultiSelect
			data={visibilityData}
			value={value.visibilities}
			onChange={handleVisibilityChange}
			renderOption={renderVisibilityOption}
			placeholder={t('nikki.drive.fields.visibility') ?? ''}
			clearable
			maw={220}
			size='sm'
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
			types: next as DriveFileType[],
		});
	};

	const typeData = Object.values(DriveFileType).map((type) => ({
		value: type,
		label: type,
	}));

	const renderTypeOption: MultiSelectProps['renderOption'] = (option) => {
		return <DriveFileTypeDisplay e={option.option.value as DriveFileType} />;
	};

	return (
		<MultiSelect
			size='sm'
			data={typeData}
			value={value.types}
			onChange={handleIsFolderChange}
			renderOption={renderTypeOption}
			placeholder={t('nikki.drive.propertiesCard.type') ?? ''}
			clearable
			maw={220}
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
						aria-label={t('nikki.general.sort.toggleDirection')}
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
	applyOnChange = false,
}: DriveFileFilterBarProps): React.ReactNode {
	const { t } = useTranslation();
	const didInitApplyRef = useRef(false);
	const onApplyRef = useRef(onApply);

	useEffect(() => {
		onApplyRef.current = onApply;
	}, [onApply]);

	useEffect(() => {
		if (!applyOnChange) return;
		if (!didInitApplyRef.current) {
			didInitApplyRef.current = true;
			return;
		}
		onApplyRef.current();
	}, [applyOnChange, value]);

	return (
		<Group gap='xl' align='end' w='100%'>
			<DriveFileFilterControls
				value={value}
				onChange={onChange}
				enabledFields={enabledFields}
			/>
			<DriveFileSortControls value={value} onChange={onChange} />
			{!applyOnChange && (
				<Button
					size='sm'
					onClick={onApply}
				>{t('nikki.general.actions.apply')}</Button>
			)}
		</Group>
	);
}

