import { Breadcrumbs, Group as MantineGroup, Stack, TagsInput, Typography } from '@mantine/core';
import React from 'react';

import { ListActionListPage } from '../ListActionBar';


/**
 * Actions that can be toggled by the children renderer. Only the Import
 * button supports toggling at the moment — Create/Refresh are always
 * displayed and are driven by props on `<ListPageLayout>` itself.
 */
export type ListPageLayoutActions = {
	showImport?: boolean;
	disableImport?: boolean;
	onImport?: () => void;
	importLabel?: React.ReactNode;
};

export type ListPageLayoutRenderApi = {
	setActions: (
		actions: ListPageLayoutActions | ((prev: ListPageLayoutActions) => ListPageLayoutActions),
	) => void;
};

export type ListPageLayoutProps = {
	/** Page title shown in the breadcrumbs area. */
	title: React.ReactNode;
	/** Optional placeholder for the search input. When omitted, the search input is hidden. */
	searchPlaceholder?: string;
	/** Click handler for the Create button. Pass `undefined` to disable. */
	onCreate?: () => void;
	/** Click handler for the Refresh button. Always displayed. */
	onRefresh: () => void;
	/** Render the body of the list page. Receives an API to toggle the Import action. */
	children: (api: ListPageLayoutRenderApi) => React.ReactNode;
};

const DEFAULT_ACTIONS: ListPageLayoutActions = {
	showImport: true,
};

/**
 * Layout wrapper for list pages. Renders the page title, an optional
 * search box, and a toolbar with Create/Refresh/Import actions. Children
 * are rendered below via a render prop and receive a `setActions` API —
 * mirroring `<FormLayout>` — but only the Import button can be toggled.
 */
export function ListPageLayout({
	title,
	searchPlaceholder,
	onCreate,
	onRefresh,
	children,
}: ListPageLayoutProps): React.ReactElement {
	const [actions, setActions] = React.useState<ListPageLayoutActions>(DEFAULT_ACTIONS);

	const api = React.useMemo<ListPageLayoutRenderApi>(() => ({ setActions }), []);

	return (
		<Stack gap='md'>
			<MantineGroup>
				<Breadcrumbs style={{ minWidth: '30%' }}>
					<Typography>
						<h4>{title}</h4>
					</Typography>
				</Breadcrumbs>
				{searchPlaceholder && (
					<TagsInput placeholder={searchPlaceholder} w='500px' />
				)}
			</MantineGroup>
			<ListActionListPage
				onCreate={onCreate}
				onRefresh={onRefresh}
				showImport={actions.showImport}
				disableImport={actions.disableImport}
				onImport={actions.onImport}
				importLabel={actions.importLabel}
			/>
			{children(api)}
		</Stack>
	);
}
