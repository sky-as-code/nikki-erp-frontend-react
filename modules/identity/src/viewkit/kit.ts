import { VIEW_ENGINE_API_VERSION } from '@nikkierp/viewengine/core';

import { assignmentChangeSummaryRenderer } from './components/AssignmentChangeSummary';
import { entitlementChangeListRenderer } from './components/EntitlementChangeList';
import {
	roleAssignmentAcknowledgeRenderer, roleAssignmentActionsRenderer, roleAssignmentErrorRenderer,
} from './components/roleAssignmentParts';
import { rolePickerRenderer } from './components/RolePicker';
import { IDENTITY_VIEW_KIT_ID } from './ids';
import { roleAssignmentTemplate } from './pages/template';

import type { IViewEngine, IViewKit } from '@nikkierp/viewengine/core';


/**
 * IAM-specific view contributions.
 *
 * They live in the module rather than in `viewkit-mantine` because a role-assignment wizard is
 * not a general-purpose template — the kit exists so the pages can stay plain JSON metadata
 * while the behaviour stays owned by the module that needs it.
 */
export const identityViewKit: IViewKit = {
	id: IDENTITY_VIEW_KIT_ID,
	version: '1.0.0',
	engineApiVersions: [VIEW_ENGINE_API_VERSION],

	contribute(registry) {
		registry.registerPageTemplate(roleAssignmentTemplate);

		registry.registerComponentRenderer(roleAssignmentActionsRenderer);
		registry.registerComponentRenderer(roleAssignmentErrorRenderer);
		registry.registerComponentRenderer(roleAssignmentAcknowledgeRenderer);
		registry.registerComponentRenderer(assignmentChangeSummaryRenderer);
		registry.registerComponentRenderer(rolePickerRenderer);
		registry.registerComponentRenderer(entitlementChangeListRenderer);
	},
};

/**
 * Installs the kit onto the host-owned engine. `use` is idempotent per kit id, so calling it
 * again from a re-run `init` is harmless.
 */
export function contributeIdentityViewKit(engine: IViewEngine): void {
	engine.use(identityViewKit);
}
