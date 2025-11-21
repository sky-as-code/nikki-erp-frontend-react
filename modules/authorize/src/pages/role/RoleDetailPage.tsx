import {
	Badge,
	Breadcrumbs,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import {
	IconArrowLeft,
	IconCheck,
	IconEdit,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import React from 'react';
import { Link, useParams } from 'react-router';

import { fakeRoles } from '../../mock/fakeData';


function RoleDetailPageBody(): React.ReactNode {
	const { roleId } = useParams<{ roleId: string }>();
	const role = fakeRoles.find((r) => r.id === roleId);

	if (!role) {
		return (
			<Stack gap='md'>
				<Text>Role not found</Text>
				<Button component={Link} to='/roles' leftSection={<IconArrowLeft size={16} />}>
					Back to Roles
				</Button>
			</Stack>
		);
	}

	return (
		<Stack gap='md'>
			<Group>
				<Button
					size='sm'
					variant='outline'
					leftSection={<IconArrowLeft size={16} />}
					component={Link}
					to='/roles'
				>
					Back
				</Button>
				<Button
					size='sm'
					variant='outline'
					leftSection={<IconEdit size={16} />}
				>
					Edit
				</Button>
				<Button
					size='sm'
					variant='outline'
					color='red'
					leftSection={<IconTrash size={16} />}
				>
					Delete
				</Button>
			</Group>

			<Paper withBorder p='lg'>
				<Stack gap='md'>
					<Group justify='space-between'>
						<Title order={3}>{role.name}</Title>
						{role.isRequestable ? (
							<Badge color='green' variant='light' leftSection={<IconCheck size={12} />}>
								Requestable
							</Badge>
						) : (
							<Badge color='gray' variant='light' leftSection={<IconX size={12} />}>
								Not Requestable
							</Badge>
						)}
					</Group>

					<Divider />

					<Group>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>ID</Text>
							<Text size='sm' ff='monospace'>{role.id}</Text>
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Owner Type</Text>
							<Badge color='grape' variant='light'>
								{role.ownerType}
							</Badge>
						</div>
					</Group>

					<div>
						<Text size='sm' c='dimmed'>Owner</Text>
						<Text size='sm'>{role.ownerName}</Text>
						<Text size='xs' c='dimmed' ff='monospace'>{role.ownerRef}</Text>
					</div>

					<div>
						<Text size='sm' c='dimmed'>Description</Text>
						<Text size='sm'>{role.description || '—'}</Text>
					</div>

					<Divider />

					<Title order={5}>Request Settings</Title>

					<Group>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Required Attachment</Text>
							{role.isRequiredAttachment ? (
								<Badge color='green' size='sm'>Yes</Badge>
							) : (
								<Badge color='gray' size='sm'>No</Badge>
							)}
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Required Comment</Text>
							{role.isRequiredComment ? (
								<Badge color='green' size='sm'>Yes</Badge>
							) : (
								<Badge color='gray' size='sm'>No</Badge>
							)}
						</div>
					</Group>

					<Divider />

					<Title order={5}>Statistics</Title>

					<Group>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Entitlements</Text>
							<Text size='lg' fw={700}>{role.entitlementsCount || 0}</Text>
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Assignments</Text>
							<Text size='lg' fw={700}>{role.assignmentsCount || 0}</Text>
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Suites</Text>
							<Text size='lg' fw={700}>{role.suitesCount || 0}</Text>
						</div>
					</Group>

					<Divider />

					<Group>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Created By</Text>
							<Text size='sm'>{role.createdBy}</Text>
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Organization</Text>
							<Text size='sm' ff='monospace'>{role.orgId}</Text>
						</div>
					</Group>

					<Group>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Created At</Text>
							<Text size='sm'>{new Date(role.createdAt).toLocaleString()}</Text>
						</div>
						<div style={{ flex: 1 }}>
							<Text size='sm' c='dimmed'>Updated At</Text>
							<Text size='sm'>{new Date(role.updatedAt).toLocaleString()}</Text>
						</div>
					</Group>
				</Stack>
			</Paper>
		</Stack>
	);
}

export const RoleDetailPage: React.FC = withWindowTitle('Roles - Nikki ERP', RoleDetailPageBody);

