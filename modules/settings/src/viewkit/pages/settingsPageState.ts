import { ResourceScope } from '@nikkierp/common/entitlements';
import { useHasEntitlement } from '@nikkierp/ui/components';
import { useEventBus } from '@nikkierp/ui/microApp';
import { SETTINGS_SAVE_STATE_EVENT } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { settingsService } from '../../features/settings';

import type { SettingsPaneProps } from '../props';
import type { SettingsSaveState } from '@nikkierp/viewkit-mantine';


/** What a tenant or org read asserts; a person always reads their own user-level settings. */
const SHARED_LEVEL_READ = [{ action: 'read', resource: 'settings_record', scope: ResourceScope.Tenant }];

/**
 * The panes that have at least one setting this user can see, or null while that is resolving.
 *
 * A pane is visible when any level it declares, among those the user may read, returns an item. A
 * read that fails counts as visible: the pane then shows its own error, which says more than an
 * entry that silently vanished.
 */
export function useVisiblePanes(panes: SettingsPaneProps[]): SettingsPaneProps[] | null {
	const sharedRead = useHasEntitlement(SHARED_LEVEL_READ);
	const [visible, setVisible] = React.useState<SettingsPaneProps[] | null>(null);

	React.useEffect(() => {
		if (sharedRead.isPending) return;
		let active = true;
		void Promise.all(panes.map(pane => hasVisibleItems(pane, sharedRead.allowed)))
			.then(flags => {
				if (active) setVisible(panes.filter((_pane, i) => flags[i]));
			});
		return () => {
			active = false;
		};
	}, [panes, sharedRead.isPending, sharedRead.allowed]);

	return visible;
}

async function hasVisibleItems(pane: SettingsPaneProps, mayReadShared: boolean): Promise<boolean> {
	const readable = pane.levels.filter(level => level === 'user' || mayReadShared);
	try {
		const results = await Promise.all(
			readable.map(level => settingsService.getSettings({ level, moduleKey: pane.slug })),
		);
		return results.some(result => result.data == null || result.data.items.length > 0);
	}
	catch {
		return true;
	}
}

/**
 * The save state the active pane last published, or null until it has.
 *
 * Reset whenever the active pane changes, so the header never shows the outgoing pane's dirty
 * flag against the incoming one; a state naming any other pane is ignored for the same reason.
 */
export function useActiveSaveState(activeSlug: string | null): SettingsSaveState | null {
	const eventBus = useEventBus();
	const [state, setState] = React.useState<SettingsSaveState | null>(null);

	React.useEffect(() => {
		setState(null);
		return eventBus.subscribe<SettingsSaveState>(SETTINGS_SAVE_STATE_EVENT, (next) => {
			if (next?.moduleKey === activeSlug) setState(next);
		});
	}, [eventBus, activeSlug]);

	return state;
}
