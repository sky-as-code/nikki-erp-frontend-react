import { Button, Group, Modal, MultiSelect, Select, Stack } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface AddUserModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectedChange: (ids: string[]) => void;
	onSubmit: () => void;
	onOrgChange?: (orgId: string | null) => void;
	selectOptions: Array<{ value: string; label: string }>;
	selectedIds: string[];
	selectedOrgId?: string | null;
	isAdding: boolean;
	submitLabel?: string;
	showOrgSelector?: boolean;
	organizationOptions?: Array<{ value: string; label: string }>;
}

export function AddUserModal({
	opened,
	onClose,
	onSelectedChange,
	onSubmit,
	onOrgChange,
	selectOptions,
	selectedIds,
	selectedOrgId = null,
	isAdding,
	submitLabel,
	showOrgSelector = false,
	organizationOptions = [],
}: AddUserModalProps) {
	const { t } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('nikki.identity.group.actions.addUsers')}
		>
			<Stack gap='md'>
				{showOrgSelector && (
					<Select
						label={t('nikki.identity.user.actions.selectOrganization')}
						placeholder={t('nikki.identity.user.selectOrganizationPlaceholder')}
						data={organizationOptions}
						value={selectedOrgId}
						onChange={onOrgChange}
						searchable
						clearable
						required
					/>
				)}
				<MultiSelect
					label={t('nikki.identity.group.actions.selectUsers')}
					placeholder={t('nikki.identity.group.actions.selectUsersPlaceholder')}
					data={selectOptions}
					value={selectedIds}
					onChange={onSelectedChange}
					searchable
					clearable
					maxDropdownHeight={300}
					disabled={showOrgSelector && !selectedOrgId}
				/>
				<Group justify='flex-end' gap='sm'>
					<Button variant='subtle' onClick={onClose} disabled={isAdding}>
						{t('nikki.identity.group.actions.cancel')}
					</Button>
					<Button
						onClick={onSubmit}
						loading={isAdding}
						disabled={selectedIds.length === 0 || (showOrgSelector && !selectedOrgId)}
					>
						{submitLabel || t('nikki.identity.group.actions.add')} ({selectedIds.length})
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
