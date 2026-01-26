import { useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { OwnerType } from '@/features/roles';


export function useOwnerSelectLogic(users?: User[], groups?: Group[]) {
	const { t: translate } = useTranslation();
	const { control } = useFormField();

	const ownerType = useWatch({
		control,
		name: 'ownerType',
	}) as OwnerType | undefined;

	const availableOwners = React.useMemo(() => {
		if (ownerType === 'user' && users) {
			return users.map((u) => ({ id: u.id, name: u.displayName }));
		}
		if (ownerType === 'group' && groups) {
			return groups.map((g) => ({ id: g.id, name: g.name }));
		}
		return [];
	}, [ownerType, users, groups]);

	const shouldDisable = !ownerType || availableOwners.length === 0;

	const placeholder = React.useMemo(() => {
		if (!ownerType) {
			return translate('nikki.authorize.role_suite.placeholders.select_owner_type_first');
		}
		if (availableOwners.length === 0) {
			return translate('nikki.authorize.role_suite.placeholders.no_owners_available');
		}
		return '';
	}, [ownerType, availableOwners.length]);

	return {
		availableOwners,
		shouldDisable,
		placeholder,
	};
}
