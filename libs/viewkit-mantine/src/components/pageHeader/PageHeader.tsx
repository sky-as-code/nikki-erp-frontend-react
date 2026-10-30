import { Anchor, getSpacing, Group, Stack, Text, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { testAttrs } from '@nikkierp/common/utils';
import { Breadcrumbs, useBreadcrumbsNode } from '@nikkierp/ui/breadcrumbs';
import { TranslatableText } from '@nikkierp/ui/components';
import { toLangJson } from '@nikkierp/ui/components/ExcelDataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';
import { Link } from 'react-router';

import classes from './PageHeader.module.css';
import { PageHeaderContextValue, usePageHeader } from './pageHeaderContext';
import { PinnedBlock } from './PinnedBlock';
import { pageHeaderPropsSchema, PageHeaderLinkSpec, PageHeaderProps, PageHeaderTitleSpec } from './props';
import { edgeDisplay } from '../../data/edgeDisplay';
import { readFieldValue } from '../../data/fieldPaths';
import { useRoutePathHref } from '../../data/useResourceLinkHref';
import { PAGE_HEADER } from '../../ids';
import { useDetailFieldDisplay } from '../../pages/resourceDetailV2/detailFieldDisplay';
import { ResourceUpdateContext } from '../../pages/resourceDetailV2/resourceUpdateContext';
import { renderDisplayFieldValue } from '../fieldValue';

import type { MantineSpacing } from '@mantine/core';
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
	/** Rendered as the header's own row, below the titles. With it, the whole header pins on scroll. */
	actions?: React.ReactNode,
	/** Rendered flush right, opposite the titles. */
	trailing?: React.ReactNode,
	/** Rendered left of the titles, e.g. the record's photo. */
	leading?: React.ReactNode,
	/**
	 * Space below the title row and below the actions row, for a page whose `PageContainer` has no
	 * gap of its own. Inside the pinned block, so the height it reserves includes it.
	 */
	rowSpacing?: MantineSpacing,
	/**
	 * Renders the title row as `Breadcrumbs`: `backLinkTitle` becomes the implicit list parent shown
	 * when nothing precedes the page, `titleLvl1` the last crumb, which also titles the browser tab.
	 * It also registers the page as a breadcrumb node (`useBreadcrumbsNode`); without it the page is none.
	 */
	breadcrumbs?: boolean,
};

/**
 * `data-component` arrives as a prop rather than being hard-coded, because this view is shared:
 * `resource_detail_header` renders it too and must name its own contribution, not this one.
 *
 * Layout is three rows: `{backLinkTitle link} > {titleLvl1}` (or the breadcrumbs, with `breadcrumbs`), then
 * `titleLvl2`, then `actions` alone.
 *
 * A header with actions pins whole (titles, subtitle and actions) as soon as the page scrolls, through
 * `PinnedBlock`. It is `position: fixed`, not sticky, because the view engine's `display: contents`
 * anchors would give a sticky block zero travel. `usePinnedBlock` measures where it goes: the top of
 * the box the page scrolls in, and never above the Shell header, so a pinned ribbon keeps it in sight.
 */
export function PageHeader({
	titleLvl1, titleLvl2, backLinkTitle, actions, trailing, leading, rowSpacing, breadcrumbs, ...attrs
}: PageHeaderViewProps): React.ReactNode {
	const context = usePageHeader();
	const hasTitleRow = Boolean(backLinkTitle) || Boolean(titleLvl1);
	const rowMargin = rowSpacing === undefined ? undefined : getSpacing(rowSpacing);

	return (
		<PinnedBlock enabled={Boolean(actions)}>
			<Group
				gap={4} justify='space-between' align='flex-start' wrap='nowrap' className='w-full' mb={rowSpacing}
				{...attrs}
			>
				<Group gap='md' align='center' wrap='nowrap' className={breadcrumbs ? 'min-w-0 flex-1' : undefined}>
					{leading}
					<Stack gap={4} className={breadcrumbs ? 'min-w-0 flex-1' : undefined}>
						{hasTitleRow && breadcrumbs ? (
							<HeaderBreadcrumbs titleLvl1={titleLvl1} backLinkTitle={backLinkTitle} context={context} />
						) : null}
						{hasTitleRow && !breadcrumbs ? (
							<Group gap='xs' align='center'>
								{backLinkTitle ? <TitleLink spec={backLinkTitle} context={context} /> : null}
								{backLinkTitle && titleLvl1 ? <Text c='dimmed'>{'/'}</Text> : null}
								{titleLvl1 ? (
									<Title order={3}><TitleText spec={titleLvl1} context={context} /></Title>
								) : null}
							</Group>
						) : null}
						{titleLvl2 ? <Text component='div'><TitleText spec={titleLvl2} context={context} /></Text> : null}
					</Stack>
				</Group>
				{trailing}
			</Group>
			{actions ? (
				<div className={classes.actionsRow} style={{ marginBottom: rowMargin }}>{actions}</div>
			) : null}
		</PinnedBlock>
	);
}

type SpecProps<TSpec> = { spec: TSpec, context: PageHeaderContextValue | null };

type HeaderBreadcrumbsProps = Pick<PageHeaderProps, 'titleLvl1' | 'backLinkTitle'> & {
	context: PageHeaderContextValue | null,
};

function HeaderBreadcrumbs({ titleLvl1, backLinkTitle, context }: HeaderBreadcrumbsProps): React.ReactNode {
	const parent = useHeaderParent(backLinkTitle, context);
	useBreadcrumbsNode({ title: useTitleSpecText(titleLvl1, context) });
	// A record title before the record arrives: the crumb shows its skeleton rather than an empty heading.
	const isPending = Boolean(titleLvl1 && 'schemaField' in titleLvl1 && !context?.record);

	return (
		<Breadcrumbs
			lastNodeLabel={titleLvl1 && !isPending ? <TitleText spec={titleLvl1} context={context} /> : undefined}
			rootParent={parent}
			{...testAttrs(context?.testId, 'header', 'breadcrumbs')}
		/>
	);
}

/** What `TitleLink` used to show, as the list the page belongs to; its label defaults to the schema's plural. */
function useHeaderParent(
	spec: PageHeaderLinkSpec | undefined, context: PageHeaderContextValue | null,
): { to: string, label: string } | undefined {
	const t = useTranslate(context?.translationNs ?? '');
	const localize = useLocalize(context?.translationNs ?? '');
	const resolved = useRoutePathHref(spec?.linkHref);
	if (!spec || !resolved) {
		return undefined;
	}
	const label = spec.textKey ? t(spec.textKey) : localize(context?.modelSchema?.label, { count: 99 });
	return label ? { to: resolved, label } : undefined;
}

/** `titleLvl1` as plain text for the browser tab; `undefined` until a record title has a record. */
function useTitleSpecText(
	spec: PageHeaderTitleSpec | undefined, context: PageHeaderContextValue | null,
): string | undefined {
	const t = useTranslate(context?.translationNs ?? '');
	const localize = useLocalize(context?.translationNs ?? '');
	if (!spec) {
		return undefined;
	}
	if ('text' in spec) {
		return spec.text;
	}
	if ('textKey' in spec) {
		return t(spec.textKey, context?.titleParams);
	}
	const value: unknown = context?.record?.[spec.schemaField];
	if (typeof value === 'string' || typeof value === 'number') {
		return String(value);
	}
	return value && typeof value === 'object' ? localize(value as Record<string, string>) || undefined : undefined;
}

function TitleText({ spec, context }: SpecProps<PageHeaderTitleSpec>): React.ReactNode {
	const t = useTranslate(context?.translationNs ?? '');
	const localize = useLocalize(context?.translationNs ?? '');
	const { fieldRenderers } = useDetailFieldDisplay();
	const edgeLabels = React.useContext(ResourceUpdateContext)?.edgeLabels;

	if ('text' in spec) {
		return spec.text;
	}
	if ('textKey' in spec) {
		return t(spec.textKey, context?.titleParams);
	}
	// A foreign key titles the page by the record it points at (an operation type's name), as the
	// read-mode field shows it, never by its id. Plain text: a title is not a link.
	const relation = context?.modelSchema
		? dyn.findRelationBySrcField(context.modelSchema, spec.schemaField)
		: undefined;
	if (relation) {
		const edge = readFieldValue(context?.record, relation.edge) as Record<string, unknown> | null;
		const display = edgeDisplay(relation, edgeLabels?.[relation.edge], edge, undefined);
		if (display.kind !== 'fallback') {
			return typeof display.label === 'object'
				? <TranslatableText langJson={toLangJson(display.label)} />
				: String(display.label);
		}
	}
	// A schema-field title on a page with no record yet renders empty rather than throwing:
	// the header paints before the fetch resolves, every time. An enum value is translated as
	// `{field}.{value}`, or styled by the renderer the detail page declares for the field.
	return renderDisplayFieldValue(
		context?.record?.[spec.schemaField],
		context?.modelSchema?.fields[spec.schemaField],
		localize,
		fieldRenderers?.[spec.schemaField],
		context?.record ?? undefined,
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
