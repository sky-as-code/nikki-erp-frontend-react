import { Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import * as dyn from '@nikkierp/common/dynamicModel';
import { TablePagination } from '@nikkierp/ui/components';
import { SettingsTable } from '@nikkierp/ui/components/DataTable';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';
import { z } from 'zod';

import { Role } from '../../features/role/types';
import { ROLE_PICKER } from '../ids';
import { useRoleAssignmentContext } from '../pages/roleAssignmentContext';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const LISTED_FIELDS = ['name', 'description'];

export const rolePickerRenderer: IComponentRenderer<Record<string, never>> = {
	type: ROLE_PICKER,
	propsSchema: z.object({}).strict(),
	render() {
		return (
			<ComponentAnchor id={ROLE_PICKER}>
				<ContextRolePicker />
			</ComponentAnchor>
		);
	},
};

function ContextRolePicker(): React.ReactNode {
	const context = useRoleAssignmentContext();
	return (
		<RolePicker
			searchCommand={context.params.roleSearchCommand}
			translationNs={context.params.translationNs}
			selectedIds={context.selectedIds}
			onSelectionChange={context.setSelectedIds}
			onRolesLoaded={context.rememberRoles}
		/>
	);
}

export type RolePickerProps = {
	searchCommand: string,
	translationNs: string,
	/** Controlled selection of role ids; spans pages and filters. */
	selectedIds: string[],
	onSelectionChange: (ids: string[]) => void,
	/** Called with every role seen, so the caller can label pills for off-page selections. */
	onRolesLoaded: (roles: Role[]) => void,
};

/**
 * Filter-and-multi-select list of roles.
 *
 * `SettingsTable` supplies the checkbox column and controlled selection but renders only the
 * rows it is handed, so the search box and pager are composed here rather than in `libs/ui`.
 */
export function RolePicker(props: RolePickerProps): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const [term, setTerm] = React.useState('');
	const [debouncedTerm] = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);
	const [page, setPage] = React.useState(1);
	const search = useRoleSearch(props.searchCommand, debouncedTerm, page);

	// Reset to the first page whenever the filter changes; the selection is deliberately left
	// alone, since it is owned by the wizard and spans filters.
	React.useEffect(() => setPage(1), [debouncedTerm]);

	const onRolesLoaded = props.onRolesLoaded;
	React.useEffect(() => {
		if (search.data?.items) {
			onRolesLoaded(search.data.items);
		}
	}, [onRolesLoaded, search.data]);

	return (
		<Stack gap='sm'>
			<TextInput
				value={term}
				onChange={event => setTerm(event.currentTarget.value)}
				placeholder={t('assignment.searchRoles')}
				leftSection={<IconSearch size={16} />}
			/>
			<SettingsTable
				data={search.tableData}
				valueKey='id'
				translationNs={props.translationNs}
				translateFieldName={field => t(`fields.${field}`)}
				selectedValues={props.selectedIds}
				onSelectionChange={props.onSelectionChange}
				emptyState={<Text c='dimmed' size='sm' py='md'>{t('assignment.noRolesFound')}</Text>}
			/>
			<TablePagination
				totalItems={search.total}
				page={page}
				totalPages={Math.max(1, Math.ceil(search.total / PAGE_SIZE))}
				onPageChange={setPage}
				pageSize={PAGE_SIZE}
			/>
		</Stack>
	);
}

type RoleSearchResult = {
	data: dyn.RestSearchResponse<Role> | null,
	tableData: { items: Role[], desired_fields: string[], masked_fields: string[] },
	total: number,
};

function useRoleSearch(searchCommand: string, term: string, page: number): RoleSearchResult {
	const search = useCommand<dyn.RestSearchResponse<Role>>(searchCommand);
	const publish = search.publish;
	// Cached so a pending request does not blank the table mid-typing, matching how
	// useResourceSearch behaves for the resource list.
	const [cached, setCached] = React.useState<dyn.RestSearchResponse<Role> | null>(null);

	React.useEffect(() => {
		void publish(buildSearchRequest(term, page));
	}, [publish, term, page]);

	React.useEffect(() => {
		if (search.data) {
			setCached(search.data);
		}
	}, [search.data]);

	const data = search.data ?? cached;
	return {
		data: search.data,
		total: data?.total ?? 0,
		tableData: {
			items: data?.items ?? [],
			// The picker shows a fixed, narrow set of columns; the full field list of a role is
			// noise when the only decision is "assign this or not".
			desired_fields: LISTED_FIELDS,
			masked_fields: data?.masked_fields ?? [],
		},
	};
}

function buildSearchRequest(term: string, page: number): dyn.RestSearchRequest {
	return {
		page: page - 1,
		size: PAGE_SIZE,
		fields: ['id', ...LISTED_FIELDS],
		// `*` is the contains operator; an empty term means no filter at all.
		graph: term ? { if: ['name', '*', term] } : undefined,
	};
}
