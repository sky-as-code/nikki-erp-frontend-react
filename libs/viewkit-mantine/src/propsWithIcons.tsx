import React from 'react';

import { RESOURCE_LIST_V2_TEMPLATE } from './ids';
import {
	defaultListViewMode, resourceListV2PropsSchema, ResourceListV2Props, ResourceListV2PropsInput,
	ResourceListV2ViewModeInput,
} from './pages/resourceListV2/props';
import { registerViewModeIcon } from './pages/resourceListV2/viewModeIcons';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * A view mode as a page writes it, icon and all.
 *
 * This is the one authoring helper that takes a React element, which is why it lives here rather
 * than in `./props`: that module is imported by every `pages/*.ts` file and is deliberately
 * React-free. A page that wants an icon is a `.tsx` file and imports from the package root.
 */
export type ViewModeInput = Omit<ResourceListV2ViewModeInput, 'iconToken'> & {
	icon?: React.ReactNode,
};

export type ResourceListV2PropsWithIconsInput = Omit<ResourceListV2PropsInput, 'viewModes'> & {
	viewModes?: ViewModeInput[],
	/**
	 * Builds the view modes from the template's defaults — typically
	 * `defaults => defaults.concat([myMode])` to add one beside the table, or a fresh array to
	 * replace them outright.
	 *
	 * It runs here, where the page is authored, and only its result reaches page metadata. The
	 * function itself never does, which is what lets it take JSX icons at all.
	 */
	getViewModes?: (defaultViewModes: ViewModeInput[]) => ViewModeInput[],
};

/**
 * The v2 list page, with view modes.
 *
 * The plain `resourceListV2Props` in `./props` stays the default for a page that takes the table
 * as it comes; reach for this one when the page declares view modes of its own, and import it
 * from the package root rather than from `/props`.
 */
export function resourceListV2PropsWithViewModes(
	input: ResourceListV2PropsWithIconsInput,
): TemplateRef<ResourceListV2Props> {
	const { getViewModes, viewModes, ...rest } = input;
	if (getViewModes && viewModes) {
		throw new Error('resourceListV2PropsWithViewModes: pass either `viewModes` or `getViewModes`, not both');
	}
	// A fresh copy per call: the documented shape is `defaults.concat(...)`, but a factory that
	// reaches for `.push` instead would otherwise grow the default for every later page.
	const declared = getViewModes ? getViewModes([defaultListViewMode()]) : viewModes;
	return {
		template: RESOURCE_LIST_V2_TEMPLATE,
		props: resourceListV2PropsSchema.parse({
			...rest,
			viewModes: declared?.map(toMetadataViewMode),
		}),
	};
}

/** Splits a declared mode into the JSON half that is stored and the icon that cannot be. */
function toMetadataViewMode({ icon, ...mode }: ViewModeInput): ResourceListV2ViewModeInput {
	return icon === undefined ? mode : { ...mode, iconToken: registerViewModeIcon(icon) };
}
