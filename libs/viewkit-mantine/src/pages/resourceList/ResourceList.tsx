import { Paper } from '@mantine/core';
import { LoadingState } from '@nikkierp/ui/components';
import { DataTable, DataTableAction } from '@nikkierp/ui/components/DataTable';
import { TranslateFn, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { usePaperBgColor } from '@nikkierp/ui/theme';
import { useFieldRenderers } from '@nikkierp/viewengine/render';
import React from 'react';

import { getSearchRequestOrderBy } from '../../data/searchRequest';
import { useResourceLinkHref } from '../../data/useResourceLinkHref';
import { useResourceSearch } from '../../data/useResourceSearch';

import type { ResourceListCommandAction, ResourceListProps } from './props';


export type ResourceListViewProps = {
	/** Validated page params, passed as-is from the page metadata. */
	params: ResourceListProps,
	/** View-engine page segment (e.g. `users`); detail URLs are `/:orgSlug/:moduleSlug/{routePath}/:id`. */
	routePath: string,
};

const INITIAL_REQUEST = { page: 0, size: 0, search_name: 'default' };

export const ResourceList = React.memo(ResourceListView);

function ResourceListView({ params, routePath }: ResourceListViewProps): React.ReactNode {
	const bgColor = usePaperBgColor();
	const lc = useLocalize(params.translationNs);
	const t = useTranslate(params.translationNs);
	const commandBus = useCommandBus();
	const fieldRenderer = useFieldRenderers(params.fieldRenderers);

	const { pack, searchData, searchRequest, onSearchRequestChange, refresh } = useResourceSearch({
		schemaName: params.schemaName,
		searchCommand: params.searchCommand,
		initialRequest: INITIAL_REQUEST,
	});
	const buildLinkHref = useResourceLinkHref(params.linkField, routePath);

	const actions = React.useMemo(
		() => buildResourceActions(params, t, commandBus, refresh),
		[params, t, commandBus, refresh],
	);

	if (!pack || !searchData) {
		return <LoadingState />;
	}

	return (
		<Paper className='absolute top-0 left-0 right-0 bottom-0 p-0 m-0 flex' bg={bgColor}>
			<DataTable
				tableName={lc(pack.modelSchema.label, { count: searchData.total })}
				data={searchData}
				initialSearchRequest={searchRequest}
				modelSchema={pack.modelSchema}
				onSearchRequestChange={onSearchRequestChange}
				fieldRenderer={fieldRenderer}
				buildLinkHref={buildLinkHref}
				allowColumnResizing
				actions={actions}
				hasFixHeader
				sortableFields={searchData.desired_fields}
				orderBy={getSearchRequestOrderBy(searchRequest)}
				translationNs={params.translationNs}
				translateFieldName={(field: string) => {
					if (field === 'fields') {
						return t('model_fields');
					}
					return lc(pack.modelSchema.fields[field]?.label);
				}}
			/>
		</Paper>
	);
}

function buildResourceActions(
	params: ResourceListProps,
	t: TranslateFn,
	commandBus: ReturnType<typeof useCommandBus>,
	refreshSearch: () => void,
): DataTableAction[] {
	const runCommand = (command: string) => (selectedItems: Record<string, unknown>[]) => {
		const ids = selectedItems.map(item => item.id).filter(Boolean) as string[];
		void commandBus.publish({ name: command, payload: { ids } }).then(refreshSearch);
	};

	let actions: DataTableAction[] = [{
		label: t('action.refresh'),
		onTrigger: () => refreshSearch(),
	}];
	if (params.createEnabled) {
		actions.push({ label: t('action.create'), href: '../new' });
	}
	if (params.deleteCommand) {
		actions.push({
			label: t('action.delete'),
			requireSelection: true,
			supportMultiple: true,
			command: params.deleteCommand,
			onTrigger: runCommand(params.deleteCommand),
		});
	}
	actions = actions.concat(params.extraActions.map((action: ResourceListCommandAction) => ({
		label: action.label,
		supportMultiple: action.supportMultiple,
		requireSelection: action.requireSelection,
		command: action.command,
		onTrigger: runCommand(action.command),
	})));
	if (params.archiveCommand) {
		actions.push({ isSeparator: true }, {
			label: t('action.archive'),
			requireSelection: true,
			supportMultiple: true,
			command: params.archiveCommand,
			onTrigger: runCommand(params.archiveCommand),
		});
	}
	return actions;
}
