import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface ListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	statusFilter?: string | 'all';
	onStatusFilterChange?: (status: string | 'all') => void;
	statusOptions?: Array<{ value: string; label: string }>;
	searchPlaceholder?: string;
	filterPlaceholder?: string;
}

export const ListActions: React.FC<ListActionsProps> = ({
	onCreate,
	onRefresh,
	searchValue,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	statusOptions,
	searchPlaceholder,
	filterPlaceholder,
}) => {
	const { t: translate } = useTranslation();

	const hasActiveFilters = (statusFilter !== undefined && statusFilter !== 'all') || searchValue.trim() !== '';

	const handleClearFilters = () => {
		onSearchChange('');
		if (onStatusFilterChange) {
			onStatusFilterChange('all');
		}
	};

	return (
		<Group justify='space-between' align='center' wrap='wrap'>
			<Group gap='md' wrap='wrap'>
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={onCreate}
				>
					{translate('nikki.general.actions.create')}
				</Button>
				<Button
					variant='outline'
					leftSection={<IconRefresh size={16} />}
					onClick={onRefresh}
				>
					{translate('nikki.general.actions.refresh')}
				</Button>
			</Group>

			<Group gap='md' wrap='wrap' align='flex-end'>
				{hasActiveFilters && (
					<Button
						variant='light'
						color='gray'
						leftSection={<IconX size={16} />}
						onClick={handleClearFilters}
					>
						{translate('nikki.general.actions.clear_filters')}
					</Button>
				)}
				<Stack gap={4}>
					<Text size='xs' fw={400} c='dimmed'>
						{searchPlaceholder || translate('nikki.general.search.placeholder')}
					</Text>
					<TextInput
						placeholder={searchPlaceholder || translate('nikki.general.search.placeholder')}
						leftSection={<IconSearch size={16} />}
						value={searchValue}
						onChange={(e) => onSearchChange(e.currentTarget.value)}
						style={{ minWidth: 250 }}
					/>
				</Stack>
				{statusFilter !== undefined && onStatusFilterChange && statusOptions && (
					<Stack gap={4}>
						<Text size='xs' fw={400} c='dimmed'>
							{filterPlaceholder || translate('nikki.general.filters.status')}
						</Text>
						<Select
							placeholder={filterPlaceholder || translate('nikki.general.filters.status')}
							data={statusOptions}
							value={statusFilter}
							onChange={(value) => onStatusFilterChange((value || 'all') as string | 'all')}
							style={{ minWidth: 150 }}
							clearable={false}
						/>
					</Stack>
				)}
			</Group>
		</Group>
	);
};

