import { NavLink, Stack, Text, Title } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { LazyMicroWidget } from '@nikkierp/ui/microApp';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { SplitLayout } from '@nikkierp/viewkit-mantine';
import React from 'react';
import { z } from 'zod';

import {
	SETTINGS_PAGE_PANE, SETTINGS_PAGE_RAIL, SETTINGS_PAGE_SPLIT, SETTINGS_PAGE_TITLE,
} from '../ids';
import { useSettingsPageContext } from '../pages/settingsPageContext';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The settings page's three pieces: its title, the rail of modules, and the pane the rail
 * selects.
 *
 * All three take no props. What they need is state and behaviour -- which pane is active, what
 * clicking an entry does -- and neither can survive `JSON.stringify`, so it comes from the
 * page's context instead. Page JSON says where they go; the provider says what they do.
 */
const noProps = z.object({}).strict();

export const settingsPageTitleRenderer: IComponentRenderer<Record<string, never>> = {
	type: SETTINGS_PAGE_TITLE,
	propsSchema: noProps,
	render() {
		return <SettingsPageTitle />;
	},
};

function SettingsPageTitle(): React.ReactNode {
	const { params } = useSettingsPageContext();
	const t = useTranslate(params.translationNs);

	return (
		<Title order={2} {...componentAttrs(SETTINGS_PAGE_TITLE)} {...testAttrs('settings.page')}>
			{t(params.titleKey)}
		</Title>
	);
}

export const settingsPageRailRenderer: IComponentRenderer<Record<string, never>> = {
	type: SETTINGS_PAGE_RAIL,
	propsSchema: noProps,
	render() {
		return <SettingsPageRail />;
	},
};

/**
 * The left rail is navigation, not a table of contents: exactly one entry is active, and
 * clicking one swaps what the right pane renders rather than scrolling a long page.
 */
function SettingsPageRail(): React.ReactNode {
	const { params, activeSlug, setActiveSlug } = useSettingsPageContext();
	const t = useTranslate(params.translationNs);

	return (
		<Stack gap={0} {...componentAttrs(SETTINGS_PAGE_RAIL)} {...testAttrs('settings.rail')}>
			{params.panes.map(pane => (
				<NavLink
					key={pane.slug}
					active={pane.slug === activeSlug}
					label={t(pane.labelKey)}
					onClick={() => setActiveSlug(pane.slug)}
					{...testAttrs('settings.railItem', pane.slug)}
				/>
			))}
		</Stack>
	);
}

export const settingsPagePaneRenderer: IComponentRenderer<Record<string, never>> = {
	type: SETTINGS_PAGE_PANE,
	propsSchema: noProps,
	render() {
		return <SettingsPagePane />;
	},
};

/**
 * The right pane: whichever module the rail has selected, mounted by name.
 *
 * This module owns the chrome and nothing else. It does not know what any module can be
 * configured with -- no field list, no schema, no labels beyond the rail entry -- which is why
 * adding a setting to a module needs no change here.
 */
function SettingsPagePane(): React.ReactNode {
	const { params, activeSlug } = useSettingsPageContext();
	const t = useTranslate(params.translationNs);

	if (activeSlug == null) {
		return (
			<Text c='dimmed' {...componentAttrs(SETTINGS_PAGE_PANE)} {...testAttrs('settings.pane')}>
				{t(params.emptyKey)}
			</Text>
		);
	}

	return (
		<div {...componentAttrs(SETTINGS_PAGE_PANE)} {...testAttrs('settings.pane')}>
			{/* Keyed by slug so switching modules remounts rather than handing the next module
				the element the previous one mounted into. This also discards the outgoing pane's
				unsaved edits, which is deliberate: drafts live in the widget's own provider, and
				keeping a hidden module's drafts alive would mean saving edits the user can no
				longer see. */}
			<LazyMicroWidget
				key={activeSlug}
				slug={activeSlug}
				widgetName={params.widgetName}
			/>
		</div>
	);
}

/**
 * The two-column frame: rail on the left, active module's pane on the right.
 *
 * Its children map to the two columns **by position** -- first left, second right -- because
 * `SplitLayout` takes render callbacks and a callback cannot be authored in page JSON. Wrapping
 * it here is what keeps the page tree plain metadata.
 */
export const settingsPageSplitRenderer: IComponentRenderer<Record<string, never>> = {
	type: SETTINGS_PAGE_SPLIT,
	propsSchema: noProps,
	render(_props, runtime) {
		return <SettingsPageSplit runtime={runtime} />;
	},
};

function SettingsPageSplit({ runtime }: { runtime: ComponentRenderRuntime }): React.ReactNode {
	const [primary, secondary] = runtime.children ?? [];

	return (
		<div {...componentAttrs(SETTINGS_PAGE_SPLIT)}>
			<SplitLayout
				// Controlled open: `SplitLayout` is uncontrolled-*closed* by default, which suits
				// the master-detail flow it was written for -- no row picked yet, no detail pane.
				// A settings page always has an active pane, so leaving it uncontrolled renders
				// the rail beside an empty right-hand column.
				secondaryOpen
				renderPrimary={() => <MetaComponent node={primary} />}
				renderSecondary={() => <MetaComponent node={secondary} />}
			/>
		</div>
	);
}
