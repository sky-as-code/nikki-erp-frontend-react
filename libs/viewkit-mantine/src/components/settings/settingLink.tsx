import { Anchor } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import type { SettingsItemProps } from './props';


/**
 * The Shell's routing commands, restated rather than imported: this package must not import
 * `@nikkierp/shell`, and the pane renders inside whichever module owns it.
 */
const GET_ACTIVE_CONTEXT_COMMAND = 'shell.routing.get_active_context';
const NAVIGATE_COMMAND = 'shell.routing.navigate';

type ActiveRoutingContext = { activeOrg: string | null };

export type SettingLinkProps = {
	link: NonNullable<SettingsItemProps['link']>,
	label: string,
	name: string,
};

/**
 * A link out of the settings pane into another module's page. Navigation goes through the Shell,
 * which owns the router; the pane's own module could not resolve another module's path.
 */
export function SettingLink({ link, label, name }: SettingLinkProps): React.ReactNode {
	const commandBus = useCommandBus();
	const follow = React.useCallback(async (event: React.MouseEvent) => {
		event.preventDefault();
		const context = await commandBus.publish<ActiveRoutingContext>({
			name: GET_ACTIVE_CONTEXT_COMMAND, payload: {},
		});
		const org = context.result?.data?.activeOrg;
		const to = `${org ? `/${org}` : ''}/${link.moduleSlug}/${link.path}`;
		await commandBus.publish({ name: NAVIGATE_COMMAND, payload: { to } });
	}, [commandBus, link.moduleSlug, link.path]);

	return (
		<Anchor size='sm' href='#' onClick={follow} {...testAttrs('ui.settingsItem.link', name)}>
			→ {label}
		</Anchor>
	);
}
