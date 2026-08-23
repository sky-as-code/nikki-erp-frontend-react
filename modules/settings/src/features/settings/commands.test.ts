import { describe, expect, it } from 'vitest';

import { SettingsCommands } from './commands';


/**
 * The command ids are a cross-module contract with no compile-time link.
 *
 * A settings pane runs inside the module it configures and cannot import this one, so
 * `libs/viewkit-mantine/src/components/settings/settingsDataContext.tsx` restates these strings
 * as literals. Nothing connects the two: renaming an id here would leave every pane publishing a
 * command nobody handles, which surfaces as a pane that loads forever rather than as a failure.
 *
 * These literals are duplicated on purpose. If this test fails, fix the consumer to match --
 * do not relax the test.
 */
describe('SettingsCommands', () => {
	it('matches the ids the viewkit settings pane publishes', () => {
		expect(SettingsCommands.GET).toBe('settings.settings.get_settings');
		expect(SettingsCommands.SET).toBe('settings.settings.set_settings');
	});
});
