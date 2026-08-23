import { settingsService } from './settingsService';
import { SETTINGS_MODULE } from '../../constants';

import type { GetSettingsRequest, SetSettingsRequest } from './types';
import type { Command, ICommandBus } from '@nikkierp/common/commandBus';


const PREFIX = `${SETTINGS_MODULE}.settings`;

/**
 * How any module reaches the settings API.
 *
 * These ids are the whole public surface of this module. A feature module's settings pane runs
 * inside its own bundle and cannot import from here -- modules never import each other -- so the
 * command bus is the only way its controls read and write values. The ids are matched verbatim,
 * so renaming one silently breaks every pane rather than failing a build.
 */
export const SettingsCommands = Object.freeze({
	GET: `${PREFIX}.get_settings`,
	SET: `${PREFIX}.set_settings`,
} as const);

export function registerSettingsCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(
			SettingsCommands.GET,
			cmd => settingsService.getSettings(payload<GetSettingsRequest>(cmd)),
		),
		bus.subscribe(
			SettingsCommands.SET,
			cmd => settingsService.setSettings(payload<SetSettingsRequest>(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function payload<TPayload>(command: Command): TPayload {
	return command.payload as TPayload;
}
