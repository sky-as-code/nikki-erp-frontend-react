import { Alert, Collapse, Group, Stack, Tabs, Title, UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { LinkModeScope } from '@nikkierp/ui/breadcrumbs';
import { InsufficientPermissionContent, LoadingState } from '@nikkierp/ui/components';
import { ExcelDataTable, withLeadingField } from '@nikkierp/ui/components/ExcelDataTable';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight, IconInfoCircle } from '@tabler/icons-react';
import React from 'react';

import { assignmentSearchField } from './assignmentPayloads';
import { useAssignmentWriteProps } from './RelatedAssignment';
import { ResourceUpdateContext } from './resourceUpdateContext';
import classes from '../../components/collapsibleSection/CollapsibleSection.module.css';
import { PaperWithBorder } from '../../components/paperWithBorder';
import { useInterpolatedGraph } from '../../components/resourceTable/ResourceTable';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceBaseHref, useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { useTableRelatedSchemas, useTranslateFieldName } from '../../data/useTableFieldLabels';
import { useTableActionLocks } from '../../permissions';
import { resourceTestIdPrefix } from '../../testIds';
import { useDefaultTableHotKeys } from '../resourceSplitView/splitViewContext';

import type { RelatedResource } from './props';
import type { InterpolateResult } from '../../data/interpolate';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type RelatedResourcesTabsProps = {
	resources: RelatedResource[],
	header?: string,
	/** i18n key of an info box above the tabs, translated with `translationNs`. */
	notice?: string,
	translationNs: string,
};

/** The "related resources" section: one tab per related resource, each an embedded table. */
export function RelatedResourcesTabs(props: RelatedResourcesTabsProps): React.ReactNode {
	const { resources, header, notice, translationNs } = props;
	const t = useTranslate(translationNs);
	const [expanded, setExpanded] = React.useState(false);
	const [hasExpanded, setHasExpanded] = React.useState(false);
	const onToggle = React.useCallback(() => {
		setExpanded(prev => !prev);
		setHasExpanded(true);
	}, []);
	if (resources.length === 0) {
		return null;
	}
	// A record's related lists lead deeper, not sideways: their links append to the trail.
	return (
		<LinkModeScope mode='append'>
			<Stack component={PaperWithBorder} gap='xs'>
				<UnstyledButton
					className={classes.collapsibleHeader}
					onClick={onToggle}
					aria-expanded={expanded}
					{...testAttrs('ui.relatedResources', 'toggle')}
				>
					<Group gap='xs'>
						{expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
						<Title order={4}>
							{t(header ?? 'datatable.relatedResources', { defaultValue: 'Related resources' })}
						</Title>
					</Group>
				</UnstyledButton>
				{/*
					`Collapse` mounts its children even while collapsed -- it animates height -- so the
					`hasExpanded` latch, not `Collapse`, is what keeps the tables from searching on page
					load. Once opened the tabs stay mounted, so collapsing never discards tab or page state.
				*/}
				{hasExpanded ? (
					<Collapse expanded={expanded}>
						{notice ? (
							<Alert color='blue' icon={<IconInfoCircle />} mb='xs' {...testAttrs('ui.relatedResources', 'notice')}>
								{t(notice)}
							</Alert>
						) : null}
						<RelatedResourcesTabList resources={resources} />
					</Collapse>
				) : null}
			</Stack>
		</LinkModeScope>
	);
}

/**
 * One tab per related resource.
 *
 * `keepMounted={false}` unmounts the tab that loses focus, so returning to it searches again. That
 * is the accepted trade: a mounted table holds a full result set, and a detail page may carry
 * several.
 */
function RelatedResourcesTabList({ resources }: { resources: RelatedResource[] }): React.ReactNode {
	return (
		<Tabs defaultValue={tabKey(resources[0], 0)} keepMounted={false}>
			<Tabs.List>
				{resources.map((resource, index) => (
					<TabLabel key={tabKey(resource, index)} value={tabKey(resource, index)} resource={resource} />
				))}
			</Tabs.List>
			{resources.map((resource, index) => (
				<Tabs.Panel key={tabKey(resource, index)} value={tabKey(resource, index)} pt='sm'>
					<RelatedResourceTable resource={resource} />
				</Tabs.Panel>
			))}
		</Tabs>
	);
}

/**
 * Doubles as the React key and the `Tabs` value, so a collision would both warn and make two tabs
 * activate together. Schema plus label is not unique on its own — a page may list the same resource
 * twice under different filters — so the position disambiguates.
 */
function tabKey(resource: RelatedResource, index: number): string {
	return resource.testId ?? `${index}:${resource.schemaName}:${resource.label}`;
}

function TabLabel({ resource, value }: { resource: RelatedResource, value: string }): React.ReactNode {
	const t = useTranslate(resource.translationNs);
	return <Tabs.Tab value={value}>{t(resource.label)}</Tabs.Tab>;
}

/**
 * Keyed on the interpolated scope, so selecting another parent record (the next row of a split
 * view) starts its table afresh -- page, sort and filters belong to the record they were set on.
 */
function RelatedResourceTable({ resource }: { resource: RelatedResource }): React.ReactNode {
	const graph = useInterpolatedGraph(resource.initialGraph);
	return <ScopedRelatedResourceTable key={JSON.stringify(graph.value ?? null)} resource={resource} graph={graph} />;
}

type ScopedRelatedResourceTableProps = {
	resource: RelatedResource,
	graph: InterpolateResult<dyn.SearchGraph | undefined>,
};

/** An embedded table in the pagination-above-and-below layout, scoped by the interpolated graph. */
function ScopedRelatedResourceTable({ resource, graph }: ScopedRelatedResourceTableProps): React.ReactNode {
	const fieldRenderers = useFieldRenderers(resource.fieldRenderers);
	const fields = useRequestedFields(resource);
	const initialRequest = React.useMemo((): dyn.RestSearchRequest => ({
		page: 0, size: resource.pageSize, search_name: resource.searchName, fields,
	}), [resource.pageSize, resource.searchName, fields]);
	const search = useResourceSearch({
		schemaName: resource.schemaName, searchCommand: resource.searchCommand, initialRequest, baseGraph: graph.value,
		withEdgeLabels: true,
	});
	const { pack, searchData } = search;
	const assignment = useAssignmentWriteProps(resource);
	const buildLinkHref = useResourceLinkHref(resource.linkField, resource.linkRoutePath);
	const editing = useIsFormEditing();
	const testId = resourceTestIdPrefix({ testId: resource.testId, schemaName: resource.schemaName, part: 'Table' });
	const relatedSchemas = useTableRelatedSchemas(
		pack?.modelSchema, searchData?.desired_fields, search.edgeLabelSchemas,
	);
	const translateFieldName = useTranslateFieldName(resource.translationNs, pack?.modelSchema, relatedSchemas);
	const emptyMessage = useTranslatedKey(resource.translationNs, resource.emptyMessage);
	const enableHotKeys = useDefaultTableHotKeys();

	// Compact, not the full refusal page: this tab is one section of the detail page.
	if (search.refused) {
		return <InsufficientPermissionContent missing={search.refused} />;
	}
	if (!pack || !searchData || graph.missing.length > 0) {
		return <LoadingState />;
	}
	return (
		<ExcelDataTable.Provider
			testId={testId}
			tableName={resource.schemaName}
			modelSchema={pack.modelSchema}
			relatedSchemas={relatedSchemas}
			data={searchData}
			isLoading={search.isPending}
			baseGraph={graph.value}
			initialSearchRequest={search.userRequest}
			onSearchRequestChange={search.onSearchRequestChange}
			orderBy={getSearchRequestOrderBy(search.searchRequest)}
			onRefresh={search.refresh}
			translationNs={resource.translationNs}
			translateFieldName={translateFieldName}
			buildLinkHref={editing ? undefined : buildLinkHref}
			fieldRenderers={fieldRenderers}
			emptyMessage={emptyMessage}
			enableHotKeys={enableHotKeys}
			{...assignment}
		>
			{/* The same xs spacing the list page puts between its toolbar and the table; the header
			    and body stay in one wrapper because together they read as a single table. */}
			<Stack gap='xs'>
				<ExcelDataTable.Toolbar
					left={assignment
						? null
						: <RelatedActions resource={resource} graph={graph.value} editing={editing} />}
					right={<><ExcelDataTable.Pagination /><ExcelDataTable.SettingsButton /></>}
				/>
				<div>
					<ExcelDataTable.TableHeader enableColumnFilters={false} />
					<ExcelDataTable.Table className='max-h-[480px]' />
				</div>
				<ExcelDataTable.Toolbar right={<ExcelDataTable.Pagination enableHotKeys={false} />} />
			</Stack>
		</ExcelDataTable.Provider>
	);
}

/** An assignment tab also fetches its picker's column, which the table shows first. */
function useRequestedFields(resource: RelatedResource): string[] | undefined {
	const { assignment, fields } = resource;
	return React.useMemo(
		() => (assignment && fields
			? withLeadingField(fields, assignmentSearchField(assignment.newRowSearchField, fields))
			: fields),
		[assignment, fields],
	);
}

/** True while the page's form is in update mode; the tabs render outside the form's own context. */
function useIsFormEditing(): boolean {
	return React.useContext(ResourceUpdateContext)?.updateMode ?? false;
}

/**
 * Refresh, the optional "View all" link, then the page-authored extras (a link or a command). An
 * assignment tab has none: its insert row and row Delete are its actions. While the form is edited
 * the links are hidden -- following one would discard the edits -- and only commands remain.
 */
function RelatedActions({ resource, graph, editing }: {
	resource: RelatedResource,
	graph: dyn.SearchGraph | undefined,
	editing: boolean,
}) {
	// Both namespaces: "View all" is a standard label from `common`, while a page's own extra
	// actions name keys in its module.
	const t = useTranslate([resource.translationNs, 'common']);
	const viewAllHref = useResourceBaseHref(resource.linkRoutePath);
	const extraActions = useTableActionLocks(resource.extraActions, resource.schemaName)
		.filter(action => !(editing && action.routePath));
	return (
		<ExcelDataTable.Actions>
			<ExcelDataTable.ActionRefresh />
			{resource.showViewAll && viewAllHref && !editing ? (
				<ExcelDataTable.Action
					label={resource.viewAllLabel
						? t(resource.viewAllLabel)
						: t('datatable.viewAll', { defaultValue: 'View all' })}
					href={viewAllHrefOf(viewAllHref, resource.viewAllFiltered ? graph : undefined)}
					type={resource.viewAllType}
					navMode={resource.viewAllNavMode}
					testId='viewAll'
				/>
			) : null}
			{extraActions.map((action, index) => (
				<ExcelDataTable.Action
					key={`${index}:${action.testId ?? action.command ?? action.routePath}`}
					label={t(action.label)}
					href={action.routePath}
					navMode={action.navMode}
					command={action.command}
					testId={action.testId ?? action.routePath}
					selectionMode={action.requireSelection ? (action.supportMultiple ? 'multiple' : 'single') : undefined}
					locked={action.locked}
					lockedMissing={action.lockedMissing}
				/>
			))}
		</ExcelDataTable.Actions>
	);
}

/** The list's href, carrying the tab's filter as `?initialGraph=` when one is given. */
function viewAllHrefOf(baseHref: string, graph: dyn.SearchGraph | undefined): string {
	return graph ? `${baseHref}?initialGraph=${encodeURIComponent(JSON.stringify(graph))}` : baseHref;
}

/** A page-given i18n key, translated; `undefined` leaves the table's own default. */
function useTranslatedKey(translationNs: string | undefined, key: string | undefined): string | undefined {
	const t = useTranslate(translationNs);
	return key ? t(key) : undefined;
}
