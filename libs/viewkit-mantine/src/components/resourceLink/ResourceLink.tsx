import { Anchor } from '@mantine/core';
import { Link } from '@nikkierp/ui/components';
import React from 'react';

import { useResourceHref } from '../../data/resourceHref';

import type { ResourceTarget } from '../../data/resourceHref';


export type ResourceLinkProps = ResourceTarget & {
	children: React.ReactNode,
};

/**
 * A link to a resource's list or one of its records, wherever that page lives: an explicit
 * `pathPrefix` when the module implements neighbour proxy pages, else the current module when it
 * serves the route, else the micro-app owning the schema. Renders its children unlinked while the
 * target cannot be resolved.
 */
export function ResourceLink({ children, ...target }: ResourceLinkProps): React.ReactNode {
	const href = useResourceHref(target);
	if (!href) {
		return children;
	}
	return <Anchor component={Link} to={href} mode='append'>{children}</Anchor>;
}
