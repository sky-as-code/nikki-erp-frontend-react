import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { collapsibleSectionRenderer } from './components/collapsibleSection/CollapsibleSection';
import { pageHeaderRenderer } from './components/pageHeader/PageHeader';
import { resourceCreateFormRenderer } from './components/resourceCreateForm';
import { resourceCreateHeaderRenderer } from './components/resourceCreateHeader';
import { resourceDetailHeaderRenderer } from './components/resourceDetailHeader';
import { resourceFormRenderer } from './components/resourceForm';
import { resourceFormColumnRenderer } from './components/resourceFormColumn';
import { resourceFormTabsRenderer } from './components/resourceFormTabs/ResourceFormTabs';
import { resourceSplitViewRenderer } from './components/resourceSplitView';
import { resourceTableRenderer } from './components/resourceTable/ResourceTable';
import { settingsItemRenderer } from './components/settings/settingsItem';
import { settingsSectionRenderer } from './components/settings/settingsSection';
import { registerFieldRenderers } from './fields/register';
import { MANTINE_VIEW_KIT_ID } from './ids';
import { resourceDetailTemplate } from './pages/resourceDetail/template';
import { resourceListTemplate } from './pages/resourceList/template';
import { resourceSplitViewTemplate } from './pages/resourceSplitView/template';

import type { IViewKit } from '@nikkierp/viewengine/core';


/**
 * Everything this kit contributes, as one reviewable list.
 *
 * Registration used to happen through import side effects, which meant merely
 * importing `@nikkierp/ui/viewEngine` mutated a global registry. It is now an
 * explicit call against a host-owned engine instance.
 */
export const mantineViewKit: IViewKit = {
	id: MANTINE_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerPageTemplate(resourceListTemplate);
		registry.registerPageTemplate(resourceDetailTemplate);
		registry.registerPageTemplate(resourceSplitViewTemplate);

		registry.registerComponentRenderer(pageHeaderRenderer);
		registry.registerComponentRenderer(collapsibleSectionRenderer);
		registry.registerComponentRenderer(resourceTableRenderer);
		registry.registerComponentRenderer(resourceDetailHeaderRenderer);
		registry.registerComponentRenderer(resourceFormRenderer);
		registry.registerComponentRenderer(settingsSectionRenderer);
		registry.registerComponentRenderer(settingsItemRenderer);
		registry.registerComponentRenderer(resourceFormColumnRenderer);
		registry.registerComponentRenderer(resourceFormTabsRenderer);
		registry.registerComponentRenderer(resourceCreateHeaderRenderer);
		registry.registerComponentRenderer(resourceCreateFormRenderer);
		registry.registerComponentRenderer(resourceSplitViewRenderer);

		registerFieldRenderers(registry);
	},
};
