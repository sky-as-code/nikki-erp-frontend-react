import { Avatar, Badge, Box, Collapse, Drawer, Group, Paper, ScrollArea, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconUsers } from '@tabler/icons-react';
import React from 'react';

import { User } from '../../../user/types';
import { HierarchyLevel } from '../../types';


interface HierarchyNode extends HierarchyLevel {
	children?: HierarchyNode[];
	users?: User[];
}

interface HierarchyOrgChartProps {
	hierarchies: HierarchyLevel[];
	usersByHierarchy?: User[];
}

interface OrgNodeProps {
	node: HierarchyNode;
	level: number;
}

function buildHierarchyTree(
	hierarchies: HierarchyLevel[],
	usersByHierarchy?: User[],
): HierarchyNode[] {
	const nodeMap = new Map<string, HierarchyNode>();
	const rootNodes: HierarchyNode[] = [];

	// Group users by hierarchyId (support both hierarchyId and hierarchy.id)
	const groupedUsers = usersByHierarchy?.reduce<Record<string, User[]>>((acc, user) => {
		const hierarchyId = user.hierarchy?.id || user.hierarchy?.id;
		if (hierarchyId) {
			(acc[hierarchyId] ??= []).push(user);
		}
		return acc;
	}, {}) || {};

	// Create map of all nodes with users
	hierarchies.forEach(item => {
		nodeMap.set(item.id, {
			...item,
			children: [],
			users: groupedUsers[item.id] || [],
		});
	});

	// Build tree structure
	hierarchies.forEach(item => {
		const node = nodeMap.get(item.id)!;

		if (item.parent?.id) {
			// Has parent - add to parent's children
			const parentNode = nodeMap.get(item.parent.id);
			if (parentNode) {
				if (!parentNode.children) {
					parentNode.children = [];
				}
				parentNode.children.push(node);
			}
			else {
				// Parent not in list - treat as root
				rootNodes.push(node);
			}
		}
		else {
			// No parent - this is a root node
			rootNodes.push(node);
		}
	});

	return rootNodes;
}

function UserCard({ user }: { user: User }): React.ReactElement {
	return (
		<Paper p='sm' withBorder>
			<Group gap='sm' wrap='nowrap'>
				<Avatar
					src={user.avatarUrl}
					size='md'
					radius='xl'
					alt={user.displayName || user.email}
				/>
				<Box style={{ flex: 1, minWidth: 0 }}>
					<Text size='sm' fw={500} lineClamp={1}>
						{user.displayName || user.email}
					</Text>
					{user.displayName && (
						<Text size='xs' c='dimmed' lineClamp={1}>
							{user.email}
						</Text>
					)}
				</Box>
				{user.status && (
					<Badge size='sm' variant='light'>
						{user.status}
					</Badge>
				)}
			</Group>
		</Paper>
	);
}

// eslint-disable-next-line max-lines-per-function
function OrgNode({ node, level }: OrgNodeProps): React.ReactElement {
	const [expanded, setExpanded] = React.useState(level === 0);
	const [drawerOpened, setDrawerOpened] = React.useState(false);
	const hasChildren = node.children && node.children.length > 0;
	const hasUsers = node.users && node.users.length > 0;

	return (
		<>
			<Stack gap='sm' style={{ width: '100%' }}>
				<Paper
					shadow='sm'
					withBorder
					style={{ transition: 'all 0.2s' }}
				>
					{/* Hierarchy Level Header */}
					<UnstyledButton
						onClick={() => setExpanded(!expanded)}
						style={{ width: '100%', padding: '12px' }}
					>
						<Group gap='sm' wrap='nowrap'>
							{hasChildren && (
								expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />
							)}
							<Text fw={600} size='sm' style={{ flex: 1 }}>
								{node.name}
							</Text>
							{hasUsers && (
								<Badge
									size='sm'
									variant='light'
									leftSection={<IconUsers size={14} />}
									onClick={(e) => {
										e.stopPropagation();
										setDrawerOpened(true);
									}}
									style={{ cursor: 'pointer' }}
								>
									{node.users!.length}
								</Badge>
							)}
						</Group>
					</UnstyledButton>
				</Paper>

				{/* Children Hierarchy Levels */}
				{hasChildren && (
					<Collapse in={expanded}>
						<Box pl='md' style={{ borderLeft: '2px solid #e9ecef' }}>
							<Stack gap='sm'>
								{node.children?.map((child) => (
									<OrgNode key={child.id} node={child} level={level + 1} />
								))}
							</Stack>
						</Box>
					</Collapse>
				)}
			</Stack>

			{/* Users Drawer */}
			<Drawer
				opened={drawerOpened}
				onClose={() => setDrawerOpened(false)}
				title={
					<Group gap='xs'>
						<IconUsers size={20} />
						<Title order={4}>{node.name}</Title>
					</Group>
				}
				position='right'
				size='md'
				overlayProps={{ opacity: 0.5, blur: 4 }}
			>
				<Stack gap='md'>
					<Group gap='xs'>
						<Text size='sm' c='dimmed'>
							Tổng số nhân viên:
						</Text>
						<Badge size='lg' variant='light'>
							{node.users?.length || 0}
						</Badge>
					</Group>

					<ScrollArea style={{ height: 'calc(100vh - 150px)' }}>
						<Stack gap='sm'>
							{node.users?.map((user) => (
								<UserCard key={user.id} user={user} />
							))}
							{(!node.users || node.users.length === 0) && (
								<Text size='sm' c='dimmed' ta='center' py='xl'>
									Không có nhân viên nào
								</Text>
							)}
						</Stack>
					</ScrollArea>
				</Stack>
			</Drawer>
		</>
	);
}


export const HierarchyOrgChart: React.FC<HierarchyOrgChartProps> = ({
	hierarchies,
	usersByHierarchy,
}) => {
	const treeData = React.useMemo(() => {
		return buildHierarchyTree(hierarchies, usersByHierarchy);
	}, [hierarchies, usersByHierarchy]);

	if (hierarchies.length === 0) {
		return (
			<Paper p='xl'>
				<Stack align='center' gap='md'>
					<IconUsers size={100} style={{ opacity: 0.3 }} />
					<Text c='dimmed' ta='center'>
						No hierarchy data to display
					</Text>
				</Stack>
			</Paper>
		);
	}

	return (
		<Box p='md'>
			<Stack gap='md'>
				{treeData.map((rootNode) => (
					<OrgNode key={rootNode.id} node={rootNode} level={0} />
				))}
			</Stack>
		</Box>
	);
};
