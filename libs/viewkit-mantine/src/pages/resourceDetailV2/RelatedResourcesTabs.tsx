import { Collapse, Group, Stack, Tabs, Title, UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { LoadingState } from '@nikkierp/ui/components';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import classes from '../../components/collapsibleSection/CollapsibleSection.module.css';
import { PaperWithBorder } from '../../components/paperWithBorder';
import { useInterpolatedGraph } from '../../components/resourceTable/ResourceTable';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceBaseHref, useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { resourceTestIdPrefix } from '../../testIds';

import type { RelatedResource } from './props';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type RelatedResourcesTabsProps = {
	resources: RelatedResource[],
	header?: string,
	translationNs: string,
};

/** The "related resources" section: one tab per related resource, each an embedded table. */
export function RelatedResourcesTabs({ resources, header, translationNs }: RelatedResourcesTabsProps): React.ReactNode {
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
	return (
		<Stack component={PaperWithBorder} gap='md' className='mt-4'>
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
					<RelatedResourcesTabList resources={resources} />
				</Collapse>
			) : null}
		</Stack>
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

/** An embedded table in the pagination-above-and-below layout, scoped by the interpolated graph. */
function RelatedResourceTable({ resource }: { resource: RelatedResource }): React.ReactNode {
	const graph = useInterpolatedGraph(resource.initialGraph);
	const lc = useLocalize(resource.translationNs);
	const fieldRenderers = useFieldRenderers(resource.fieldRenderers);
	const initialRequest = React.useMemo((): dyn.RestSearchRequest => ({
		page: 0, size: resource.pageSize, search_name: resource.searchName, fields: resource.fields,
	}), [resource.pageSize, resource.searchName, resource.fields]);
	const search = useResourceSearch({
		schemaName: resource.schemaName, searchCommand: resource.searchCommand, initialRequest, baseGraph: graph.value,
		withEdgeLabels: true,
	});
	const { pack, searchData } = search;
	const buildLinkHref = useResourceLinkHref(resource.linkField, resource.linkRoutePath);
	const testId = resourceTestIdPrefix({ testId: resource.testId, schemaName: resource.schemaName, part: 'Table' });
	const translateFieldName = React.useCallback(
		(field: string) => lc(pack?.modelSchema.fields[field]?.label) || field, [lc, pack],
	);

	if (!pack || !searchData || graph.missing.length > 0) {
		return <LoadingState />;
	}
	return (
		<ExcelDataTable.Provider
			testId={testId}
			tableName={resource.schemaName}
			modelSchema={pack.modelSchema}
			relatedSchemas={search.edgeLabelSchemas}
			data={searchData}
			isLoading={search.isPending}
			baseGraph={graph.value}
			initialSearchRequest={search.searchRequest}
			onSearchRequestChange={search.onSearchRequestChange}
			orderBy={getSearchRequestOrderBy(search.searchRequest)}
			onRefresh={search.refresh}
			translationNs={resource.translationNs}
			translateFieldName={translateFieldName}
			buildLinkHref={buildLinkHref}
			fieldRenderers={fieldRenderers}
		>
			<ExcelDataTable.Toolbar
				left={<RelatedActions resource={resource} />}
				right={<><ExcelDataTable.Pagination /><ExcelDataTable.SettingsButton /></>}
			/>
			<ExcelDataTable.TableHeader enableColumnFilters={false} />
			<ExcelDataTable.Table className='max-h-[480px]' />
			<ExcelDataTable.Toolbar right={<ExcelDataTable.Pagination />} />
		</ExcelDataTable.Provider>
	);
}

/** Refresh, the optional "View all" link, then the page-authored extras (a link or a command). */
function RelatedActions({ resource }: { resource: RelatedResource }) {
	// Both namespaces: "View all" is a standard label from `common`, while a page's own extra
	// actions name keys in its module.
	const t = useTranslate([resource.translationNs, 'common']);
	const viewAllHref = useResourceBaseHref(resource.linkRoutePath);
	return (
		<ExcelDataTable.Actions>
			<ExcelDataTable.ActionRefresh />
			{resource.showViewAll && viewAllHref ? (
				<ExcelDataTable.Action
					label={t('datatable.viewAll', { defaultValue: 'View all' })}
					href={viewAllHref}
					testId='viewAll'
				/>
			) : null}
			{resource.extraActions.map((action, index) => (
				<ExcelDataTable.Action
					key={`${index}:${action.testId ?? action.command ?? action.routePath}`}
					label={t(action.label)}
					href={action.routePath}
					command={action.command}
					testId={action.testId ?? action.routePath}
					selectionMode={action.requireSelection ? (action.supportMultiple ? 'multiple' : 'single') : undefined}
				/>
			))}
		</ExcelDataTable.Actions>
	);
}
