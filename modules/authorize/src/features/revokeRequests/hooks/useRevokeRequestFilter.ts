import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	selectGroupList,
	selectUserList,
} from '@/appState';
import { ReceiverType, TargetType } from '@/features/grantRequests/types';

import {
	useRoleSuitesByReceiver,
	useRolesByReceiver,
	type AssignmentItem,
} from './useRevokeRequestAssignments';


import type { Group, User } from '@/features/identities';
import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';


function getAssignmentId(a: AssignmentItem): string {
	return `${a.targetType}:${a.targetId}:${a.receiverType}:${a.receiverId}`;
}

function buildAssignmentsByReceiver(
	receiverType: ReceiverType,
	receiverId: string,
	rolesByReceiver: Role[],
	suitesByReceiver: RoleSuite[],
): AssignmentItem[] {
	return [
		...rolesByReceiver.map((role) => ({
			targetType: TargetType.ROLE,
			targetId: role.id,
			targetName: role.name,
			receiverType,
			receiverId,
			receiverName: '',
		})),
		...suitesByReceiver.map((suite) => ({
			targetType: TargetType.SUITE,
			targetId: suite.id,
			targetName: suite.name,
			receiverType,
			receiverId,
			receiverName: '',
		})),
	];
}

function buildAssignments(
	receiverType: ReceiverType | null,
	receiverId: string | null,
	rolesByReceiver: Role[],
	suitesByReceiver: RoleSuite[],
): AssignmentItem[] {
	if (receiverType && receiverId) {
		return buildAssignmentsByReceiver(receiverType, receiverId, rolesByReceiver, suitesByReceiver);
	}
	return [];
}

function fillReceiverName(a: AssignmentItem, users: User[], groups: Group[]): string {
	if (a.receiverType === ReceiverType.USER) {
		return users.find((u) => u.id === a.receiverId)?.displayName || a.receiverId;
	}
	return groups.find((g) => g.id === a.receiverId)?.name || a.receiverId;
}

function fillTargetName(a: AssignmentItem, roles: Role[], suites: RoleSuite[]): string {
	if (a.targetType === TargetType.ROLE) {
		return roles.find((r) => r.id === a.targetId)?.name || a.targetId;
	}
	return suites.find((s) => s.id === a.targetId)?.name || a.targetId;
}

function decorateAssignmentNames(
	assignments: AssignmentItem[],
	users: User[],
	groups: Group[],
): AssignmentItem[] {
	return assignments.map((assignment) => {
		const result = { ...assignment };
		// Fill receiver name from lookups
		if (!result.receiverName) {
			result.receiverName = fillReceiverName(result, users, groups);
		}
		return result;
	});
}

function toggleSelection(prev: Set<string>, assignmentId: string, selected: boolean): Set<string> {
	const next = new Set(prev);
	if (selected) next.add(assignmentId);
	else next.delete(assignmentId);
	return next;
}

function selectAll(assignments: AssignmentItem[]): Set<string> {
	return new Set(assignments.map(getAssignmentId));
}

function useFilterState() {
	const [receiverType, setReceiverType] = React.useState<ReceiverType | null>(null);
	const [receiverId, setReceiverId] = React.useState<string | null>(null);
	return {
		receiverType,
		setReceiverType,
		receiverId,
		setReceiverId,
	};
}

function useAssignmentsByFilter(state: ReturnType<typeof useFilterState>) {
	const { roles: rolesByReceiver, isLoading: isLoadingRoles } = useRolesByReceiver(
		state.receiverId,
		state.receiverType,
	);
	const { roleSuites: suitesByReceiver, isLoading: isLoadingSuites } = useRoleSuitesByReceiver(
		state.receiverId,
		state.receiverType,
	);
	const isLoading = isLoadingRoles || isLoadingSuites;
	return { rolesByReceiver, suitesByReceiver, isLoading };
}

function useSelection(assignments: AssignmentItem[]) {
	const [selectedAssignments, setSelectedAssignments] = React.useState<Set<string>>(new Set());
	const onSelectionChange = React.useCallback((assignmentId: string, selected: boolean) => {
		setSelectedAssignments((prev) => toggleSelection(prev, assignmentId, selected));
	}, []);
	const onSelectAll = React.useCallback(() => setSelectedAssignments(selectAll(assignments)), [assignments]);
	const onDeselectAll = React.useCallback(() => setSelectedAssignments(new Set()), []);
	const getSelectedAssignments = React.useCallback(() => {
		return assignments.filter((a) => selectedAssignments.has(getAssignmentId(a)));
	}, [assignments, selectedAssignments]);
	return { selectedAssignments, onSelectionChange, onSelectAll, onDeselectAll, getSelectedAssignments };
}

function useLookups() {
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	return { users, groups };
}

function useComputedAssignments(
	state: ReturnType<typeof useFilterState>,
	fetched: ReturnType<typeof useAssignmentsByFilter>,
	lookups: ReturnType<typeof useLookups>,
) {
	const assignmentsBase = React.useMemo(() => {
		return buildAssignments(
			state.receiverType,
			state.receiverId,
			fetched.rolesByReceiver,
			fetched.suitesByReceiver,
		);
	}, [state, fetched]);

	return React.useMemo(() => {
		// Fill receiver names from lookups
		return decorateAssignmentNames(
			assignmentsBase,
			lookups.users,
			lookups.groups,
		);
	}, [assignmentsBase, lookups]);
}

export function useRevokeRequestFilter() {
	const state = useFilterState();
	const lookups = useLookups();
	const fetched = useAssignmentsByFilter(state);
	const assignments = useComputedAssignments(state, fetched, lookups);
	const selection = useSelection(assignments);
	return { ...state, ...lookups, assignments, ...selection, isLoading: fetched.isLoading };
}

