import { LoadingState, Unauthorized, useHasEntitlement } from '@nikkierp/ui/components';
import React from 'react';

import { pageReadRequirements } from './pageRead';

import type { PageNode } from '@nikkierp/viewengine/metadata';


/**
 * Replaces a page the user may not read with the refusal, in place.
 *
 * Decided before the template mounts, so a refused list never issues the search the server would
 * reject -- which is what used to leave it on its loading row forever. Nothing is refused while
 * the user context is still loading.
 */
export function PageReadGuard({ page, children }: { page: PageNode, children: React.ReactNode }): React.ReactNode {
	const requirements = React.useMemo(() => pageReadRequirements(page), [page]);
	const decision = useHasEntitlement(requirements);

	if (requirements.length === 0) {
		return children;
	}
	if (decision.isPending) {
		return <LoadingState />;
	}
	if (!decision.allowed) {
		return <Unauthorized missing={decision.missing} />;
	}
	return children;
}
