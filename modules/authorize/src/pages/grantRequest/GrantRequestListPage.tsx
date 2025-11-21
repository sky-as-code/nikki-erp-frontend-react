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
	IconX,
} from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';

import { GrantRequest, RequestStatus } from '../../features/grantRequests';
import { fakeGrantRequests } from '../../mock/fakeData';


const statusColors: Record<RequestStatus, string> = {
	[RequestStatus.PENDING]: 'yellow',
	[RequestStatus.APPROVED]: 'green',
	[RequestStatus.REJECTED]: 'red',
	[RequestStatus.CANCELLED]: 'gray',
};

function GrantRequestListPageBody(): React.ReactNode {
	const [requests] = React.useState<GrantRequest[]>(fakeGrantRequests);
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
					placeholder='Search grant requests...'
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
							<Table.Th>Status</Table.Th>
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
									<Badge color={statusColors[request.status]} variant='light'>
										{request.status}
									</Badge>
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
										{request.status === RequestStatus.PENDING && (
											<>
												<Tooltip label='Approve'>
													<ActionIcon variant='subtle' color='green'>
														<IconCheck size={16} />
													</ActionIcon>
												</Tooltip>
												<Tooltip label='Reject'>
													<ActionIcon variant='subtle' color='red'>
														<IconX size={16} />
													</ActionIcon>
												</Tooltip>
											</>
										)}
									</Group>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>

				{filteredRequests.length === 0 && (
					<Text ta='center' c='dimmed' p='xl'>
						No grant requests found
					</Text>
				)}
			</Paper>
		</Stack>
	);
}

export const GrantRequestListPage: React.FC = withWindowTitle('Grant Requests - Nikki ERP', GrantRequestListPageBody);

