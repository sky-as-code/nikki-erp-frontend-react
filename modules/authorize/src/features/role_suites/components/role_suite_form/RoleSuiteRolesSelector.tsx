import { ActionIcon, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/features/roles';


interface RoleSuiteRolesSelectorProps {
	availableRoles: Role[];
	selectedRoleIds: string[];
	onAdd: (roleId: string) => void;
	onRemove: (roleId: string) => void;
	availableTitle?: string;
	selectedTitle?: string;
	emptyAvailableText?: string;
	emptySelectedText?: string;
}

function RoleCard({ role }: { role: Role }) {
	return (
		<Box style={{ flex: 1 }}>
			<Text fw={600}>{role.name}</Text>
			{role.description && <Text size='sm' c='dimmed'>{role.description}</Text>}
			{role.orgId && <Text size='xs' c='dimmed'>org: {role.orgId}</Text>}
		</Box>
	);
}

function AvailableRolesList({
	roles,
	onAdd,
	title,
	emptyText,
	translate,
}: {
	roles: Role[];
	onAdd: (roleId: string) => void;
	title?: string;
	emptyText?: string;
	translate: (key: string) => string;
}) {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role_suite.roles.available')} ({roles.length})
			</Title>
			<ScrollArea h={400}>
				<Stack gap='sm'>
					{roles.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{emptyText || translate('nikki.authorize.role_suite.roles.no_available')}
						</Text>
					) : (
						roles.map((role) => (
							<Group key={role.id} gap='xs' align='flex-start'>
								<RoleCard role={role} />
								<ActionIcon
									variant='light'
									color='blue'
									onClick={() => onAdd(role.id)}
									mt='xs'
								>
									<IconArrowRight size={16} />
								</ActionIcon>
							</Group>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

function SelectedRolesList({
	roles,
	onRemove,
	title,
	emptyText,
	translate,
}: {
	roles: Role[];
	onRemove: (roleId: string) => void;
	title?: string;
	emptyText?: string;
	translate: (key: string) => string;
}) {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role_suite.roles.selected')} ({roles.length})
			</Title>
			<ScrollArea h={400}>
				<Stack gap='sm'>
					{roles.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{emptyText || translate('nikki.authorize.role_suite.roles.no_selected')}
						</Text>
					) : (
						roles.map((role) => (
							<Group key={role.id} gap='xs' align='flex-start'>
								<ActionIcon
									variant='light'
									color='red'
									onClick={() => onRemove(role.id)}
									mt='xs'
								>
									<IconArrowLeft size={16} />
								</ActionIcon>
								<RoleCard role={role} />
							</Group>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

export const RoleSuiteRolesSelector: React.FC<RoleSuiteRolesSelectorProps> = ({
	availableRoles,
	selectedRoleIds,
	onAdd,
	onRemove,
	availableTitle,
	selectedTitle,
	emptyAvailableText,
	emptySelectedText,
}) => {
	const { t: translate } = useTranslation();
	const selectedSet = React.useMemo(() => new Set(selectedRoleIds), [selectedRoleIds]);

	const filteredAvailable = React.useMemo(
		() => availableRoles.filter((r) => !selectedSet.has(r.id)),
		[availableRoles, selectedSet],
	);

	const selectedRoles = React.useMemo(
		() => availableRoles.filter((r) => selectedSet.has(r.id)),
		[availableRoles, selectedSet],
	);

	return (
		<Group align='flex-start' gap='lg' style={{ width: '100%' }}>
			<AvailableRolesList
				roles={filteredAvailable}
				onAdd={onAdd}
				title={availableTitle}
				emptyText={emptyAvailableText}
				translate={translate}
			/>
			<SelectedRolesList
				roles={selectedRoles}
				onRemove={onRemove}
				title={selectedTitle}
				emptyText={emptySelectedText}
				translate={translate}
			/>
		</Group>
	);
};


