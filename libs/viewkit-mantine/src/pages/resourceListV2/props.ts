import { componentNodeSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';

import { excelDataTableBodyPropsSchema } from '../../components/excelDataTableBody/props';
import { initialGraphSchema } from '../../components/resourceTable/props';
import { EXCEL_DATA_TABLE_BODY } from '../../ids';
import { resourceListPropsSchema } from '../resourceList/props';


/**
 * One entry of the view-mode switcher.
 *
 * `viewkitComponent` is what makes a mode renderable: the template puts it inside the table's
 * `ForViewMode`, so a page contributes a view by naming a registered component rather than by
 * the template knowing about it. A mode without one renders nothing, which is a slot a page
 * means to fill later rather than an error.
 *
 * The icon is absent here on purpose. It is a React element, and page metadata has to survive
 * `JSON.stringify`, so `resourceListV2Props` keeps icons in a runtime map and stores only the
 * `iconToken` that finds one again.
 */
export const resourceListV2ViewModeSchema = z.object({
	mode: z.string().min(1),
	/** i18n key, translated with the list's `translationNs`. */
	label: z.string().min(1),
	viewkitComponent: componentNodeSchema.optional(),
	/** Assigned by the builder when the page passes a JSX icon; never authored by hand. */
	iconToken: z.string().min(1).optional(),
}).strict();

export type ResourceListV2ViewMode = z.infer<typeof resourceListV2ViewModeSchema>;
export type ResourceListV2ViewModeInput = z.input<typeof resourceListV2ViewModeSchema>;

/** The table's own rows: the `list` mode every page gets unless it says otherwise. */
export function defaultListViewMode(): ResourceListV2ViewModeInput {
	return {
		mode: 'list',
		label: 'datatable.list',
		viewkitComponent: {
			type: 'component',
			component: EXCEL_DATA_TABLE_BODY,
			props: excelDataTableBodyPropsSchema.parse({}),
		},
	};
}

/**
 * The v2 list page takes every v1 prop and adds what the composable table offers. `.strict()`
 * is inherited, so a misspelled key still fails at authoring time.
 */
export const resourceListV2PropsSchema = resourceListPropsSchema.extend({
	/**
	 * Search graph ANDed into every request and never shown in the filter panel, so the user cannot
	 * widen the list past it — e.g. two pages over one schema (`iam_user` humans vs. services).
	 * Unlike `initialGraph`, which only seeds editable conditions. `${today}` resolves as there.
	 */
	staticGraph: initialGraphSchema.optional(),
	/**
	 * i18n key of the list's title and breadcrumb, pluralised by `count` and translated with
	 * `translationNs`, for a page that lists a subset under its own name. Absent, the schema label.
	 */
	label: z.string().min(1).optional(),
	/** Publishes an inline row update `{id, etag?, ...changedFields}`; enables edit mode when set. */
	updateCommand: z.string().min(1).optional(),
	/**
	 * The only columns an inline row update edits, when the backend's update accepts fewer fields
	 * than the schema declares writable; every other column stays text. Absent, the schema decides.
	 */
	editableFields: z.array(z.string().min(1)).optional(),
	/**
	 * The action the backend asserts for the inline row update, when it is not `update` on the
	 * listed schema; copied from the application service's `AssertAction`.
	 */
	updateActionCode: z.string().min(1).optional(),
	/** The resource `updateActionCode` is checked on, when it is not the listed schema. */
	updateActionResource: z.string().min(1).optional(),
	/**
	 * The view modes offered, the first one being the initial mode. Each renders its own
	 * `viewkitComponent`; build the list with `getViewModes` to add one beside the default.
	 */
	viewModes: z.array(resourceListV2ViewModeSchema).min(1).default(() => [
		resourceListV2ViewModeSchema.parse(defaultListViewMode()),
	]),
}).strict();

export type ResourceListV2Props = z.infer<typeof resourceListV2PropsSchema>;
export type ResourceListV2PropsInput = z.input<typeof resourceListV2PropsSchema>;
