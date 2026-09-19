import { Paper } from '@mantine/core';
import { LoadingState } from '@nikkierp/ui/components';
import { ExcelDataTable, isActionVisible } from '@nikkierp/ui/components/ExcelDataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import { IconArchive, IconLayoutGrid, IconList, IconPlus, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import React from 'react';

import { buildResourceListActions, listActionCode, selectionModeOf } from './actions';
import classes from './ResourceListV2.module.css';
import { displayedFieldLabelKeys, displayedFieldNames, resolveSchemaField } from '../../data/displayedFields';
import { interpolateParams } from '../../data/interpolate';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useRelatedSchemas } from '../../data/useRelatedSchemas';
import { useResourceBaseHref, useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
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

export const ResourceListV2 = React.memo(ResourceListV2View);

/**
 * The v1 list on the composable table: a sticky panel (toolbar, filter panel, header) over a
 * body wrapper stitched to the window bottom, so the header never scrolls away and the
 * horizontal scrollbar is always reachable.
 */
function ResourceListV2View({ params, routePath }: ResourceListV2ViewProps): React.ReactNode {
	const bgColor = usePaperBgColor();
	const lc = useLocalize(params.translationNs);
	// Both namespaces: the standard action labels live in `common`, while a page's own extra
	// actions name keys in its module. A single namespace leaves one of the two rendering raw keys.
	const t = useTranslate([params.translationNs, 'common']);
	const fieldRenderers = useFieldRenderers(params.fieldRenderers);
	const graph = useResolvedFilterGraph(params.filterGraph);
	const initialRequest = React.useMemo(() => {
		const fields = displayedFieldNames(params.displayed_fields);
		return fields ? { ...INITIAL_REQUEST, fields } : INITIAL_REQUEST;
	}, [params.displayed_fields]);
	const search = useResourceSearch({
		schemaName: params.schemaName, searchCommand: params.searchCommand, initialRequest,
	});
	const { pack, searchData } = search;
	const displayedNames = React.useMemo(() => displayedFieldNames(params.displayed_fields), [params.displayed_fields]);
	const relatedSchemas = useRelatedSchemas(pack?.modelSchema, displayedNames);
	const buildLinkHref = useResourceLinkHref(params.linkField, routePath);
	const baseHref = useResourceBaseHref(routePath);
	const translateFieldName = useTranslateFieldName(params, pack?.modelSchema, relatedSchemas);
	const testId = resourceTestIdPrefix({ testId: params.testId, routePath, schemaName: params.schemaName, part: 'List' });
	const actions = React.useMemo(() => buildResourceListActions(params, t, baseHref), [params, t, baseHref]);
	const gatedActions = useActionLocks(actions, params.schemaName, listActionCode) as ResourceListAction[];

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
				initialSearchRequest={search.searchRequest}
				onSearchRequestChange={search.onSearchRequestChange}
				initialFilterGraph={graph}
				orderBy={getSearchRequestOrderBy(search.searchRequest)}
				initialViewMode={params.viewModes[0].mode}
				updateCommand={params.updateCommand}
				onRefresh={search.refresh}
				translationNs={params.translationNs}
				translateFieldName={translateFieldName}
				buildLinkHref={buildLinkHref}
				fieldRenderers={fieldRenderers}
			>
				<div className={classes.stickyPanel}>
					<ExcelDataTable.Toolbar
						left={(
							<>
								<ExcelDataTable.Title
									render={ctx => lc(pack.modelSchema.label, { count: ctx.data.total })}
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
					<ExcelDataTable.ForViewMode view='list'><ExcelDataTable.TableHeader /></ExcelDataTable.ForViewMode>
				</div>
				<ExcelDataTable.ForViewMode view='list'>
					<ExcelDataTable.Table className={classes.body} />
				</ExcelDataTable.ForViewMode>
			</ExcelDataTable.Provider>
		</Paper>
	);
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
			onClick={closePane}
			testId='closePane'
		/>
	);
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
			command={action.command}
			selectionMode={selectionModeOf(action)}
			testId={action.testId}
			locked={action.locked}
			lockedMissing={action.lockedMissing}
		/>
	);
}

const viewModeIcons: Record<string, React.ReactNode> = {
	list: <IconList size={16} />,
	grid: <IconLayoutGrid size={16} />,
};

function ViewModes({ params }: { params: ResourceListV2Props }): React.ReactNode {
	const t = useTranslate(params.translationNs);
	return (
		<ExcelDataTable.ViewModeButtons>
			{params.viewModes.map(view => (
				<ExcelDataTable.ViewModeButton
					key={view.mode}
					mode={view.mode}
					label={t(view.label)}
					icon={viewModeIcons[view.mode]}
				/>
			))}
		</ExcelDataTable.ViewModeButtons>
	);
}

/**
 * A page-declared label wins; then the schema's own label (or the edge schema's, once loaded);
 * a dotted field whose edge schema is still in flight reads as its own path rather than blank.
 */
function useTranslateFieldName(
	params: ResourceListV2Props,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
): (field: string) => string {
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const labelKeys = React.useMemo(() => displayedFieldLabelKeys(params.displayed_fields), [params.displayed_fields]);
	return React.useCallback((field: string) => {
		if (field === 'fields') {
			return t('model_fields');
		}
		const labelKey = labelKeys[field];
		if (labelKey) {
			return t(labelKey);
		}
		const schemaField = modelSchema
			? resolveSchemaField(modelSchema, field, name => relatedSchemas[name])
			: undefined;
		return schemaField ? lc(schemaField.label) : field;
	}, [labelKeys, lc, modelSchema, relatedSchemas, t]);
}

/** The same `${name}` substitution v1 does, with `${today}` as the one dynamic value a static graph can need. */
function useResolvedFilterGraph(filterGraph: ResourceListV2Props['filterGraph']): dyn.SearchGraph | undefined {
	const today = new Date().toISOString().slice(0, 10);
	return React.useMemo(
		() => (filterGraph === undefined
			? undefined
			: interpolateParams(filterGraph, { today }).value as dyn.SearchGraph),
		[filterGraph, today],
	);
}
