import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { LanguageCommands } from '../features/language/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The language catalogue. `routePath` lets a proxy (the Settings micro-app, at `languages`) mount the
 * same metadata under its own route; this module serves it at `essential_language`.
 */
export function buildLanguagePages(routePath = 'essential_language'): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildLanguageListProps(),
		secondary: buildLanguageDetailProps(),
	});

	return [definePage({
		routePath,
		template: splitView.template,
		props: splitView.props,
	})];
}

/** The list's columns are the schema's `default_search_fields`. */
function buildLanguageListProps() {
	return resourceListV2Props({
		schemaName: c.LANGUAGE_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		linkField: 'id',
		searchCommand: LanguageCommands.SEARCH,
		createEnabled: true,
		deleteCommand: LanguageCommands.DELETE,
	});
}

function buildLanguageDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.LANGUAGE_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: LanguageCommands.GET_BY_ID,
			create: LanguageCommands.CREATE,
			update: LanguageCommands.UPDATE,
			delete: LanguageCommands.DELETE,
		},
		createNodes: [buildLanguageFieldsSection()],
		childrenNodes: [buildLanguageFieldsSection()],
		// The pattern fields read with their example and edit with the directive help (wiki 04 §4).
		fieldRenderers: {
			date_format: { renderer: 'strftimeFormat' },
			time_format: { renderer: 'strftimeFormat' },
			short_time_format: { renderer: 'strftimeFormat' },
			grouping: { renderer: 'numberGrouping' },
		},
	});
}

/** Shared by both form modes: what the language is, then how it formats dates and numbers. */
function buildLanguageFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.ESSENTIAL_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.generalInformation',
			fields: ['name', 'locale_code', 'direction', 'is_enabled'],
		}),
		resourceFormColumnNode({
			header: 'form.formats',
			fields: [
				'date_format', 'time_format', 'short_time_format', 'first_day_of_week',
				'decimal_separator', 'thousands_separator', 'grouping',
			],
		}),
	]);
}
