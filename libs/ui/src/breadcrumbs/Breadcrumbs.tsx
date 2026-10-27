import { Anchor, Skeleton, Text } from '@mantine/core';
import { capitalizeWords } from '@nikkierp/common/utils';
import clsx from 'clsx';
import React from 'react';
import { resolvePath, useLocation } from 'react-router-dom';

import classes from './Breadcrumbs.module.css';
import { BreadcrumbsCollapsedNode } from './BreadcrumbsCollapsedNode';
import { buildCrumbs, collapseCrumbs, effectiveNodeLimits } from './buildCrumbs';
import { useNavTrail, useSetNodeInfo } from './NavHistoryProvider';
import { normalizePath } from './trail';
import { useIsCompact, useMeasuredWidth } from '../components/ExcelDataTable/useIsCompact';
import { Link } from '../components/Link/Link';

import type { Crumb } from './buildCrumbs';


export type BreadcrumbsFontSize = 'body' | 'h2' | 'h3' | 'h4';

export type BreadcrumbsProps = {
	separator?: string,
	/**
	 * Items displayed, `(...)` and the last crumb included; older crumbs fold into `(...)`. Below 2 falls
	 * back to 5; a parent under 768px uses 2 (`(...) / Last`).
	 */
	nodeLimits?: number,
	/** Not applied inside the `(...)` dropdown. */
	linkNodeFontSize?: BreadcrumbsFontSize,
	lastNodeFontSize?: BreadcrumbsFontSize,
	/** Shows only the nodes before the page, e.g. above a list whose own title names the page. */
	hideLastNode?: boolean,
	/** The current page's name; defaults to the label `useBreadcrumbsNode` registered. */
	lastNodeLabel?: React.ReactNode,
	/** The page's own node when it is not the pathname, e.g. the list pane of a split view. */
	nodePath?: string,
	/**
	 * The list a detail page belongs to, shown before it when nothing else is: `Brands / Brand B`
	 * on a pasted URL. `to` resolves path-relative to the page, like the old back link did. Its label
	 * is a list name, capitalised like the list's own title.
	 */
	rootParent?: { to: string, label?: string },
	className?: string,
	'data-testid'?: string,
};

/**
 * The page's position in the navigation trail; the last crumb is the page title, plain text.
 * Renders nothing when there is no crumb to show (`hideLastNode` on a one-node trail).
 */
export function Breadcrumbs({
	separator = '/', nodeLimits, linkNodeFontSize = 'body', lastNodeFontSize = 'h3', hideLastNode, lastNodeLabel,
	nodePath, rootParent, className, ...attrs
}: BreadcrumbsProps): React.ReactNode {
	const location = useLocation();
	const trail = useNavTrail();
	const ownPath = normalizePath(nodePath ?? location.pathname);
	const parent = useRootParent(ownPath, rootParent);
	const [width, setWidth] = React.useState<number | null>(null);
	const measureRef = useMeasuredWidth(setWidth);
	const isCompact = useIsCompact(width);

	const crumbs = buildCrumbs({ trail, nodePath: ownPath, lastNodeLabel, rootParent: parent, hideLastNode });
	if (crumbs.length === 0) {
		return null;
	}
	const { collapsed, shown } = collapseCrumbs(crumbs, effectiveNodeLimits(nodeLimits, isCompact));
	const lastIndex = hideLastNode ? -1 : shown.length - 1;

	return (
		<nav ref={measureRef} aria-label='breadcrumb' className={clsx(classes.root, className)} {...attrs}>
			{collapsed.length > 0 ? <BreadcrumbsCollapsedNode crumbs={collapsed} /> : null}
			{shown.map((crumb, i) => (
				<React.Fragment key={crumb.key}>
					{i > 0 || collapsed.length > 0 ? <Text component='span' className={classes.separator}>{separator}</Text> : null}
					{i === lastIndex
						? <LastNode crumb={crumb} fontSize={lastNodeFontSize} />
						: <LinkNode crumb={crumb} fontSize={linkNodeFontSize} />}
				</React.Fragment>
			))}
		</nav>
	);
}

function useRootParent(ownPath: string, rootParent: BreadcrumbsProps['rootParent']): { path: string, label?: string } | undefined {
	const setNodeInfo = useSetNodeInfo();
	const parentTo = rootParent?.to;
	const parentLabel = rootParent?.label;
	// Resolved against the node, not the route match, so `'../'` means "the list above this record"
	// wherever in the route tree the header renders.
	const parent = React.useMemo(() => (
		parentTo === undefined
			? undefined
			: {
				path: normalizePath(resolvePath(parentTo, ownPath).pathname),
				label: parentLabel && capitalizeWords(parentLabel),
			}
	), [parentTo, parentLabel, ownPath]);

	React.useEffect(() => {
		if (parent?.label) {
			setNodeInfo?.(ownPath, { parent });
		}
	}, [ownPath, parent, setNodeInfo]);
	return parent;
}

function fontStyle(size: BreadcrumbsFontSize): React.CSSProperties {
	if (size === 'body') {
		return { fontSize: 'var(--mantine-font-size-md)' };
	}
	return {
		fontSize: `var(--mantine-${size}-font-size)`,
		lineHeight: `var(--mantine-${size}-line-height)`,
		fontWeight: `var(--mantine-${size}-font-weight)` as React.CSSProperties['fontWeight'],
	};
}

function CrumbLabel({ crumb }: { crumb: Crumb }): React.ReactNode {
	return crumb.label ?? <Skeleton component='span' display='inline-block' height='0.8em' width={80} />;
}

function LinkNode({ crumb, fontSize }: { crumb: Crumb, fontSize: BreadcrumbsFontSize }): React.ReactNode {
	return (
		<Anchor
			component={Link} to={crumb.href ?? '.'} isHistoryRoot={crumb.isHistoryRoot}
			className={clsx(classes.node, classes.link)}
			style={fontStyle(fontSize)} title={typeof crumb.label === 'string' ? crumb.label : undefined}
			data-testid={crumb.isHistoryRoot ? 'breadcrumbs.parent' : 'breadcrumbs.link'}
		>
			<CrumbLabel crumb={crumb} />
		</Anchor>
	);
}

function LastNode({ crumb, fontSize }: { crumb: Crumb, fontSize: BreadcrumbsFontSize }): React.ReactNode {
	return (
		<Text
			component={fontSize === 'body' ? 'span' : fontSize} aria-current='page'
			className={classes.node} style={fontStyle(fontSize)}
			data-testid='breadcrumbs.last'
		>
			<CrumbLabel crumb={crumb} />
		</Text>
	);
}
