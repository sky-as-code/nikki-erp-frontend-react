import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	AuthorizeDispatch,
	identityActions,
	roleActions,
	roleSuiteActions,
	selectGroupList,
	selectRoleList,
	selectRoleSuiteList,
	selectUserList,
} from '@/appState';
import { ReceiverType, TargetType } from '@/features/grantRequests/types';
import {
	buildGroupsByRoleQuery,
	buildGroupsByRoleSuiteQuery,
	buildRoleSuitesByReceiverQuery,
	buildRolesByReceiverQuery,
	buildUsersByRoleQuery,
	buildUsersByRoleSuiteQuery,
} from '@/features/revokeRequests/utils/revokeRequestQueries';


export type AssignmentItem = {
	targetType: TargetType;
	targetId: string;
	targetName: string;
	receiverType: ReceiverType;
	receiverId: string;
	receiverName: string;
};

export function useRolesByReceiver(receiverId: string | null, receiverType: ReceiverType | null) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const roles = useMicroAppSelector(selectRoleList);
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (receiverId && receiverType) {
			setIsLoading(true);
			const graph = buildRolesByReceiverQuery(receiverId);
			dispatch(roleActions.listRoles({ graph }))
				.unwrap()
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		}
	}, [dispatch, receiverId, receiverType]);

	return { roles, isLoading };
}

export function useRoleSuitesByReceiver(receiverId: string | null, receiverType: ReceiverType | null) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const roleSuites = useMicroAppSelector(selectRoleSuiteList);
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (receiverId && receiverType) {
			setIsLoading(true);
			const graph = buildRoleSuitesByReceiverQuery(receiverId);
			dispatch(roleSuiteActions.listRoleSuites({ graph }))
				.unwrap()
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		}
	}, [dispatch, receiverId, receiverType]);

	return { roleSuites, isLoading };
}

export function useUsersByTarget(targetId: string | null, targetType: TargetType | null) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const users = useMicroAppSelector(selectUserList);
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (targetId && targetType) {
			setIsLoading(true);
			const query = targetType === TargetType.ROLE
				? buildUsersByRoleQuery(targetId)
				: buildUsersByRoleSuiteQuery(targetId);
			dispatch(identityActions.listUsers({ query }))
				.unwrap()
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		}
	}, [dispatch, targetId, targetType]);

	return { users, isLoading };
}

export function useGroupsByTarget(targetId: string | null, targetType: TargetType | null) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const groups = useMicroAppSelector(selectGroupList);
	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		if (targetId && targetType) {
			setIsLoading(true);
			const query = targetType === TargetType.ROLE
				? buildGroupsByRoleQuery(targetId)
				: buildGroupsByRoleSuiteQuery(targetId);
			dispatch(identityActions.listGroups({ query }))
				.unwrap()
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		}
	}, [dispatch, targetId, targetType]);

	return { groups, isLoading };
}

