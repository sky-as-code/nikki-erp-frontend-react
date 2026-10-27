import { Anchor, Menu } from '@mantine/core';
import React from 'react';

import classes from './Breadcrumbs.module.css';
import { Link } from '../components/Link/Link';

import type { Crumb } from './buildCrumbs';


/** The `(...)` crumb: the nodes before the visible ones, as a dropdown of plain-size links. */
export function BreadcrumbsCollapsedNode({ crumbs }: { crumbs: Crumb[] }): React.ReactNode {
	return (
		<Menu position='bottom-start' withinPortal>
			<Menu.Target>
				<Anchor component='button' type='button' className={classes.collapsed} data-testid='breadcrumbs.collapsed'>
					{'(...)'}
				</Anchor>
			</Menu.Target>
			<Menu.Dropdown>
				{crumbs.map(crumb => (
					<Menu.Item
						key={crumb.key} component={Link} to={crumb.href ?? '.'} isHistoryRoot={crumb.isHistoryRoot}
					>
						{crumb.label}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}
