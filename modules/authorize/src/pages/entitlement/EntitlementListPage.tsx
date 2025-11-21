import {
	ActionIcon,
	Badge,
	Breadcrumbs,
	Button,
	Group,
	Paper,
	Stack,
	Table,
	Text,
	TextInput,
	Title,
	Tooltip,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import {
	IconEdit,
	IconEye,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { Entitlement } from '../../features/entitlements';
import { fakeActions, fakeEntitlements, fakeResources } from '../../mock/fakeData';


function EntitlementListPageBody(): React.ReactNode {
	const [entitlements] = React.useState<Entitlement[]>(fakeEntitlements);
	const [search, setSearch] = React.useState('');

	const filteredEntitlements = entitlements.filter(
		(e) =>
			e.name.toLowerCase().includes(search.toLowerCase()) ||
			e.description?.toLowerCase().includes(search.toLowerCase()),
	);

	const getActionName = (actionId: string) => {
		const action = fakeActions.find((a) => a.id === actionId);
		return action?.name || actionId;
	};

	const getResourceName = (resourceId: string) => {
		const resource = fakeResources.find((r) => r.id === resourceId);
		return resource?.name || resourceId;
	};

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<TextInput
					placeholder='Search entitlements...'
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					w={400}
				/>
				<Group>
					<Button
						size='sm'
						variant='outline'
						leftSection={<IconRefresh size={16} />}
					>
						Refresh
					</Button>
					<Button
						size='sm'
						leftSection={<IconPlus size={16} />}
					>
						Create Entitlement
					</Button>
				</Group>
			</Group>

			<Paper withBorder>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Name</Table.Th>
							<Table.Th>Action</Table.Th>
							<Table.Th>Resource</Table.Th>
							<Table.Th>Description</Table.Th>
							<Table.Th>Assignments</Table.Th>
							<Table.Th>Roles</Table.Th>
							<Table.Th></Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredEntitlements.map((entitlement) => (
							<Table.Tr key={entitlement.id}>
								<Table.Td>
									<Link
										to={entitlement.id}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<Text fw={500} size='sm'>{entitlement.name}</Text>
									</Link>
								</Table.Td>
								<Table.Td>
									<Badge color='blue' variant='light' size='sm'>
										{getActionName(entitlement.actionId)}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed'>
										{getResourceName(entitlement.resourceId)}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{entitlement.description || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{entitlement.assignmentsCount || 0}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{entitlement.rolesCount || 0}</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs' justify='flex-end'>
										<Tooltip label='View'>
											<ActionIcon variant='subtle' color='gray' component={Link} to={entitlement.id}>
												<IconEye size={16} />
											</ActionIcon>
										</Tooltip>
										<Tooltip label='Edit'>
											<ActionIcon variant='subtle' color='gray'>
												<IconEdit size={16} />
											</ActionIcon>
										</Tooltip>
										<Tooltip label='Delete'>
											<ActionIcon variant='subtle' color='red'>
												<IconTrash size={16} />
											</ActionIcon>
										</Tooltip>
									</Group>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>

				{filteredEntitlements.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No entitlements found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const EntitlementListPage: React.FC = withWindowTitle('Entitlements - Nikki ERP', EntitlementListPageBody);
