import { ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { Role } from '../../features/role/types';
import {
	DESCRIBE_ROLES_MAX_IDS, DescribeRolesResponse, DescribedRole,
} from '../../features/roleAssignment';

import type { RoleAssignmentProps } from '../props';


export type AssignmentStage = 'select' | 'confirm';

export type PrincipalDisplay = dyn.ModelSchemaLangJson | string | null;

export type RoleAssignmentState = {
	stage: AssignmentStage,
	/**
	 * Raw value of the principal's display field. Left unlocalized here because a group's
	 * `name` is a LangJson while a user's `display_name` is a plain string; the page resolves
	 * both through `useLocalize`.
	 */
	principalDisplay: PrincipalDisplay,
	selectedIds: string[],
	/** Roles being added and removed, derived from the selection — never stored separately. */
	added: string[],
	removed: string[],
	hasChanges: boolean,
	describedRoles: DescribedRole[],
	rolesById: Map<string, Role>,
	isBusy: boolean,
	error: unknown,
	setSelectedIds: (ids: string[]) => void,
	rememberRoles: (roles: Role[]) => void,
	revert: (roleId: string) => void,
	goNext: () => void,
	goBack: () => void,
	save: () => void,
};

export function useRoleAssignment(props: RoleAssignmentProps): RoleAssignmentState {
	const { id = '' } = useParams();
	const bus = useCommandBus();
	const navigate = useNavigate();

	const [stage, setStage] = React.useState<AssignmentStage>('select');
	const [assignedIds, setAssignedIds] = React.useState<string[]>([]);
	const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
	const [rolesById, setRolesById] = React.useState<Map<string, Role>>(() => new Map());
	const [principalDisplay, setPrincipalDisplay] = React.useState<PrincipalDisplay>(null);
	const [describedRoles, setDescribedRoles] = React.useState<DescribedRole[]>([]);
	const [isBusy, setIsBusy] = React.useState(false);
	const [error, setError] = React.useState<unknown>(null);

	usePrincipal(bus, props, id, setPrincipalDisplay);
	useAssignedRoles(bus, props, id, roles => {
		const ids = roles.map(role => role.id);
		setAssignedIds(ids);
		setSelectedIds(ids);
		rememberInto(setRolesById, roles);
	});

	const { added, removed } = React.useMemo(
		() => diffSelection(assignedIds, selectedIds),
		[assignedIds, selectedIds],
	);

	const actions = useAssignmentActions({
		bus, props, id, navigate, added, removed, selectedIds,
		setStage, setDescribedRoles, setIsBusy, setError,
	});

	return {
		stage, principalDisplay, selectedIds, added, removed,
		hasChanges: added.length > 0 || removed.length > 0,
		describedRoles, rolesById, isBusy, error,
		setSelectedIds,
		rememberRoles: React.useCallback(roles => rememberInto(setRolesById, roles), []),
		revert: React.useCallback((roleId: string) => {
			// Reverting a pill is just a selection toggle: back to whatever the server says.
			setSelectedIds(prev => assignedIds.includes(roleId)
				? [...prev, roleId]
				: prev.filter(selected => selected !== roleId));
		}, [assignedIds]),
		...actions,
	};
}

/**
 * A role selected then deselected again produces no diff, which is why both sides are derived
 * from the server-side truth rather than accumulated as the user clicks.
 */
export function diffSelection(assignedIds: string[], selectedIds: string[]): {
	added: string[],
	removed: string[],
} {
	const assigned = new Set(assignedIds);
	const selected = new Set(selectedIds);
	return {
		added: selectedIds.filter(id => !assigned.has(id)),
		removed: assignedIds.filter(id => !selected.has(id)),
	};
}

function rememberInto(
	setRolesById: React.Dispatch<React.SetStateAction<Map<string, Role>>>, roles: Role[],
): void {
	if (roles.length === 0) {
		return;
	}
	// Labels for roles that have scrolled off the current page still need to render as pills,
	// so every role ever seen is kept.
	setRolesById(prev => {
		const next = new Map(prev);
		roles.forEach(role => next.set(role.id, role));
		return next;
	});
}

/**
 * Keeps the latest callback in a ref so effects can call it without listing it as a
 * dependency. The callers pass a fresh closure every render, and depending on it would refetch
 * in a loop.
 */
function useLatest<TArgs>(callback: (value: TArgs) => void): React.RefObject<(value: TArgs) => void> {
	const ref = React.useRef(callback);
	React.useLayoutEffect(() => {
		ref.current = callback;
	});
	return ref;
}

function usePrincipal(
	bus: ICommandBus, props: RoleAssignmentProps, id: string, onLoaded: (value: PrincipalDisplay) => void,
): void {
	const latest = useLatest(onLoaded);
	const { getPrincipalCommand, principalDisplayField } = props;

	React.useEffect(() => {
		if (!id) {
			return;
		}
		void bus.publish<dyn.RestGetOneResponse<Record<string, any>>>({
			name: getPrincipalCommand,
			payload: { id, fields: [principalDisplayField] },
		}).then(response => {
			latest.current(response.data?.item?.[principalDisplayField] ?? null);
		});
	}, [bus, id, getPrincipalCommand, principalDisplayField, latest]);
}

function useAssignedRoles(
	bus: ICommandBus, props: RoleAssignmentProps, id: string, onLoaded: (roles: Role[]) => void,
): void {
	const latest = useLatest(onLoaded);
	const { assignedRolesCommand } = props;

	React.useEffect(() => {
		if (!id) {
			return;
		}
		void bus.publish<dyn.RestSearchResponse<Role>>({
			name: assignedRolesCommand,
			// One page large enough for any realistic assignment; the wizard needs the whole
			// set to compute a diff, so it cannot be paged.
			payload: { id, page: 0, size: 200, fields: ['id', 'name'] },
		}).then(response => latest.current(response.data?.items ?? []));
	}, [bus, id, assignedRolesCommand, latest]);
}

type ActionArgs = {
	bus: ICommandBus,
	props: RoleAssignmentProps,
	id: string,
	navigate: ReturnType<typeof useNavigate>,
	added: string[],
	removed: string[],
	selectedIds: string[],
	setStage: (stage: AssignmentStage) => void,
	setDescribedRoles: (roles: DescribedRole[]) => void,
	setIsBusy: (busy: boolean) => void,
	setError: (error: unknown) => void,
};

/**
 * Plain functions rather than `useCallback`: they are only ever attached to button handlers,
 * so memoising them buys nothing and a stale dependency list would silently save the wrong
 * delta.
 */
function useAssignmentActions(args: ActionArgs): Pick<RoleAssignmentState, 'goNext' | 'goBack' | 'save'> {
	function goNext(): void {
		args.setIsBusy(true);
		args.setError(null);
		void describeInChunks(args.bus, args.props.describeCommand, args.selectedIds)
			.then(roles => {
				args.setDescribedRoles(roles);
				args.setStage('confirm');
			})
			.catch(args.setError)
			.finally(() => args.setIsBusy(false));
	}

	function goBack(): void {
		args.setStage('select');
	}

	function save(): void {
		args.setIsBusy(true);
		args.setError(null);
		void args.bus.publish({
			name: args.props.saveCommand,
			payload: { id: args.id, add: args.added, remove: args.removed },
		}).then(response => {
			// A failed save must surface the error and stay put, never navigate away.
			if (response.error) {
				args.setError(response.error);
				return;
			}
			args.navigate(args.props.backRoutePath, { relative: 'path' });
		}).catch(args.setError).finally(() => args.setIsBusy(false));
	}

	return { goNext, goBack, save };
}

/**
 * `GET /roles/describe` caps the ids per call, so a large selection is chunked rather than
 * truncated — silently describing only the first N would understate what is being granted.
 */
async function describeInChunks(
	bus: ICommandBus, command: string, roleIds: string[],
): Promise<DescribedRole[]> {
	const described: DescribedRole[] = [];
	for (let start = 0; start < roleIds.length; start += DESCRIBE_ROLES_MAX_IDS) {
		const chunk = roleIds.slice(start, start + DESCRIBE_ROLES_MAX_IDS);
		const response = await bus.publish<DescribeRolesResponse>({
			name: command,
			payload: { role_ids: chunk },
		});
		if (response.error) {
			throw response.error;
		}
		described.push(...(response.data?.items ?? []));
	}
	return described;
}
