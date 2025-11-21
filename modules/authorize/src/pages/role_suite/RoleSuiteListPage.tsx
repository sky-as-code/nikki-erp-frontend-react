import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Paper,
	Stack,
	Table,
	Text,
	TextInput,
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

import { RoleSuite } from '../../features/roleSuite';
import { fakeRoleSuites } from '../../mock/fakeData';


function RoleSuiteListPageBody(): React.ReactNode {
	const [suites] = React.useState<RoleSuite[]>(fakeRoleSuites);
	const [search, setSearch] = React.useState('');

	const filteredSuites = suites.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.description?.toLowerCase().includes(search.toLowerCase()) ||
			s.ownerName?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<TextInput
					placeholder='Search role suites...'
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
						Create Suite
					</Button>
				</Group>
			</Group>

			<Paper withBorder>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Suite Name</Table.Th>
							<Table.Th>Owner</Table.Th>
							<Table.Th>Description</Table.Th>
							<Table.Th>Requestable</Table.Th>
							<Table.Th>Roles</Table.Th>
							<Table.Th></Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredSuites.map((suite) => (
							<Table.Tr key={suite.id}>
								<Table.Td>
									<Link
										to={suite.id}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<Text fw={500}>{suite.name}</Text>
									</Link>
								</Table.Td>
								<Table.Td>
									<Group gap={4}>
										<Badge color='grape' variant='light' size='sm'>
											{suite.ownerType}
										</Badge>
										<Text size='sm' c='dimmed'>{suite.ownerName}</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{suite.description || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									{suite.isRequestable ? (
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
									<Text size='sm'>{suite.rolesCount || 0} roles</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs' justify='flex-end'>
										<Tooltip label='View'>
											<ActionIcon variant='subtle' color='gray' component={Link} to={suite.id}>
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

				{filteredSuites.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No role suites found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const RoleSuiteListPage: React.FC = withWindowTitle('Role Suites - Nikki ERP', RoleSuiteListPageBody);

