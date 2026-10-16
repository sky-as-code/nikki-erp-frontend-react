import { ConfirmModal } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { useEventBus } from '@nikkierp/ui/microApp';
import { defineComponent } from '@nikkierp/viewengine/metadata';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { PageContainer, SETTINGS_SAVE_REQUEST_EVENT } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { SettingsPageContextProvider, SettingsPageContextValue } from './settingsPageContext';
import { useActiveSaveState, useVisiblePanes } from './settingsPageState';
import {
	SETTINGS_PAGE_PANE, SETTINGS_PAGE_RAIL, SETTINGS_PAGE_SPLIT, SETTINGS_PAGE_TITLE,
} from '../ids';

import type { SettingsPageProps } from '../props';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';
import type { SettingsSaveRequest } from '@nikkierp/viewkit-mantine';


/**
 * The settings page: a rail of modules on the left, the selected module's own pane on the right.
 *
 * The page owns the one Save button, in its header, while the edits live in the active pane --
 * another module's widget. The two talk over the save bus (`saveBus.ts` in viewkit-mantine).
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
	const eventBus = useEventBus();
	const visiblePanes = useVisiblePanes(params.panes);
	const [chosenSlug, setChosenSlug] = React.useState<string | null>(null);
	// The chosen pane while it is still visible, else the first visible one; null until resolved.
	const activeSlug = visiblePanes?.find(pane => pane.slug === chosenSlug)?.slug ?? visiblePanes?.[0]?.slug ?? null;
	const saveState = useActiveSaveState(activeSlug);
	const [pendingSlug, setPendingSlug] = React.useState<string | null>(null);

	const selectPane = React.useCallback((slug: string) => {
		if (slug === activeSlug) return;
		if (saveState?.dirty) setPendingSlug(slug);
		else setChosenSlug(slug);
	}, [activeSlug, saveState?.dirty]);
	const requestSave = React.useCallback(() => {
		if (activeSlug) eventBus.publish<SettingsSaveRequest>(SETTINGS_SAVE_REQUEST_EVENT, { moduleKey: activeSlug });
	}, [eventBus, activeSlug]);

	const value = React.useMemo(
		(): SettingsPageContextValue => ({ params, activeSlug, selectPane, visiblePanes, saveState, requestSave }),
		[params, activeSlug, selectPane, visiblePanes, saveState, requestSave],
	);

	return (
		<SettingsPageContextProvider value={value}>
			{children}
			<DiscardChangesModal
				translationNs={params.translationNs}
				opened={pendingSlug != null}
				onStay={() => setPendingSlug(null)}
				onDiscard={() => {
					setChosenSlug(pendingSlug);
					setPendingSlug(null);
				}}
			/>
		</SettingsPageContextProvider>
	);
}

/** Leaving a pane remounts it and drops its drafts, so the user decides first. */
function DiscardChangesModal({ translationNs, opened, onStay, onDiscard }: {
	translationNs: string,
	opened: boolean,
	onStay: () => void,
	onDiscard: () => void,
}): React.ReactNode {
	const t = useTranslate(translationNs);
	return (
		<ConfirmModal
			opened={opened}
			onClose={onStay}
			onConfirm={onDiscard}
			title={t('page.discard.title')}
			message={t('page.discard.message')}
			confirmLabel={t('page.discard.confirm')}
			cancelLabel={t('page.discard.cancel')}
			testId='settings.discardModal'
		/>
	);
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
