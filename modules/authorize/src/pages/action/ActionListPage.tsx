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

import { Action } from '../../features/actions/types';
import { fakeActions, fakeResources } from '../../mock/fakeData';


function ActionListPageBody(): React.ReactNode {
	const [actions] = React.useState<Action[]>(fakeActions);
	const [search, setSearch] = React.useState('');

	const filteredActions = actions.filter(
		(a) =>
			a.name.toLowerCase().includes(search.toLowerCase()) ||
			a.description?.toLowerCase().includes(search.toLowerCase()),
	);

	const getResourceName = (resourceId: string) => {
		const resource = fakeResources.find((r) => r.id === resourceId);
		return resource?.name || resourceId;
	};

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<TextInput
					placeholder='Search actions...'
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
						Create Action
					</Button>
				</Group>
			</Group>

			<Paper withBorder>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Action Name</Table.Th>
							<Table.Th>Resource</Table.Th>
							<Table.Th>Description</Table.Th>
							<Table.Th>Entitlements</Table.Th>
							<Table.Th></Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredActions.map((action) => (
							<Table.Tr key={action.id}>
								<Table.Td>
									<Badge color='blue' variant='light'>
										{action.name}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Link
										to={`/resources/${action.resourceId}`}
										style={{ textDecoration: 'none', color: 'inherit' }}
									>
										<Text size='sm' c='blue'>
											{getResourceName(action.resourceId)}
										</Text>
									</Link>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{action.description || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm'>{action.entitlementsCount || 0} entitlements</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs' justify='flex-end'>
										<Tooltip label='View'>
											<ActionIcon variant='subtle' color='gray'>
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

				{filteredActions.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No actions found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const ActionListPage: React.FC = withWindowTitle('Actions - Nikki ERP', ActionListPageBody);
