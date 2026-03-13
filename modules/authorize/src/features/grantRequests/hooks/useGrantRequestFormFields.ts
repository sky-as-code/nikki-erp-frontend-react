import { useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';


type SelectOption = { id: string; name: string };
type TargetType = 'role' | 'suite' | undefined;
type ReceiverType = 'user' | 'group' | undefined;

function resetField(control: Control<any>, fieldName: string): void {
	if (control && '_formValues' in control) {
		(control as any)._formValues[fieldName] = undefined;
	}
}

function shouldResetSelectedId(selectedId: string | undefined, availableIds: Set<string>): boolean {
	if (!selectedId) return false;
	return !availableIds.has(selectedId);
}

function resolveRoleOrgId(role: Role): string | null {
	return role.orgId ?? role.org?.id ?? null;
}

function resolveRoleSuiteOrgId(roleSuite: RoleSuite): string | null {
	return roleSuite.orgId ?? roleSuite.org?.id ?? null;
}

function mapToSelectOptions<T extends { id: string; name: string }>(items: T[]): SelectOption[] {
	return items.map((item) => ({ id: item.id, name: item.name }));
}

function filterByOrgScope<T>(
	items: T[],
	selectedOrgId: string | null,
	resolveOrgId: (item: T) => string | null,
	allowFallbackToUnscopedList: boolean,
): T[] {
	if (selectedOrgId === null) {
		return items.filter((item) => !resolveOrgId(item));
	}

	const filteredItems = items.filter((item) => resolveOrgId(item) === selectedOrgId);
	if (allowFallbackToUnscopedList && filteredItems.length === 0) {
		return items;
	}
	return filteredItems;
}

function getSelectPlaceholder(params: {
	selectedOrgId?: string | null;
	entityType?: string;
	hasOptions: boolean;
	selectScopeFirstText: string;
	selectTypeFirstText: string;
	noOptionsText: string;
}): string {
	if (params.selectedOrgId === undefined) {
		return params.selectScopeFirstText;
	}
	if (!params.entityType) {
		return params.selectTypeFirstText;
	}
	if (!params.hasOptions) {
		return params.noOptionsText;
	}
	return '';
}

function useResetOnUnavailableSelection(
	selectedId: string | undefined,
	availableOptions: SelectOption[],
	control: Control<any>,
	fieldName: string,
): void {
	React.useEffect(() => {
		const availableIds = new Set(availableOptions.map((option) => option.id));
		if (shouldResetSelectedId(selectedId, availableIds)) {
			resetField(control, fieldName);
		}
	}, [selectedId, availableOptions, control, fieldName]);
}

function buildTargetOptions(
	targetType: TargetType,
	roles: Role[] | undefined,
	roleSuites: RoleSuite[] | undefined,
	selectedOrgId?: string | null,
): SelectOption[] {
	if (selectedOrgId === undefined) {
		return [];
	}
	if (targetType === 'role' && roles) {
		return mapToSelectOptions(
			filterByOrgScope(roles, selectedOrgId, resolveRoleOrgId, true),
		);
	}
	if (targetType === 'suite' && roleSuites) {
		return mapToSelectOptions(
			filterByOrgScope(roleSuites, selectedOrgId, resolveRoleSuiteOrgId, true),
		);
	}
	return [];
}

function buildReceiverOptions(
	receiverType: ReceiverType,
	users: User[] | undefined,
	groups: Group[] | undefined,
	selectedOrgId?: string | null,
): SelectOption[] {
	if (selectedOrgId === undefined) {
		return [];
	}
	if (receiverType === 'user' && users) {
		return users.map((u) => ({ id: u.id, name: u.displayName }));
	}
	if (receiverType === 'group' && groups) {
		return groups.map((g) => ({ id: g.id, name: g.name }));
	}
	return [];
}

export function useTargetSelectLogic(
	roles?: Role[],
	roleSuites?: RoleSuite[],
	selectedOrgId?: string | null,
) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();

	const targetType = useWatch({ control, name: 'targetType' }) as TargetType;
	const selectedTargetRef = useWatch({ control, name: 'targetRef' }) as string | undefined;

	const availableTargets = React.useMemo(
		() => buildTargetOptions(targetType, roles, roleSuites, selectedOrgId),
		[targetType, roles, roleSuites, selectedOrgId],
	);

	useResetOnUnavailableSelection(selectedTargetRef, availableTargets, control, 'targetRef');

	const shouldDisable = selectedOrgId === undefined || !targetType || availableTargets.length === 0;

	const placeholder = React.useMemo(() => {
		return getSelectPlaceholder({
			selectedOrgId,
			entityType: targetType,
			hasOptions: availableTargets.length > 0,
			selectScopeFirstText: 'Select target scope first',
			selectTypeFirstText: translate('nikki.authorize.grant_request.placeholders.select_target_type_first'),
			noOptionsText: translate('nikki.authorize.grant_request.placeholders.no_targets_available'),
		});
	}, [selectedOrgId, targetType, availableTargets.length, translate]);

	return {
		availableTargets,
		shouldDisable,
		placeholder,
	};
}

export function useReceiverSelectLogic(
	users?: User[],
	groups?: Group[],
	selectedOrgId?: string | null,
) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();

	const receiverType = useWatch({ control, name: 'receiverType' }) as ReceiverType;
	const selectedReceiverId = useWatch({ control, name: 'receiverId' }) as string | undefined;

	const availableReceivers = React.useMemo(
		() => buildReceiverOptions(receiverType, users, groups, selectedOrgId),
		[receiverType, users, groups, selectedOrgId],
	);

	useResetOnUnavailableSelection(selectedReceiverId, availableReceivers, control, 'receiverId');

	const shouldDisable = selectedOrgId === undefined || !receiverType || availableReceivers.length === 0;

	const placeholder = React.useMemo(() => {
		return getSelectPlaceholder({
			selectedOrgId,
			entityType: receiverType,
			hasOptions: availableReceivers.length > 0,
			selectScopeFirstText: 'Select receiver scope first',
			selectTypeFirstText: translate('nikki.authorize.grant_request.placeholders.select_receiver_type_first'),
			noOptionsText: translate('nikki.authorize.grant_request.placeholders.no_receivers_available'),
		});
	}, [selectedOrgId, receiverType, availableReceivers.length, translate]);

	return {
		availableReceivers,
		shouldDisable,
		placeholder,
	};
}

