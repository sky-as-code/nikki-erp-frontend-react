import { Badge, Button, Group, Title } from '@mantine/core';
import { IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface ListUserHeaderProps {
	userCount: number;
	selectedCount: number;
	onRemove: () => void;
	onAdd: () => void;
	isLoading: boolean;
	isRemoving: boolean;
	hasAvailable: boolean;
	title?: string;
}

export function ListUserHeader({
	userCount,
	selectedCount,
	onRemove,
	onAdd,
	isLoading,
	isRemoving,
	hasAvailable,
	title,
}: ListUserHeaderProps) {
	const { t } = useTranslation();

	return (
		<Group justify='space-between'>
			<Group gap='xs'>
				<IconUser size={20} />
				<Title order={4}>
					{title || t('nikki.identity.group.fields.users')} ({userCount})
				</Title>
				{selectedCount > 0 && (
					<Badge color='blue' variant='filled'>
						{selectedCount} selected
					</Badge>
				)}
			</Group>
			<Group gap='sm'>
				{selectedCount > 0 && (
					<Button
						leftSection={<IconTrash size={16} />}
						size='sm'
						color='red'
						variant='light'
						onClick={onRemove}
						loading={isRemoving}
						disabled={isLoading}
					>
						{t('nikki.identity.group.actions.removeSelected')} ({selectedCount})
					</Button>
				)}
				<Button
					leftSection={<IconPlus size={16} />}
					size='sm'
					onClick={onAdd}
					disabled={isLoading || !hasAvailable}
				>
					{t('nikki.identity.group.actions.addUsers')}
				</Button>
			</Group>
		</Group>
	);
}
