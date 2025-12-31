import React from 'react';

import { Role } from '@/features/roles';


export function useRoleChanges(originalRoleIds: string[], selectedRoleIds: string[], allRoles: Role[]) {
	return React.useMemo(() => {
		const originalSet = new Set(originalRoleIds);
		const selectedSet = new Set(selectedRoleIds);
		const findRole = (id: string) => allRoles.find((r) => r.id === id);

		const added = selectedRoleIds.filter((id) => !originalSet.has(id)).map(findRole).filter(Boolean) as Role[];
		const removed = originalRoleIds.filter((id) => !selectedSet.has(id)).map(findRole).filter(Boolean) as Role[];
		const unchanged = originalRoleIds.filter((id) => selectedSet.has(id)).map(findRole).filter(Boolean) as Role[];

		return { added, removed, unchanged };
	}, [originalRoleIds, selectedRoleIds, allRoles]);
}