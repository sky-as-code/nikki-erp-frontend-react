import * as dyn from '@nikkierp/common/dynamicModel';
import { LoadingState } from '@nikkierp/ui/components';
import { DataTable, DataTableAction } from '@nikkierp/ui/components/DataTable';
import { TranslateFn, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor, useFieldRenderers } from '@nikkierp/viewengine/render';
import React from 'react';
import { useParams } from 'react-router-dom';

import { resourceTablePropsSchema, ResourceTableAction, ResourceTableProps } from './props';
import { interpolateParams, InterpolateResult } from '../../data/interpolate';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { RESOURCE_TABLE } from '../../ids';
import { resourceTestIdPrefix } from '../../testIds';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceTableRenderer: IComponentRenderer<ResourceTableProps> = {
	type: RESOURCE_TABLE,
	propsSchema: resourceTablePropsSchema,
	render(props) {
		// Anchored rather than attributed on the bounded box below, so the attribute is also there
		// while the search is still loading.
		return (
			<ComponentAnchor id={RESOURCE_TABLE}>
				<ResourceTable params={props} />
			</ComponentAnchor>
		);
	},
};

function ResourceTable({ params }: { params: ResourceTableProps }): React.ReactNode {
	const graph = useInterpolatedGraph(params.filterGraph);
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const fieldRenderer = useFieldRenderers(params.fieldRenderers);
	const initialRequest = useInitialRequest(params);
	const commandBus = useCommandBus();

	const { pack, searchData, searchRequest, onSearchRequestChange, refresh } = useResourceSearch({
		schemaName: params.schemaName,
		searchCommand: params.searchCommand,
		initialRequest,
		baseGraph: graph.value,
	});
	const buildLinkHref = useResourceLinkHref(params.linkField, params.linkRoutePath);
	// No `routePath` of its own: an embedded table is identified by the schema it lists, which is
	// unique within its host page unless the author embeds two — hence the explicit `testId` escape.
	const testId = resourceTestIdPrefix({
		testId: params.testId, schemaName: params.schemaName, part: 'Table',
	});

	const actions = React.useMemo(
		() => buildResourceTableActions(params.extraActions, t, commandBus, refresh),
		[params.extraActions, t, commandBus, refresh],
	);

	if (!pack || !searchData || graph.missing.length > 0) {
		return <LoadingState />;
	}

	return (
		// Bounded box: unlike the list page this is embedded, so it must not go full-bleed.
		<div className='max-h-[480px] overflow-auto'>
			<DataTable
				testId={testId}
				tableName={lc(pack.modelSchema.label, { count: searchData.total })}
				data={searchData}
				initialSearchRequest={searchRequest}
				modelSchema={pack.modelSchema}
				onSearchRequestChange={onSearchRequestChange}
				fieldRenderer={fieldRenderer}
				buildLinkHref={buildLinkHref}
				actions={actions}
				sortableFields={searchData.desired_fields}
				orderBy={getSearchRequestOrderBy(searchRequest)}
				translationNs={params.translationNs}
				translateFieldName={(field: string) => lc(pack.modelSchema.fields[field]?.label)}
			/>
		</div>
	);
}

type RunCommand = (command: string) => (selectedItems: Record<string, unknown>[]) => void;

/**
 * Refresh first, then the page-authored extras — the same shape as `buildResourceActions()` on the
 * list page, minus create/delete/archive: an embedded table lists records that belong to another
 * resource, so the standard CRUD actions are not the enclosing page's to offer.
 *
 * `DataTable`'s toolbar renders only the first two actions without `requireSelection` as buttons
 * and collapses the rest into the overflow menu, so a third default action here pushes one in.
 */
function buildResourceTableActions(
	extraActions: ResourceTableAction[],
	t: TranslateFn,
	commandBus: ReturnType<typeof useCommandBus>,
	refreshSearch: () => void,
): DataTableAction[] {
	const runCommand: RunCommand = command => selectedItems => {
		const ids = selectedItems.map(item => item.id).filter(Boolean) as string[];
		void commandBus.publish({ name: command, payload: { ids } }).then(refreshSearch);
	};

	const actions: DataTableAction[] = [{
		label: t('action.refresh'), testId: 'refresh', onTrigger: () => refreshSearch(),
	}];
	return actions.concat(extraActions.map(action => toDataTableAction(action, t, runCommand)));
}

function toDataTableAction(action: ResourceTableAction, t: TranslateFn, runCommand: RunCommand): DataTableAction {
	if (action.routePath) {
		// `ActionButton` renders `href` as a path-relative `<Link>`, so `'roles'` on
		// `/{org}/{module}/users/:id` resolves to `/{org}/{module}/users/:id/roles`.
		// A link action publishes no command, so the route names it rather than its translated label.
		//
		// Note this is an *append* to the current URL, not a page `routePath`: the sibling
		// `resourceDetail` contextual action names its target page outright and resolves it
		// through `useRoutePathHref`. Both spellings are deliberate -- a table sits inside the
		// record it links out of, so appending is what it means, while a detail action may
		// target any page in the module.
		return { label: t(action.label), href: action.routePath, testId: action.testId ?? action.routePath };
	}
	// The schema guarantees exactly one of `command` / `routePath`, so this branch always has one.
	const command = action.command ?? '';
	return {
		label: t(action.label),
		command,
		supportMultiple: action.supportMultiple,
		requireSelection: action.requireSelection,
		testId: action.testId,
		onTrigger: runCommand(command),
	};
}

function useInitialRequest(params: ResourceTableProps): dyn.RestSearchRequest {
	return React.useMemo(() => ({
		page: 0,
		size: params.pageSize,
		search_name: params.searchName,
		fields: params.fields,
	}), [params.pageSize, params.searchName, params.fields]);
}

/**
 * `useParams()` returns a fresh object every render, so the memo is keyed on a
 * serialised form and re-parses it — keying on the object itself would rebuild
 * the graph every render and refetch forever.
 *
 * The result is additionally keyed on the interpolated graph's *value*: consumers
 * feed it straight into the published search request, and `interpolateParams`
 * allocates a new object per recompute, so identity alone would republish on every
 * render even when the resolved graph is unchanged.
 */
function useInterpolatedGraph(
	filterGraph: ResourceTableProps['filterGraph'],
): InterpolateResult<dyn.SearchGraph | undefined> {
	const paramsKey = JSON.stringify(useParams());

	const resolved = React.useMemo(
		() => interpolateParams(filterGraph as dyn.SearchGraph | undefined, JSON.parse(paramsKey)),
		[filterGraph, paramsKey],
	);
	const resolvedKey = JSON.stringify(resolved);
	const stableRef = React.useRef(resolved);
	const stableKeyRef = React.useRef(resolvedKey);

	if (stableKeyRef.current !== resolvedKey) {
		stableKeyRef.current = resolvedKey;
		stableRef.current = resolved;
	}
	return stableRef.current;
}
