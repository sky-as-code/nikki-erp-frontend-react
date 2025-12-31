import { useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { RoleSuite } from '@/features/role_suites';
import type { Role } from '@/features/roles';


export function useTargetSelectLogic(roles?: Role[], roleSuites?: RoleSuite[]) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();

	const targetType = useWatch({
		control,
		name: 'targetType',
	}) as 'role' | 'suite' | undefined;

	const availableTargets = React.useMemo(() => {
		if (targetType === 'role' && roles) {
			return roles.map((r) => ({ id: r.id, name: r.name }));
		}
		if (targetType === 'suite' && roleSuites) {
			return roleSuites.map((rs) => ({ id: rs.id, name: rs.name }));
		}
		return [];
	}, [targetType, roles, roleSuites]);

	const shouldDisable = !targetType || availableTargets.length === 0;

	const placeholder = React.useMemo(() => {
		if (!targetType) {
			return translate('nikki.authorize.grant_request.placeholders.select_target_type_first');
		}
		if (availableTargets.length === 0) {
			return translate('nikki.authorize.grant_request.placeholders.no_targets_available');
		}
		return '';
	}, [targetType, availableTargets.length, translate]);

	return {
		availableTargets,
		shouldDisable,
		placeholder,
	};
}

export function useReceiverSelectLogic(users?: User[], groups?: Group[]) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();

	const receiverType = useWatch({
		control,
		name: 'receiverType',
	}) as 'user' | 'group' | undefined;

	const availableReceivers = React.useMemo(() => {
		if (receiverType === 'user' && users) {
			return users.map((u) => ({ id: u.id, name: u.displayName }));
		}
		if (receiverType === 'group' && groups) {
			return groups.map((g) => ({ id: g.id, name: g.name }));
		}
		return [];
	}, [receiverType, users, groups]);

	const shouldDisable = !receiverType || availableReceivers.length === 0;

	const placeholder = React.useMemo(() => {
		if (!receiverType) {
			return translate('nikki.authorize.grant_request.placeholders.select_receiver_type_first');
		}
		if (availableReceivers.length === 0) {
			return translate('nikki.authorize.grant_request.placeholders.no_receivers_available');
		}
		return '';
	}, [receiverType, availableReceivers.length, translate]);

	return {
		availableReceivers,
		shouldDisable,
		placeholder,
	};
}

