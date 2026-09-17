import { Tabs, Title } from '@mantine/core';
import { LoadingState } from '@nikkierp/ui/components';
import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import React from 'react';

import { useInterpolatedGraph } from '../../components/resourceTable/ResourceTable';
import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';
import { resourceTestIdPrefix } from '../../testIds';

import type { RelatedResource } from './props';
import type { ResourceTableAction } from '../../components/resourceTable/props';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type RelatedResourcesTabsProps = {
	resources: RelatedResource[],
	header?: string,
	translationNs: string,
};

/** The "related resources" section: one tab per related resource, each an embedded table. */
export function RelatedResourcesTabs({ resources, header, translationNs }: RelatedResourcesTabsProps): React.ReactNode {
	const t = useTranslate(translationNs);
	if (resources.length === 0) {
		return null;
	}
	return (
		<section className='mt-4'>
			<Title order={4} className='mb-2'>
				{t(header ?? 'datatable.relatedResources', { defaultValue: 'Related resources' })}
			</Title>
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
		</section>
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
	const graph = useInterpolatedGraph(resource.filterGraph);
	const lc = useLocalize(resource.translationNs);
	const fieldRenderers = useFieldRenderers(resource.fieldRenderers);
	const initialRequest = React.useMemo((): dyn.RestSearchRequest => ({
		page: 0, size: resource.pageSize, search_name: resource.searchName, fields: resource.fields,
	}), [resource.pageSize, resource.searchName, resource.fields]);
	const search = useResourceSearch({
		schemaName: resource.schemaName, searchCommand: resource.searchCommand, initialRequest, baseGraph: graph.value,
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
			data={searchData}
			isLoading={search.isPending}
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
				left={<RelatedActions actions={resource.extraActions} translationNs={resource.translationNs} />}
				right={<><ExcelDataTable.Pagination /><ExcelDataTable.SettingsButton /></>}
			/>
			<ExcelDataTable.TableHeader enableColumnFilters={false} />
			<ExcelDataTable.Table className='max-h-[480px]' />
			<ExcelDataTable.Toolbar right={<ExcelDataTable.Pagination />} />
		</ExcelDataTable.Provider>
	);
}

/** Refresh, then the page-authored extras: a link (`routePath`, path-relative) or a command. */
function RelatedActions({ actions, translationNs }: { actions: ResourceTableAction[], translationNs: string }) {
	const t = useTranslate(translationNs);
	return (
		<ExcelDataTable.Actions>
			<ExcelDataTable.ActionRefresh />
			{actions.map((action, index) => (
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
