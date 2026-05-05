// import { useActiveOrgWithDetails, useUserContext } from '@nikkierp/shell/userContext';
// import React from 'react';


// export function useOrgScopeRef(): string | undefined {
// 	const activeOrg = useActiveOrgWithDetails();
// 	return activeOrg?.id;
// }

// export function useHierarchyScopeRef(): string | undefined {
// 	const activeOrg = useActiveOrgWithDetails();
// 	const { hierarchies } = useUserContext();

// 	return React.useMemo(() => {
// 		if (!activeOrg?.id) return undefined;
// 		const match = hierarchies.find((h) => h.orgId === activeOrg.id);
// 		return match?.id;
// 	}, [activeOrg?.id, hierarchies]);
// }
