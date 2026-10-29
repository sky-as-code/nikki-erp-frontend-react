import { Paper } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Breadcrumbs, normalizePath, readNavMode, useBreadcrumbsNode } from '@nikkierp/ui/breadcrumbs';
import { LoadingState, Unauthorized } from '@nikkierp/ui/components';
import { ExcelDataTable, isActionVisible, mergeSearchGraphs } from '@nikkierp/ui/components/ExcelDataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import { MetaComponent, useFieldRenderers } from '@nikkierp/viewengine/render';
import {
	IconArchive, IconLayoutGrid, IconList, IconPlus, IconTrash, IconUpload, IconX,
} from '@tabler/icons-react';
import React from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { buildResourceListActions, listActionCode, listRowUpdateProps, selectionModeOf } from './actions';
import classes from './ResourceListV2.module.css';
import { getViewModeIcon } from './viewModeIcons';
import { interpolateParams } from '../../data/interpolate';
import { parseSearchGraphParam } from '../../data/searchGraphParam';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceBaseHref, useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { useTableRelatedSchemas, useTranslateFieldName } from '../../data/useTableFieldLabels';
import { EXCEL_DATA_TABLE_BODY } from '../../ids';
import { useActionLocks } from '../../permissions';
import { resourceTestIdPrefix } from '../../testIds';
import { useClosePrimaryPane } from '../resourceSplitView/splitViewContext';


import type { ResourceListAction } from './actions';
import type { ResourceListV2Props } from './props';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type ResourceListV2ViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceListV2Props,
	/** View-engine page segment (e.g. `users`); detail URLs are `/:orgSlug/:moduleSlug/{routePath}/:id`. */
	routePath: string,
};

const INITIAL_REQUEST = { page: 0, size: 0, search_name: 'default' };
/** A link's search graph that seeds the filter panel (see `useUrlSearchGraph`). */
const URL_GRAPH_PARAM = 'initialGraph';

export const ResourceListV2 = React.memo(ResourceListV2Seeded);

/**
 * The table reads its `initialGraph` seed once, on mount, so a link opening this same list with
 * another seed (the ribbon's Receipts, then Deliveries, then All) remounts the view to re-seed it.
 */
function ResourceListV2Seeded(props: ResourceListV2ViewProps): React.ReactNode {
	return <ResourceListV2View key={useUrlGraphSeedKey(props.routePath)} {...props} />;
}

/**
 * Changes when a navigation brings a new `?initialGraph=`, or none at all from a menu (a history
 * root) to the list's own path. Opening a row drops the query string too, but neither from a menu
 * nor onto the list path, so the list keeps its filters; so does a Create, which goes to `new`.
 */
function useUrlGraphSeedKey(routePath: string): string {
	const location = useLocation();
	const raw = new URLSearchParams(location.search).get(URL_GRAPH_PARAM);
	const [key, setKey] = React.useState(raw ?? '');
	const ontoList = location.pathname.replace(/\/+$/, '').endsWith(`/${routePath}`);
	const next = raw ?? (ontoList && readNavMode(location.state) === 'root' ? '' : key);
	if (next !== key) {
		// Derived during render, so the stale seed never paints.
		setKey(next);
	}
	return next;
}

/**
 * The v1 list on the composable table: a sticky panel (toolbar, filter panel, header) over a
 * body wrapper stitched to the window bottom, so the header never scrolls away and the
 * horizontal scrollbar is always reachable.
 */
function ResourceListV2View({ params, routePath }: ResourceListV2ViewProps): React.ReactNode {
	const bgColor = usePaperBgColor();
	const listTitle = useListTitle(params);
	// Both namespaces: the standard action labels live in `common`, while a page's own extra
	// actions name keys in its module. A single namespace leaves one of the two rendering raw keys.
	const t = useTranslate([params.translationNs, 'common']);
	const fieldRenderers = useFieldRenderers(params.fieldRenderers);
	const pageGraph = useResolvedInitialGraph(params.initialGraph);
	// Seeds the table with `userRequest` below, or the static graph would echo back as an editable condition.
	const staticGraph = useResolvedInitialGraph(params.staticGraph);
	const urlGraph = useUrlSearchGraph();
	// ANDed rather than substituted: a link that narrows the list must not silently widen past
	// the scope the page itself declared. Both halves stay editable in the panel.
	const graph = React.useMemo(() => mergeSearchGraphs(pageGraph, urlGraph), [pageGraph, urlGraph]);
	// No `fields`: the columns are the backend's `default_search_fields`, or the user's own choice
	// from the table settings, never the page's.
	const search = useResourceSearch({
		schemaName: params.schemaName, searchCommand: params.searchCommand, initialRequest: INITIAL_REQUEST,
		withEdgeLabels: true, baseGraph: staticGraph,
	});
	const { pack, searchData } = search;
	const relatedSchemas = useTableRelatedSchemas(
		pack?.modelSchema, searchData?.desired_fields,
	);
	const buildLinkHref = useResourceLinkHref(params.linkField, routePath);
	const baseHref = useResourceBaseHref(routePath);
	const translateFieldName = useTranslateFieldName(params.translationNs, pack?.modelSchema, relatedSchemas);
	const testId = resourceTestIdPrefix({ testId: params.testId, routePath, schemaName: params.schemaName, part: 'List' });
	const actions = React.useMemo(() => buildResourceListActions(params, t, baseHref), [params, t, baseHref]);
	const allowedViewModes = React.useMemo(() => params.viewModes.map(view => view.mode), [params.viewModes]);
	const gatedActions = useActionLocks(actions, params.schemaName, listActionCode);

	if (search.refused) {
		return <Unauthorized missing={search.refused} />;
	}
	if (!pack || !searchData) {
		return <LoadingState />;
	}
	return (
		<Paper className='absolute inset-0 p-0 m-0 flex flex-col' bg={bgColor}>
			<ExcelDataTable.Provider
				testId={testId}
				tableName={params.schemaName}
				modelSchema={pack.modelSchema}
				relatedSchemas={relatedSchemas}
				data={searchData}
				isLoading={search.isPending}
				initialSearchRequest={search.userRequest}
				onSearchRequestChange={search.onSearchRequestChange}
				initialGraph={graph}
				orderBy={getSearchRequestOrderBy(search.searchRequest)}
				initialViewMode={params.viewModes[0].mode}
				allowedViewModes={allowedViewModes}
				{...listRowUpdateProps(params)}
				editableFields={params.editableFields}
				enableHotKeys={params.enableHotKeys}
				onRefresh={search.refresh}
				translationNs={params.translationNs}
				translateFieldName={translateFieldName}
				// No `linkField` means no detail page: cells must not link, or a click would reload the
				// list without its URL graph.
				buildLinkHref={params.linkField ? buildLinkHref : undefined}
				fieldRenderers={fieldRenderers}
			>
				<div className={classes.stickyPanel}>
					<ListBreadcrumbs params={params} schema={pack.modelSchema} listPath={baseHref} testId={testId} />
					<ExcelDataTable.Toolbar
						left={(
							<>
								<ExcelDataTable.Title
									render={ctx => listTitle(pack.modelSchema, ctx.data.total)}
								/>
								<ExcelDataTable.Actions><ListActions actions={gatedActions} /></ExcelDataTable.Actions>
							</>
						)}
						right={(
							<>
								<ExcelDataTable.FilterButton />
								<ExcelDataTable.Pagination />
								{params.viewModes.length > 1 ? <ViewModes params={params} /> : null}
								<ExcelDataTable.SettingsButton />
								<ClosePaneButton />
							</>
						)}
					/>
					<ExcelDataTable.FilterPanel />
					<ViewModeHeaders viewModes={params.viewModes} />
				</div>
				<ViewModeBodies viewModes={params.viewModes} />
			</ExcelDataTable.Provider>
		</Paper>
	);
}

/**
 * The column header, wherever the table body is declared.
 *
 * Gated per mode rather than on the first one: a page whose leading mode is a card must not draw
 * a header, and one that offers the table second still needs it.
 */
function ViewModeHeaders({ viewModes }: { viewModes: ResourceListV2Props['viewModes'] }): React.ReactNode {
	return viewModes
		.filter(view => view.viewkitComponent?.component === EXCEL_DATA_TABLE_BODY)
		.map(view => (
			<ExcelDataTable.ForViewMode key={view.mode} view={view.mode}>
				<ExcelDataTable.TableHeader />
			</ExcelDataTable.ForViewMode>
		));
}

/**
 * Each mode's body, rendered from the node it declares.
 *
 * `MetaComponent` renders nothing for a mode that names no component, which is the "slot the page
 * fills later" case rather than an error.
 */
function ViewModeBodies({ viewModes }: { viewModes: ResourceListV2Props['viewModes'] }): React.ReactNode {
	return viewModes.map(view => (
		<ExcelDataTable.ForViewMode key={view.mode} view={view.mode}>
			<MetaComponent node={view.viewkitComponent} />
		</ExcelDataTable.ForViewMode>
	));
}

/**
 * Keys by position, not by identity. Neither `testId` nor `command` is unique: a page may repeat a
 * command in `extraActions` that a standard action already carries — `iam_user` lists delete in
 * both — and an href-only entry has no command at all, which would key every one of them
 * `undefined`. The list is rebuilt wholesale on every render, so position is stable enough.
 */
function actionKey(action: ResourceListAction, index: number): string {
	return `${index}:${action.testId ?? action.command ?? action.href ?? action.kind}`;
}

/**
 * Closes the list pane when this list sits beside a detail pane.
 *
 * It lives in the toolbar rather than floating over the pane's corner so it reads as one of the
 * table's controls and carries their styling. Renders nothing outside a split view, and nothing
 * while the list is the only pane — closing it would leave the view empty.
 */
function ClosePaneButton(): React.ReactNode {
	const { closePane, closeLabel } = useClosePrimaryPane();
	if (!closePane) {
		return null;
	}
	return (
		<ExcelDataTable.Action
			label={closeLabel ?? ''}
			icon={<IconX size={16} />}
			iconOnly
			// Borderless, to match the detail pane's own close button.
			variant='subtle'
			onClick={closePane}
			testId='closePane'
		/>
	);
}

type ListBreadcrumbsProps = {
	params: ResourceListV2Props,
	schema: dyn.ModelSchema,
	listPath: string | undefined,
	testId: string | undefined,
};

/**
 * Where the user came from, above the toolbar: the toolbar title already names this list, so the
 * list's own node is hidden. It titles the tab only while the list is the page: in a split view
 * the record beside it owns the title.
 */
function ListBreadcrumbs({ params, schema, listPath, testId }: ListBreadcrumbsProps): React.ReactNode {
	const listTitle = useListTitle(params);
	const { pathname } = useLocation();
	const isCurrentPage = Boolean(listPath) && normalizePath(pathname) === normalizePath(listPath!);
	useBreadcrumbsNode({
		title: listTitle(schema, 99) || undefined,
		capitalizeTitle: true, nodePath: listPath, enabled: isCurrentPage,
	});
	return listPath ? <Breadcrumbs hideLastNode nodePath={listPath} {...testAttrs(testId, 'breadcrumbs')} /> : null;
}

function ListActions({ actions }: { actions: ResourceListAction[] }): React.ReactNode {
	const { selection } = ExcelDataTable.useContext();
	const inline = actions.filter(action => !action.collapsed);
	const collapsed = actions.filter(action => action.collapsed);
	// Each entry hides itself for the current selection, so the `[...]` menu can be empty — on a
	// page whose only collapsed entry is archive, that is the ordinary state with nothing selected.
	const hasVisibleItems = collapsed.some(
		action => isActionVisible(selectionModeOf(action), selection.ids.length),
	);
	return (
		<>
			{inline.map((action, index) => <ListAction key={actionKey(action, index)} action={action} />)}
			{collapsed.length > 0 ? (
				<ExcelDataTable.CollapsedActions hasVisibleItems={hasVisibleItems}>
					{collapsed.map((action, index) => <ListAction key={actionKey(action, index)} action={action} />)}
				</ExcelDataTable.CollapsedActions>
			) : null}
		</>
	);
}

/**
 * Icons for the actions this template builds itself. Keyed by `testId` rather than by label, which
 * is translated, or by command, which is per-schema. A page's own extra actions get no icon — the
 * template cannot guess one — and render as text alone, which `Action` handles.
 */
const listActionIcons: Record<string, React.ReactNode> = {
	create: <IconPlus size={16} />,
	import: <IconUpload size={16} />,
	delete: <IconTrash size={16} />,
	archive: <IconArchive size={16} />,
};

function ListAction({ action }: { action: ResourceListAction }): React.ReactNode {
	if (action.kind === 'refresh') {
		return <ExcelDataTable.ActionRefresh />;
	}
	return (
		<ExcelDataTable.Action
			label={action.label ?? ''}
			icon={action.testId ? listActionIcons[action.testId] : undefined}
			href={action.href}
			isHistoryRoot={action.isHistoryRoot}
			command={action.command}
			selectionMode={selectionModeOf(action)}
			testId={action.testId}
			locked={action.locked}
			lockedMissing={action.lockedMissing}
		/>
	);
}

/**
 * Icons for the modes this template defines itself.
 *
 * `list` is the default every page gets without declaring anything, so its icon cannot come from
 * a page's `getViewModes` — there may not be one. A page's own icon still wins.
 */
const builtinViewModeIcons: Record<string, React.ReactNode> = {
	list: <IconList size={16} />,
	grid: <IconLayoutGrid size={16} />,
};

function ViewModes({ params }: { params: ResourceListV2Props }): React.ReactNode {
	const t = useTranslate(params.translationNs);
	return (
		<ExcelDataTable.ViewModeButtons>
			{/*
			  * `ViewModeButton` has to stay the direct child: the compact fold collects its options
			  * by matching `child.type`, so a wrapper element here would silently drop the mode
			  * from the dropdown on a narrow screen.
			  */}
			{params.viewModes.map(view => (
				<ExcelDataTable.ViewModeButton
					key={view.mode}
					mode={view.mode}
					label={t(view.label)}
					icon={getViewModeIcon(view.iconToken) ?? builtinViewModeIcons[view.mode]}
				/>
			))}
		</ExcelDataTable.ViewModeButtons>
	);
}

/** The list's title for `count` records: the page's own `label` key, else the schema label. */
function useListTitle(params: ResourceListV2Props): (schema: dyn.ModelSchema, count: number) => string {
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	return React.useCallback((schema, count) => {
		if (params.label) {
			return t(params.label, { count });
		}
		return schema.label ? lc(schema.label, { count }) : '';
	}, [params.label, lc, t]);
}

/**
 * The `initialGraph` search graph carried in the URL, for a link that opens the list pre-filtered.
 *
 * Read once per navigation and then owned by the filter panel: it seeds the conditions rather
 * than constraining them, so the user may edit or drop any of it.
 */
function useUrlSearchGraph(): dyn.SearchGraph | undefined {
	const [searchParams] = useSearchParams();
	return React.useMemo(
		() => parseSearchGraphParam(searchParams.get(URL_GRAPH_PARAM)),
		[searchParams],
	);
}

/** The same `${name}` substitution v1 does, with `${today}` as the one dynamic value a static graph can need. */
function useResolvedInitialGraph(initialGraph: ResourceListV2Props['initialGraph']): dyn.SearchGraph | undefined {
	const today = new Date().toISOString().slice(0, 10);
	return React.useMemo(
		() => (initialGraph === undefined
			? undefined
			: interpolateParams(initialGraph, { today }).value as dyn.SearchGraph),
		[initialGraph, today],
	);
}
