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
	IconCheck,
	IconEdit,
	IconEye,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { Role } from '../../features/roles';
import { fakeRoles } from '../../mock/fakeData';


function RoleListPageBody(): React.ReactNode {
	const [roles] = React.useState<Role[]>(fakeRoles);
	const [search, setSearch] = React.useState('');

	const filteredRoles = roles.filter(
		(r) =>
			r.name.toLowerCase().includes(search.toLowerCase()) ||
			r.description?.toLowerCase().includes(search.toLowerCase()) ||
			r.ownerName?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<TextInput
					placeholder='Search roles...'
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
						Create Role
					</Button>
				</Group>
			</Group>

			<Paper withBorder>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Role Name</Table.Th>
							<Table.Th>Owner</Table.Th>
							<Table.Th>Description</Table.Th>
							<Table.Th>Requestable</Table.Th>
							<Table.Th>Entitlements</Table.Th>
							<Table.Th>Assignments</Table.Th>
							<Table.Th></Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredRoles.map((role) => (
							<Table.Tr key={role.id}>
								<Table.Td>
									<Link
										to={role.id}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<Text fw={500}>{role.name}</Text>
									</Link>
								</Table.Td>
								<Table.Td>
									<Group gap={4}>
										<Badge color='grape' variant='light' size='sm'>
											{role.ownerType}
										</Badge>
										<Text size='sm' c='dimmed'>{role.ownerName}</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{role.description || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									{role.isRequestable ? (
										<Badge color='green' variant='light' leftSection={<IconCheck size={12} />}>
											Yes
										</Badge>
									) : (
										<Badge color='gray' variant='light' leftSection={<IconX size={12} />}>
											No
										</Badge>
									)}
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{role.entitlementsCount || 0}</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{role.assignmentsCount || 0}</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs' justify='flex-end'>
										<Tooltip label='View'>
											<ActionIcon variant='subtle' color='gray' component={Link} to={role.id}>
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

				{filteredRoles.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No roles found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const RoleListPage: React.FC = withWindowTitle('Roles - Nikki ERP', RoleListPageBody);

