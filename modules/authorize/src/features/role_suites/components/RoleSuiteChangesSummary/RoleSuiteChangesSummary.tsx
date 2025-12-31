import { Badge, Box, Card, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCircleMinus, IconCirclePlus, IconEqual } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useRoleChanges } from './hooks';

import type { Role } from '@/features/roles';


interface RoleSuiteChangesSummaryProps {
	originalRoleIds: string[];
	selectedRoleIds: string[];
	allRoles: Role[];
}

interface ChangeCategory {
	type: 'added' | 'removed' | 'unchanged';
	roles: Role[];
	icon: React.ReactNode;
	color: string;
	title: string;
}

const CategorySection: React.FC<{ category: ChangeCategory }> = ({ category }) => {
	if (category.roles.length === 0) return null;

	return (
		<Box>
			<Group gap='xs' mb='xs'>
				<ThemeIcon size='sm' color={category.color} variant='light'>{category.icon}</ThemeIcon>
				<Text fw={500} size='sm'>{category.title} ({category.roles.length})</Text>
			</Group>
			<Group gap='xs'>
				{category.roles.map((role) => (
					<Badge key={role.id} color={category.color} variant='light' size='md'>{role.name}</Badge>
				))}
			</Group>
		</Box>
	);
};

export const RoleSuiteChangesSummary: React.FC<RoleSuiteChangesSummaryProps> = ({
	originalRoleIds, selectedRoleIds, allRoles,
}) => {
	const { t: translate } = useTranslation();
	const changes = useRoleChanges(originalRoleIds, selectedRoleIds, allRoles);

	const categories: ChangeCategory[] = [
		{ type: 'added', roles: changes.added, icon: <IconCirclePlus size={16} />, color: 'green',
			title: translate('nikki.authorize.role_suite.changes.roles_to_add') },
		{ type: 'removed', roles: changes.removed, icon: <IconCircleMinus size={16} />, color: 'red',
			title: translate('nikki.authorize.role_suite.changes.roles_to_remove') },
		{ type: 'unchanged', roles: changes.unchanged, icon: <IconEqual size={16} />, color: 'gray',
			title: translate('nikki.authorize.role_suite.changes.roles_unchanged') },
	];

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder>
			<Title order={5} mb='md'>{translate('nikki.authorize.role_suite.changes.summary_title')}</Title>
			<Stack gap='md'>
				{categories.map((cat) => <CategorySection key={cat.type} category={cat} />)}
			</Stack>
		</Card>
	);
};

