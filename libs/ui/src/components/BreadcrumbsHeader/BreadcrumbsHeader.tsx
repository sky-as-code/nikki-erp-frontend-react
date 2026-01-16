import { Breadcrumbs, Group, Typography } from '@mantine/core';
import React from 'react';
import { Link, useLocation } from 'react-router';


export interface BreadcrumbItem {
	title: string;
	path: string;
}

export interface BreadcrumbSegment {
	key: string;
	title: string;
}

export interface BreadcrumbsHeaderProps {
	currentTitle: string;
	items?: BreadcrumbItem[];
	/**
	 * If true, automatically build breadcrumbs from pathname by finding the specified segment.
	 * For example, if segmentKey is "actions", it will find "/org/module/actions" and create a breadcrumb.
	 */
	autoBuild?: boolean;
	/**
	 * The segment key to look for when auto-building breadcrumbs (e.g., "actions", "users", etc.)
	 * @deprecated Use segmentKeys instead for multiple layers
	 */
	segmentKey?: string;
	/**
	 * Array of segment keys to build multiple breadcrumb layers.
	 * Each segment will be found in order and create a breadcrumb.
	 * Example: [{ key: "roles", title: "Roles" }, { key: "roleId", title: "Role Detail" }]
	 */
	segmentKeys?: BreadcrumbSegment[];
	/**
	 * The title to use for the auto-built parent breadcrumb
	 * @deprecated Use segmentKeys instead
	 */
	parentTitle?: string;
	/**
	 * Custom style for the Breadcrumbs container
	 */
	breadcrumbsStyle?: React.CSSProperties;
}

/**
 * Generic breadcrumbs header component that can be used anywhere.
 * Supports both manual breadcrumb items and automatic breadcrumb building from pathname.
 */
export const BreadcrumbsHeader: React.FC<BreadcrumbsHeaderProps> = ({
	currentTitle,
	items,
	autoBuild = false,
	segmentKey,
	segmentKeys,
	parentTitle,
	breadcrumbsStyle = { minWidth: '30%' },
}) => {
	const location = useLocation();

	// Build breadcrumbs from pathname if autoBuild is enabled
	const buildBreadcrumbs = React.useMemo(() => {
		// If items are provided, use them
		if (items && items.length > 0) {
			return items;
		}

		// If autoBuild is enabled, try to build from pathname
		if (autoBuild) {
			const pathSegments = location.pathname.split('/').filter(Boolean);
			const breadcrumbItems: BreadcrumbItem[] = [];

			// Support multiple segmentKeys for nested breadcrumbs (e.g., roles > role detail > add entitlements)
			if (segmentKeys && segmentKeys.length > 0) {
				let lastFoundIndex = -1;
				for (const segment of segmentKeys) {
					// Find the segment starting from after the last found index
					const segmentIndex = pathSegments.findIndex(
						(seg, idx) => idx > lastFoundIndex && seg === segment.key,
					);

					if (segmentIndex >= 0) {
						// Build path to this segment by taking all segments up to and including it
						const segmentPath = '/' + pathSegments.slice(0, segmentIndex + 1).join('/');
						breadcrumbItems.push({
							title: segment.title,
							path: segmentPath,
						});
						lastFoundIndex = segmentIndex;
					}
				}
			}
			// Fallback to single segmentKey for backward compatibility
			else if (segmentKey) {
				const segmentIndex = pathSegments.findIndex((seg) => seg === segmentKey);

				if (segmentIndex >= 0) {
					// Build path to parent by taking all segments up to and including the segmentKey
					const parentPath = '/' + pathSegments.slice(0, segmentIndex + 1).join('/');
					breadcrumbItems.push({
						title: parentTitle || segmentKey,
						path: parentPath,
					});
				}
			}

			return breadcrumbItems;
		}

		return [];
	}, [location.pathname, items, autoBuild, segmentKey, segmentKeys, parentTitle]);

	return (
		<Group>
			<Breadcrumbs style={breadcrumbsStyle}>
				{buildBreadcrumbs.map((item) => (
					<Typography key={item.path}>
						<h4>
							<Link to={item.path}>
								{item.title}
							</Link>
						</h4>
					</Typography>
				))}
				<Typography>
					<h5>{currentTitle}</h5>
				</Typography>
			</Breadcrumbs>
		</Group>
	);
};

