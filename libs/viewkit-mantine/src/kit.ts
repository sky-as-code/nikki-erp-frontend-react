import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { collapsibleSectionRenderer } from './components/collapsibleSection/CollapsibleSection';
import { excelDataTableBodyRenderer } from './components/excelDataTableBody/ExcelDataTableBody';
import { pageHeaderRenderer } from './components/pageHeader/PageHeader';
import { resourceFileFieldRenderer } from './components/resourceFileField/ResourceFileField';
import { resourceFormTabsRenderer } from './components/resourceFormTabs/ResourceFormTabs';
import { resourceSplitViewRenderer } from './components/resourceSplitView';
import { settingsItemRenderer } from './components/settings/settingsItem';
import { settingsSectionRenderer } from './components/settings/settingsSection';
import { tabCollapsibleSectionRenderer } from './components/tabCollapsibleSection/TabCollapsibleSection';
import { registerFieldRenderers } from './fields/register';
import { MANTINE_VIEW_KIT_ID } from './ids';
import { resourceCreateFormV2Renderer } from './pages/resourceDetailV2/form/resourceCreateForm';
import { resourceCreateHeaderV2Renderer } from './pages/resourceDetailV2/form/resourceCreateHeader';
import { resourceDetailHeaderV2Renderer } from './pages/resourceDetailV2/form/resourceDetailHeader';
import { resourceFormV2Renderer } from './pages/resourceDetailV2/form/resourceForm';
import { resourceFormColumnV2Renderer } from './pages/resourceDetailV2/form/resourceFormColumn';
import { resourceDetailV2Template } from './pages/resourceDetailV2/template';
import { genericPageHeaderRenderer } from './pages/resourceGenericPage/GenericPageHeader';
import { resourceGenericPageTemplate } from './pages/resourceGenericPage/template';
import { importActionsRenderer } from './pages/resourceImport/ImportActions';
import { importBodyRenderer } from './pages/resourceImport/ImportBody';
import { resourceImportTemplate } from './pages/resourceImport/template';
import { resourceListV2Template } from './pages/resourceListV2/template';
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
		registry.registerPageTemplate(resourceListV2Template);
		registry.registerPageTemplate(resourceDetailV2Template);
		registry.registerPageTemplate(resourceSplitViewTemplate);
		registry.registerPageTemplate(resourceImportTemplate);
		registry.registerPageTemplate(resourceGenericPageTemplate);

		registry.registerComponentRenderer(pageHeaderRenderer);
		registry.registerComponentRenderer(collapsibleSectionRenderer);
		registry.registerComponentRenderer(tabCollapsibleSectionRenderer);
		registry.registerComponentRenderer(excelDataTableBodyRenderer);
		registry.registerComponentRenderer(resourceFileFieldRenderer);
		registry.registerComponentRenderer(settingsSectionRenderer);
		registry.registerComponentRenderer(settingsItemRenderer);
		registry.registerComponentRenderer(resourceFormTabsRenderer);
		registry.registerComponentRenderer(resourceDetailHeaderV2Renderer);
		registry.registerComponentRenderer(resourceFormV2Renderer);
		registry.registerComponentRenderer(resourceFormColumnV2Renderer);
		registry.registerComponentRenderer(resourceCreateHeaderV2Renderer);
		registry.registerComponentRenderer(resourceCreateFormV2Renderer);
		registry.registerComponentRenderer(resourceSplitViewRenderer);
		registry.registerComponentRenderer(genericPageHeaderRenderer);
		registry.registerComponentRenderer(importActionsRenderer);
		registry.registerComponentRenderer(importBodyRenderer);

		registerFieldRenderers(registry);
	},
};
