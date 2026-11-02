import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';
import { CurrencyCommands } from '../features/currency/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const SYMBOL_POSITION_BADGE = {
	renderer: 'enum',
	colorMap: { before: 'blue', after: 'teal' },
	prefix: 'symbol_position.',
} as const;

/** The currency catalogue, mounted by Settings at `essential/essential_currency`; Settings › Accounting links there. */
export function buildCurrencyPages(routePath = c.CURRENCY_ROUTE): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildCurrencyListProps(),
		secondary: buildCurrencyDetailProps(),
	});

	return [definePage({
		routePath,
		template: splitView.template,
		props: splitView.props,
	})];
}

/** The list's columns are the schema's `default_search_fields`. */
function buildCurrencyListProps() {
	return resourceListV2Props({
		schemaName: c.CURRENCY_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		linkField: 'id',
		searchCommand: CurrencyCommands.SEARCH,
		// The currencies the organization uses first, then by code.
		initialGraph: { order: [['is_active', 'desc'], ['code', 'asc']] },
		createEnabled: true,
		// A currency amounts were recorded in stays readable, so it is archived rather than deleted.
		archiveCommand: CurrencyCommands.SET_IS_ARCHIVED,
		deleteCommand: CurrencyCommands.DELETE,
		fieldRenderers: { symbol_position: SYMBOL_POSITION_BADGE },
	});
}

function buildCurrencyDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.CURRENCY_SCHEMA_NAME,
		translationNs: c.ESSENTIAL_MODULE,
		titleLvl1: { schemaField: 'name' },
		backLinkTitle: { linkHref: '../' },
		standardActionCommands: {
			getById: CurrencyCommands.GET_BY_ID,
			create: CurrencyCommands.CREATE,
			update: CurrencyCommands.UPDATE,
			delete: CurrencyCommands.DELETE,
		},
		createNodes: buildCurrencySections(),
		childrenNodes: buildCurrencySections(),
		fieldRenderers: { symbol_position: SYMBOL_POSITION_BADGE },
	});
}

/** One section: identity and naming, then how amounts are rounded and how they are written. */
function buildCurrencySections(): ComponentNode[] {
	return [
		collapsibleSectionNode({
			layout: 'formBlocks',
			translationNs: c.ESSENTIAL_MODULE,
			header: 'form.generalInformation',
		}, [
			resourceFormColumnNode({ fields: ['code', 'name', 'is_active'] }),
			resourceFormColumnNode({ fields: ['symbol', 'currency_unit_label', 'currency_subunit_label'] }),
			// decimal_places follows rounding on the server and is never written by a client.
			resourceFormColumnNode({
				header: 'form.priceAccuracy',
				fields: ['rounding', 'decimal_places'],
				readOnlyFields: ['decimal_places'],
			}),
			resourceFormColumnNode({ header: 'form.display', fields: ['symbol_position'] }),
		]),
	];
}
