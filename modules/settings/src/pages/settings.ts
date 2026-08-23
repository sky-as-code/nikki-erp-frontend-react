import { definePage, PageNode } from '@nikkierp/viewengine/metadata';

import { SETTINGS_MODULE, SETTINGS_WIDGET_NAME } from '../constants';
import { settingsPageProps } from '../viewkit/props';


/**
 * The settings page: plain metadata, like every other page in the repo.
 *
 * `panes` is the whole visibility rule. Listing a module here is the deliberate second half of
 * exposing its `pages.settings` widget -- the module declares the widget, and this list decides
 * whether, and in what order, a user sees it. A module with nothing to show simply is not here.
 *
 * The rail entry for `essential` reads "General" rather than "Essential" because it labels what
 * the pane contains, not which bundle serves it.
 */
export function buildSettingsPages(): PageNode[] {
	const ref = settingsPageProps({
		translationNs: SETTINGS_MODULE,
		titleKey: 'page.title',
		emptyKey: 'page.empty',
		widgetName: SETTINGS_WIDGET_NAME,
		panes: [
			{ slug: 'essential', labelKey: 'pane.general' },
			{ slug: 'iam', labelKey: 'pane.security' },
		],
	});

	// The index route: settings is reached from Module Home, not from a nested path.
	return [definePage({ routePath: '', template: ref.template, props: ref.props })];
}
