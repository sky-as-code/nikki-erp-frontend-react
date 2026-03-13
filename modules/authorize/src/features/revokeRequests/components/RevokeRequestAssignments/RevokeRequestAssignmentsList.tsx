import { Button, Checkbox, Group, Paper, Stack, Table, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { AssignmentItem } from '@/features/revokeRequests/hooks/useRevokeRequestAssignments';


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

interface AssignmentSelectionState {
	allSelected: boolean;
	someSelected: boolean;
}

function useAssignmentSelectionState(
	assignments: AssignmentItem[],
	selectedAssignments: Set<string>,
): AssignmentSelectionState {
	const allSelected = assignments.length > 0
		&& assignments.every((assignment) => selectedAssignments.has(getAssignmentId(assignment)));
	const someSelected = !allSelected
		&& assignments.some((assignment) => selectedAssignments.has(getAssignmentId(assignment)));

	return { allSelected, someSelected };
}

function EmptyAssignmentsState() {
	const { t: translate } = useTranslation();

	return (
		<Paper p='md' withBorder>
			<Title order={5}>{translate('nikki.authorize.revoke_request.assignments.title')}</Title>
			<Stack gap='sm' mt='md'>
				{translate('nikki.authorize.revoke_request.assignments.no_assignments')}
			</Stack>
		</Paper>
	);
}

interface AssignmentsToolbarProps {
	onSelectAll: () => void;
	onDeselectAll: () => void;
	showRevokeButton: boolean;
	onRevoke?: () => void;
	isLoading?: boolean;
	selectedCount: number;
	totalCount: number;
}

function AssignmentsToolbar({
	onSelectAll,
	onDeselectAll,
	showRevokeButton,
	onRevoke,
	isLoading,
	selectedCount,
	totalCount,
}: AssignmentsToolbarProps) {
	const { t: translate } = useTranslation();

	return (
		<Group justify='space-between'>
			<Title order={5}>{translate('nikki.authorize.revoke_request.assignments.title')}</Title>
			<Group>
				<Button
					variant='outline'
					size='compact-md'
					onClick={onDeselectAll}
					disabled={selectedCount === 0}
				>
					{translate('nikki.general.actions.deselect_all')}
				</Button>
				<Button
					variant='outline'
					size='compact-md'
					onClick={onSelectAll}
					disabled={totalCount === 0}
				>
					{translate('nikki.general.actions.select_all')}
				</Button>
				{showRevokeButton && onRevoke && (
					<Button
						size='compact-md'
						onClick={onRevoke}
						disabled={selectedCount === 0 || isLoading}
						loading={isLoading}
					>
						{translate('nikki.authorize.revoke_request.actions.revoke_selected')}
					</Button>
				)}
			</Group>
		</Group>
	);
}

interface AssignmentsTableHeaderProps {
	allSelected: boolean;
	someSelected: boolean;
	onSelectAllChange: (checked: boolean) => void;
}

function AssignmentsTableHeader({
	allSelected,
	someSelected,
	onSelectAllChange,
}: AssignmentsTableHeaderProps) {
	const { t: translate } = useTranslation();

	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th style={{ width: 50 }}>
					<Checkbox
						checked={allSelected}
						indeterminate={someSelected}
						onChange={(event) => onSelectAllChange(event.currentTarget.checked)}
					/>
				</Table.Th>
				<Table.Th>{translate('nikki.authorize.revoke_request.assignments.target_type')}</Table.Th>
				<Table.Th>{translate('nikki.authorize.revoke_request.assignments.target')}</Table.Th>
				<Table.Th>{translate('nikki.authorize.revoke_request.assignments.receiver_type')}</Table.Th>
				<Table.Th>{translate('nikki.authorize.revoke_request.assignments.receiver')}</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
}

interface AssignmentRowProps {
	assignment: AssignmentItem;
	selectedAssignments: Set<string>;
	onSelectionChange: (assignmentId: string, selected: boolean) => void;
}

function AssignmentRow({ assignment, selectedAssignments, onSelectionChange }: AssignmentRowProps) {
	const { t: translate } = useTranslation();
	const assignmentId = getAssignmentId(assignment);
	const isSelected = selectedAssignments.has(assignmentId);

	return (
		<Table.Tr key={assignmentId}>
			<Table.Td>
				<Checkbox
					checked={isSelected}
					onChange={(event) => onSelectionChange(assignmentId, event.currentTarget.checked)}
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
}

interface AssignmentsTableProps {
	assignments: AssignmentItem[];
	selectedAssignments: Set<string>;
	allSelected: boolean;
	someSelected: boolean;
	onSelectionChange: (assignmentId: string, selected: boolean) => void;
	onSelectAllChange: (checked: boolean) => void;
}

function AssignmentsTable({
	assignments,
	selectedAssignments,
	allSelected,
	someSelected,
	onSelectionChange,
	onSelectAllChange,
}: AssignmentsTableProps) {
	return (
		<Table>
			<AssignmentsTableHeader
				allSelected={allSelected}
				someSelected={someSelected}
				onSelectAllChange={onSelectAllChange}
			/>
			<Table.Tbody>
				{assignments.map((assignment) => (
					<AssignmentRow
						key={getAssignmentId(assignment)}
						assignment={assignment}
						selectedAssignments={selectedAssignments}
						onSelectionChange={onSelectionChange}
					/>
				))}
			</Table.Tbody>
		</Table>
	);
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
	const { allSelected, someSelected } = useAssignmentSelectionState(assignments, selectedAssignments);

	const handleSelectAllChange = React.useCallback((checked: boolean) => {
		if (checked) {
			onSelectAll();
		}
		onDeselectAll();
	}, [onSelectAll, onDeselectAll]);

	if (assignments.length === 0) {
		return <EmptyAssignmentsState />;
	}

	return (
		<Paper p='md' withBorder>
			<Stack gap='md'>
				<AssignmentsToolbar
					onSelectAll={onSelectAll}
					onDeselectAll={onDeselectAll}
					showRevokeButton={showRevokeButton}
					onRevoke={onRevoke}
					isLoading={isLoading}
					selectedCount={selectedAssignments.size}
					totalCount={assignments.length}
				/>
				<AssignmentsTable
					assignments={assignments}
					selectedAssignments={selectedAssignments}
					allSelected={allSelected}
					someSelected={someSelected}
					onSelectionChange={onSelectionChange}
					onSelectAllChange={handleSelectAllChange}
				/>
			</Stack>
		</Paper>
	);
};

