import {
	ActionIcon,
	Badge,
	Box,
	Card,
	Group,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconSearch } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/features/roles';


interface RolesSelectorProps {
	availableRoles: Role[];
	selectedRoleIds: string[];
	onAdd: (roleId: string) => void;
	onRemove: (roleId: string) => void;
	/** Original role IDs when editing (for visual indicators) */
	originalRoleIds?: string[];
	availableTitle?: string;
	selectedTitle?: string;
	emptyAvailableText?: string;
	emptySelectedText?: string;
}

interface RoleCardProps {
	role: Role;
	isNew?: boolean;
	translate: (key: string) => string;
}

function RoleCard({ role, isNew, translate }: RoleCardProps) {
	return (
		<Card shadow='xs' padding='sm' radius='md' withBorder style={{ flex: 1 }}>
			<Group justify='space-between' wrap='nowrap'>
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Group gap='xs' wrap='nowrap'>
						<Text fw={600} truncate>
							{role.name}
						</Text>
						{isNew && (
							<Badge size='xs' color='green' variant='filled'>
								{translate('nikki.authorize.role_suite.roles.new_badge')}
							</Badge>
						)}
					</Group>
					{role.description && (
						<Text size='sm' c='dimmed' lineClamp={2}>
							{role.description}
						</Text>
					)}
					{role.orgId && (
						<Text size='xs' c='dimmed'>
							{translate('nikki.authorize.role_suite.roles.org_label')}: {role.orgId}
						</Text>
					)}
					{!role.orgId && (
						<Badge size='xs' color='blue' variant='light'>
							{translate('nikki.authorize.role_suite.roles.domain_level')}
						</Badge>
					)}
				</Box>
			</Group>
		</Card>
	);
}

interface RoleItemProps {
	role: Role;
	onAction: () => void;
	actionIcon: React.ReactNode;
	actionColor: string;
	isNew?: boolean;
	translate: (key: string) => string;
	actionPosition: 'left' | 'right';
}

function RoleItem({
	role,
	onAction,
	actionIcon,
	actionColor,
	isNew,
	translate,
	actionPosition,
}: RoleItemProps) {
	return (
		<Group gap='xs' align='flex-start' wrap='nowrap'>
			{actionPosition === 'left' && (
				<ActionIcon
					variant='light'
					color={actionColor}
					onClick={onAction}
					mt='xs'
					size='lg'
				>
					{actionIcon}
				</ActionIcon>
			)}
			<RoleCard role={role} isNew={isNew} translate={translate} />
			{actionPosition === 'right' && (
				<ActionIcon
					variant='light'
					color={actionColor}
					onClick={onAction}
					mt='xs'
					size='lg'
				>
					{actionIcon}
				</ActionIcon>
			)}
		</Group>
	);
}

interface AvailableRolesListProps {
	roles: Role[];
	onAdd: (roleId: string) => void;
	title?: string;
	emptyText?: string;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	translate: (key: string) => string;
}

function AvailableRolesList({
	roles,
	onAdd,
	title,
	emptyText,
	searchQuery,
	onSearchChange,
	translate,
}: AvailableRolesListProps) {
	const filteredRoles = React.useMemo(() => {
		if (!searchQuery.trim()) return roles;
		const query = searchQuery.toLowerCase();
		return roles.filter(
			(r) =>
				r.name.toLowerCase().includes(query)
				|| r.description?.toLowerCase().includes(query),
		);
	}, [roles, searchQuery]);

	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role_suite.roles.available')} ({roles.length})
			</Title>
			<TextInput
				placeholder={translate('nikki.authorize.role_suite.roles.search_placeholder')}
				leftSection={<IconSearch size={16} />}
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				mb='md'
			/>
			<ScrollArea h={400}>
				<Stack gap='sm'>
					{filteredRoles.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{searchQuery
								? translate('nikki.authorize.role_suite.roles.no_search_results')
								: emptyText || translate('nikki.authorize.role_suite.roles.no_available')}
						</Text>
					) : (
						filteredRoles.map((role) => (
							<RoleItem
								key={role.id}
								role={role}
								onAction={() => onAdd(role.id)}
								actionIcon={<IconArrowRight size={18} />}
								actionColor='blue'
								translate={translate}
								actionPosition='right'
							/>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

interface SelectedRolesListProps {
	roles: Role[];
	onRemove: (roleId: string) => void;
	originalRoleIds: Set<string>;
	title?: string;
	emptyText?: string;
	translate: (key: string) => string;
}

function SelectedRolesList({
	roles,
	onRemove,
	originalRoleIds,
	title,
	emptyText,
	translate,
}: SelectedRolesListProps) {
	return (
		<Box style={{ flex: 1 }}>
			<Title order={5} mb='md'>
				{title || translate('nikki.authorize.role_suite.roles.selected')} ({roles.length})
			</Title>
			<ScrollArea h={448}>
				<Stack gap='sm'>
					{roles.length === 0 ? (
						<Text c='dimmed' size='sm' ta='center' py='xl'>
							{emptyText || translate('nikki.authorize.role_suite.roles.no_selected')}
						</Text>
					) : (
						roles.map((role) => (
							<RoleItem
								key={role.id}
								role={role}
								onAction={() => onRemove(role.id)}
								actionIcon={<IconArrowLeft size={18} />}
								actionColor='red'
								isNew={!originalRoleIds.has(role.id)}
								translate={translate}
								actionPosition='left'
							/>
						))
					)}
				</Stack>
			</ScrollArea>
		</Box>
	);
}

export const RolesSelector: React.FC<RolesSelectorProps> = ({
	availableRoles,
	selectedRoleIds,
	onAdd,
	onRemove,
	originalRoleIds = [],
	availableTitle,
	selectedTitle,
	emptyAvailableText,
	emptySelectedText,
}) => {
	const { t: translate } = useTranslation();
	const [searchQuery, setSearchQuery] = React.useState('');

	const selectedSet = React.useMemo(() => new Set(selectedRoleIds), [selectedRoleIds]);
	const originalSet = React.useMemo(() => new Set(originalRoleIds), [originalRoleIds]);

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
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				translate={translate}
			/>
			<SelectedRolesList
				roles={selectedRoles}
				onRemove={onRemove}
				originalRoleIds={originalSet}
				title={selectedTitle}
				emptyText={emptySelectedText}
				translate={translate}
			/>
		</Group>
	);
};

