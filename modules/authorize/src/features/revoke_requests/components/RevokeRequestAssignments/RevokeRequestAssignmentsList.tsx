import { Button, Checkbox, Group, Paper, Stack, Table, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { AssignmentItem } from '@/pages/revoke_requests/hooks/useRevokeRequestAssignments';


interface RevokeRequestAssignmentsListProps {
	assignments: AssignmentItem[];
	selectedAssignments: Set<string>;
	onSelectionChange: (assignmentId: string, selected: boolean) => void;
	onSelectAll: () => void;
	onDeselectAll: () => void;
	onRevoke?: () => void;
	showRevokeButton?: boolean;
	isLoading?: boolean;
}

function getAssignmentId(assignment: AssignmentItem): string {
	return `${assignment.targetType}:${assignment.targetId}:${assignment.receiverType}:${assignment.receiverId}`;
}

export const RevokeRequestAssignmentsList: React.FC<RevokeRequestAssignmentsListProps> = ({
	assignments,
	selectedAssignments,
	onSelectionChange,
	onSelectAll,
	onDeselectAll,
	onRevoke,
	showRevokeButton = true,
	isLoading,
}) => {
	const { t: translate } = useTranslation();

	const allSelected = assignments.length > 0 && assignments.every((a) => selectedAssignments.has(getAssignmentId(a)));
	const someSelected = !allSelected && assignments.some((a) => selectedAssignments.has(getAssignmentId(a)));

	const handleSelectAllChange = React.useCallback((checked: boolean) => {
		if (checked) {
			onSelectAll();
		}
		else {
			onDeselectAll();
		}
	}, [onSelectAll, onDeselectAll]);

	if (assignments.length === 0) {
		return (
			<Paper p='md' withBorder>
				<Title order={5}>{translate('nikki.authorize.revoke_request.assignments.title')}</Title>
				<Stack gap='sm' mt='md'>
					{translate('nikki.authorize.revoke_request.assignments.no_assignments')}
				</Stack>
			</Paper>
		);
	}

	return (
		<Paper p='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between'>
					<Title order={5}>{translate('nikki.authorize.revoke_request.assignments.title')}</Title>
					<Group>
						<Button
							variant='outline'
							size='compact-md'
							onClick={onDeselectAll}
							disabled={selectedAssignments.size === 0}
						>
							{translate('nikki.general.actions.deselect_all')}
						</Button>
						<Button
							variant='outline'
							size='compact-md'
							onClick={onSelectAll}
							disabled={assignments.length === 0}
						>
							{translate('nikki.general.actions.select_all')}
						</Button>
						{showRevokeButton && onRevoke && (
							<Button
								size='compact-md'
								onClick={onRevoke}
								disabled={selectedAssignments.size === 0 || isLoading}
								loading={isLoading}
							>
								{translate('nikki.authorize.revoke_request.actions.revoke_selected')}
							</Button>
						)}
					</Group>
				</Group>
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th style={{ width: 50 }}>
								<Checkbox
									checked={allSelected}
									indeterminate={someSelected}
									onChange={(e) => handleSelectAllChange(e.currentTarget.checked)}
								/>
							</Table.Th>
							<Table.Th>{translate('nikki.authorize.revoke_request.assignments.target_type')}</Table.Th>
							<Table.Th>{translate('nikki.authorize.revoke_request.assignments.target')}</Table.Th>
							<Table.Th>{translate('nikki.authorize.revoke_request.assignments.receiver_type')}</Table.Th>
							<Table.Th>{translate('nikki.authorize.revoke_request.assignments.receiver')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{assignments.map((assignment) => {
							const assignmentId = getAssignmentId(assignment);
							const isSelected = selectedAssignments.has(assignmentId);
							return (
								<Table.Tr key={assignmentId}>
									<Table.Td>
										<Checkbox
											checked={isSelected}
											onChange={(e) => onSelectionChange(assignmentId, e.currentTarget.checked)}
										/>
									</Table.Td>
									<Table.Td>
										{translate(`nikki.authorize.grant_request.fields.target_type_${assignment.targetType}`)}
									</Table.Td>
									<Table.Td>{assignment.targetName}</Table.Td>
									<Table.Td>
										{translate(`nikki.authorize.grant_request.fields.receiver_type_${assignment.receiverType}`)}
									</Table.Td>
									<Table.Td>{assignment.receiverName}</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Stack>
		</Paper>
	);
};

