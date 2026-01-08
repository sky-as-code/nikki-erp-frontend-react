import { Button, Group, Modal, MultiSelect, Stack } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface AddUserModalProps {
	opened: boolean;
	onClose: () => void;
	selectOptions: Array<{ value: string; label: string }>;
	selectedIds: string[];
	onSelectedChange: (ids: string[]) => void;
	onSubmit: () => void;
	isAdding: boolean;
}

export function AddUserModal({
	opened,
	onClose,
	selectOptions,
	selectedIds,
	onSelectedChange,
	onSubmit,
	isAdding,
}: AddUserModalProps) {
	const { t } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('nikki.identity.group.actions.addUsers')}
		>
			<Stack gap='md'>
				<MultiSelect
					label={t('nikki.identity.group.actions.selectUsers')}
					placeholder={t('nikki.identity.group.actions.selectUsersPlaceholder')}
					data={selectOptions}
					value={selectedIds}
					onChange={onSelectedChange}
					searchable
					clearable
					maxDropdownHeight={300}
				/>
				<Group justify='flex-end' gap='sm'>
					<Button variant='subtle' onClick={onClose} disabled={isAdding}>
						{t('nikki.identity.group.actions.cancel')}
					</Button>
					<Button onClick={onSubmit} loading={isAdding} disabled={selectedIds.length === 0}>
						{t('nikki.identity.group.actions.add')} ({selectedIds.length})
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
