import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { PageContainer } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { SettingsPageContextProvider, SettingsPageContextValue } from './settingsPageContext';
import {
	SETTINGS_PAGE_PANE, SETTINGS_PAGE_RAIL, SETTINGS_PAGE_SPLIT, SETTINGS_PAGE_TITLE,
} from '../ids';

import type { SettingsPageProps } from '../props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The settings page: a rail of modules on the left, the selected module's own pane on the right.
 *
 * The active pane lives in React state rather than the route. That is a deliberate trade-off:
 * a route param would make a pane linkable and survive reload, and local state does not -- a
 * reload always returns to the first entry. The template therefore contributes no
 * `routePattern`; adding one later is what would change this.
 *
 * The page itself is only a shell -- provider, container, and a node tree rebuilt from the
 * context on every change. Everything visible is a registered component.
 */
export function SettingsPage({ props }: { props: SettingsPageProps }): React.ReactNode {
	return (
		<SettingsPageProvider params={props}>
			<PageContainer>
				<SettingsPageContent />
			</PageContainer>
		</SettingsPageProvider>
	);
}

function SettingsPageProvider({ params, children }: {
	params: SettingsPageProps,
	children: React.ReactNode,
}): React.ReactNode {
	// The first entry is active on arrival. `panes` is non-empty by schema, so the `?? null`
	// is for the type rather than a case that can occur.
	const [activeSlug, setActiveSlug] = React.useState<string | null>(
		() => params.panes[0]?.slug ?? null,
	);

	const value = React.useMemo(
		(): SettingsPageContextValue => ({ params, activeSlug, setActiveSlug }),
		[params, activeSlug],
	);

	return <SettingsPageContextProvider value={value}>{children}</SettingsPageContextProvider>;
}

function SettingsPageContent(): React.ReactNode {
	// Built once rather than from the context: the tree's *shape* does not depend on which pane
	// is active. Switching panes re-renders the pane component, which reads the slug itself.
	const nodes = React.useMemo(() => buildSettingsPageNodes(), []);

	return <MetaComponent node={nodes} />;
}

/**
 * The page tree, which is the same on every render: the title above a two-column frame.
 *
 * Nothing here depends on the context -- which pane is active changes what the *pane* component
 * renders, not where the nodes sit -- so the tree is built once. The rail and the pane read the
 * active slug themselves.
 */
function buildSettingsPageNodes(): ComponentNode[] {
	return [
		defineComponent({ component: SETTINGS_PAGE_TITLE }),
		defineComponent({
			component: SETTINGS_PAGE_SPLIT,
			// Position is the contract: first child is the left column, second the right.
			children: [
				defineComponent({ component: SETTINGS_PAGE_RAIL }),
				defineComponent({ component: SETTINGS_PAGE_PANE }),
			],
		}),
	];
}
