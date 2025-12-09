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

import { RevokeRequest } from '../../features/revoke_requests';
import { fakeRevokeRequests } from '../../mock/fakeData';


function RevokeRequestListPageBody(): React.ReactNode {
	const [requests] = React.useState<RevokeRequest[]>(fakeRevokeRequests);
	const [search, setSearch] = React.useState('');

	const filteredRequests = requests.filter(
		(r) =>
			r.requestorName.toLowerCase().includes(search.toLowerCase()) ||
			r.receiverName.toLowerCase().includes(search.toLowerCase()) ||
			r.targetName?.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<TextInput
					placeholder='Search revoke requests...'
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
						New Request
					</Button>
				</Group>
			</Group>

			<Paper withBorder>
				<Table striped highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Requestor</Table.Th>
							<Table.Th>Receiver</Table.Th>
							<Table.Th>Target</Table.Th>
							<Table.Th>Comment</Table.Th>
							<Table.Th>Created At</Table.Th>
							<Table.Th></Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredRequests.map((request) => (
							<Table.Tr key={request.id}>
								<Table.Td>
									<Text size='sm' fw={500}>{request.requestorName}</Text>
								</Table.Td>
								<Table.Td>
									<Group gap={4}>
										<Badge color='blue' variant='light' size='sm'>
											{request.receiverType}
										</Badge>
										<Text size='sm'>{request.receiverName}</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Group gap={4}>
										<Badge color='violet' variant='light' size='sm'>
											{request.targetType}
										</Badge>
										<Text size='sm'>{request.targetName}</Text>
									</Group>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed' lineClamp={1}>
										{request.comment || '—'}
									</Text>
								</Table.Td>
								<Table.Td>
									<Text size='sm' c='dimmed'>
										{new Date(request.createdAt).toLocaleDateString()}
									</Text>
								</Table.Td>
								<Table.Td>
									<Group gap='xs' justify='flex-end'>
										<Tooltip label='View'>
											<ActionIcon variant='subtle' color='gray' component={Link} to={request.id}>
												<IconEye size={16} />
											</ActionIcon>
										</Tooltip>
										<Tooltip label='Process'>
											<ActionIcon variant='subtle' color='blue'>
												<IconEdit size={16} />
											</ActionIcon>
										</Tooltip>
										<Tooltip label='Cancel'>
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

				{filteredRequests.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No revoke requests found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const RevokeRequestListPage: React.FC = withWindowTitle('Revoke Requests - Nikki ERP', RevokeRequestListPageBody);

