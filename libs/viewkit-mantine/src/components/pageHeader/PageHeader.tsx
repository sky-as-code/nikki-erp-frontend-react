import { Anchor, Group, Stack, Text, Title } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import classes from './PageHeader.module.css';
import { PageHeaderContextValue, usePageHeader } from './pageHeaderContext';
import { pageHeaderPropsSchema, PageHeaderLinkSpec, PageHeaderProps, PageHeaderTitleSpec } from './props';
import { usePinnedToolbar } from './usePinnedToolbar';
import { useRoutePathHref } from '../../data/useResourceLinkHref';
import { PAGE_HEADER } from '../../ids';
import { renderDisplayFieldValue } from '../fieldValue';

import type { ComponentAttributes, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The title block at the top of a page.
 *
 * Child nodes render as the header's action row, which is how a page contributes its own
 * buttons without the header having to know what they do: behaviour cannot survive
 * `JSON.stringify`, so it arrives as a component id whose renderer reads the page's context.
 */
export const pageHeaderRenderer: IComponentRenderer<PageHeaderProps> = {
	type: PAGE_HEADER,
	propsSchema: pageHeaderPropsSchema,
	render(props, runtime) {
		return (
			<PageHeader
				{...props}
				{...componentAttrs(PAGE_HEADER)}
				actions={<MetaComponent node={runtime.children} />}
			/>
		);
	},
};

export type PageHeaderViewProps = PageHeaderProps & Partial<ComponentAttributes> & {
	/** Rendered as the header's own row, below the titles. Sticks to the top of the page on scroll. */
	actions?: React.ReactNode,
	/** Rendered flush right, opposite the titles. */
	trailing?: React.ReactNode,
};

/**
 * `data-component` arrives as a prop rather than being hard-coded, because this view is shared:
 * `resource_detail_header` renders it too and must name its own contribution, not this one.
 *
 * Layout is three rows: `{backLinkTitle link} > {titleLvl1}`, then `titleLvl2`, then `actions`
 * alone.
 *
 * The titles and the actions row are **siblings, not nested in a shared wrapper**, and that is
 * load-bearing. `actions` is `position: sticky`, and a sticky element is clamped to its parent's
 * box — wrapping both rows in one `Stack` would make that parent end where the header ends, giving
 * the toolbar zero travel and scrolling it away with the titles. As direct children of the page's
 * scroll container (`PageContainer`, which emits the only scrolling box on the page), the sticky
 * row's containing block is the full page instead, so it stays pinned to the top for as long as
 * there is anything left to scroll.
 */
export function PageHeader({
	titleLvl1, titleLvl2, backLinkTitle, actions, trailing, ...attrs
}: PageHeaderViewProps): React.ReactNode {
	const context = usePageHeader();
	const hasTitleRow = Boolean(backLinkTitle) || Boolean(titleLvl1);
	const toolbar = usePinnedToolbar(Boolean(actions));

	return (
		<>
			<Group
				ref={toolbar.sentinelRef}
				gap={4} justify='space-between' align='flex-start' wrap='nowrap' className='w-full'
				{...attrs}
			>
				<Stack gap={4}>
					{hasTitleRow ? (
						<Group gap='xs' align='center'>
							{backLinkTitle ? <TitleLink spec={backLinkTitle} context={context} /> : null}
							{backLinkTitle && titleLvl1 ? <Text c='dimmed'>{'>'}</Text> : null}
							{titleLvl1 ? (
								<Title order={3}><TitleText spec={titleLvl1} context={context} /></Title>
							) : null}
						</Group>
					) : null}
					{titleLvl2 ? <Text><TitleText spec={titleLvl2} context={context} /></Text> : null}
				</Stack>
				{trailing}
			</Group>
			{actions ? (
				<>
					<div
						ref={toolbar.rowRef}
						className={clsx(classes.actionsRow, { [classes.pinned]: toolbar.isPinned })}
						style={toolbar.isPinned ? toolbar.pinnedStyle : undefined}
					>
						{actions}
					</div>
					{/* Reserves the row's height once it leaves the flow, so the content below does
					    not jump up by exactly that much at the moment it pins. */}
					{toolbar.isPinned ? (
						<div className={classes.pinnedSpacer} style={{ height: toolbar.placeholderHeight }} />
					) : null}
				</>
			) : null}
		</>
	);
}

type SpecProps<TSpec> = { spec: TSpec, context: PageHeaderContextValue | null };

function TitleText({ spec, context }: SpecProps<PageHeaderTitleSpec>): React.ReactNode {
	const t = useTranslate(context?.translationNs ?? '');

	if ('textKey' in spec) {
		return t(spec.textKey, context?.titleParams);
	}
	// A schema-field title on a page with no record yet renders empty rather than throwing:
	// the header paints before the fetch resolves, every time.
	return renderDisplayFieldValue(
		context?.record?.[spec.schemaField],
		context?.modelSchema?.fields[spec.schemaField],
	);
}

/**
 * Defaults to the model schema's plural label, so a resource detail page links back to its list
 * without repeating the resource name in every page definition.
 */
function TitleLink({ spec, context }: SpecProps<PageHeaderLinkSpec>): React.ReactNode {
	const t = useTranslate(context?.translationNs ?? '');
	const localize = useLocalize(context?.translationNs ?? '');
	// A `linkHref` naming a page (`'kiosks/:id'`) resolves absolutely, filling its params from the
	// current route; the `'../'` spelling every resource detail uses keeps React Router's own
	// path-relative resolution. `useRoutePathHref` returns the latter untouched.
	const resolved = useRoutePathHref(spec.linkHref);
	const label = spec.textKey ? t(spec.textKey) : localize(context?.modelSchema?.label, { count: 99 });

	if (!label || !resolved) {
		return null;
	}

	return (
		<Anchor
			component={Link} to={resolved} relative='path' size='md' className='capitalize'
			{...testAttrs(context?.testId, 'header', 'titleLink')}
		>
			{label}
		</Anchor>
	);
}
