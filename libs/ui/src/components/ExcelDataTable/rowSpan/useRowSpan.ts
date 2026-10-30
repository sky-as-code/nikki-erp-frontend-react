import React from 'react';

import { flattenRowSpanItems, rowSpanActionColumns } from './rowSpanModel';
import { buildRowSpanFlatSchema, flattenRowSpanFields, resolveRowSpanConfig } from './rowSpanSchema';

import type { FlatRowSpanData, RowSpanGroup, RowSpanPlace } from './rowSpanModel';
import type { RowSpanConfig } from './rowSpanSchema';
import type { ExcelDataTableRowFeatureProps, RowCapabilities } from '../capabilities';
import type { RowId, SearchData, SearchItem } from '../types';
import type * as dyn from '@nikkierp/common/dynamicModel';


/** The Provider props of the grouped (row span) layout; see `docs/wiki/07. Excel data table.md` §5.11. */
export type ExcelDataTableRowSpanProps = {
	/**
	 * The group's anchor column. Every top-level field but `rowSingleField` is drawn once per group,
	 * spanning its sub-rows. Needs `rowSingleField`; each item of `data.items` is one group.
	 */
	rowSpanField?: string,
	/** A `model` field (one level) whose array holds the group's sub-rows; its nested fields are the sub-row columns. */
	rowSingleField?: string,
	/** Label of each group's idle sub-row insert button (already translated); default `datatable.addLine`. */
	subRowPrompt?: string,
};

/** The grouped layout as the table's parts read it (`context.rowSpan`); `null` renders the ordinary flat table. */
export type RowSpanApi = {
	config: RowSpanConfig,
	/** Each flat row's group, by flat row id (`{groupId}:{subIndex}`, `{groupId}:-` for a group without sub-rows). */
	places: Map<RowId, RowSpanPlace>,
	groups: RowSpanGroup[],
	rowsById: Map<RowId, SearchItem>,
	/** `update` is resolved: each group ends in its sub-row insert line and its sub-rows offer Delete. */
	withSubInsert: boolean,
	subRowPrompt: string | undefined,
};

type RowSpanDeps = {
	props: ExcelDataTableRowFeatureProps,
	modelSchema: dyn.ModelSchema | undefined,
	data: SearchData,
	tableName: string,
	rows: RowCapabilities,
};

export type ProviderRowSpan = {
	rowSpan: RowSpanApi | null,
	/** What the table renders: the flat rows and columns, or `data` unchanged. */
	data: SearchData,
	/** The flat schema every part reads, or the Provider's own. */
	modelSchema: dyn.ModelSchema | undefined,
	/** The row-feature props with the grouped layout's columns: sub-row actions added, manual sort off. */
	featureProps: ExcelDataTableRowFeatureProps,
};

/**
 * The Provider's side of the grouped layout: validates the props, flattens `data` and the schema,
 * and adjusts the row features. Without the props it hands `data`, the schema and the props back as is.
 */
export function useProviderRowSpan({ props, modelSchema, data, tableName, rows }: RowSpanDeps): ProviderRowSpan {
	const { rowSpanField, rowSingleField } = props;
	const resolution = React.useMemo(
		() => resolveRowSpanConfig(modelSchema, rowSpanField, rowSingleField),
		[modelSchema, rowSpanField, rowSingleField],
	);
	const { config } = resolution;
	const canUpdate = rows.capabilities.includes('update');
	useProblemReport(config ? usageProblems(props, rows) : resolution.problems, Boolean(config), tableName);
	const flatSchema = React.useMemo(
		() => (config && modelSchema ? buildRowSpanFlatSchema(modelSchema, config) : modelSchema),
		[config, modelSchema],
	);
	const flat = React.useMemo(() => (config ? flattenRowSpanItems(data.items, config) : null), [config, data.items]);
	const flatData = React.useMemo<SearchData>(() => (config && flat
		? { ...data, items: flat.rows, desired_fields: flattenRowSpanFields(data.desired_fields, config) }
		: data), [config, flat, data]);
	const rowSpan = useRowSpanApi(config, flat, canUpdate, props.subRowPrompt);
	const featureProps = useGroupedFeatureProps(props, config, canUpdate);
	return { rowSpan, data: flatData, modelSchema: flatSchema, featureProps };
}

function useRowSpanApi(
	config: RowSpanConfig | null, flat: FlatRowSpanData | null, canUpdate: boolean, subRowPrompt: string | undefined,
): RowSpanApi | null {
	return React.useMemo(() => (config && flat ? {
		config,
		places: flat.places,
		groups: flat.groups,
		rowsById: new Map(flat.rows.map(row => [row.id as RowId, row])),
		withSubInsert: canUpdate,
		subRowPrompt,
	} : null), [config, flat, canUpdate, subRowPrompt]);
}

function useGroupedFeatureProps(
	props: ExcelDataTableRowFeatureProps, config: RowSpanConfig | null, canUpdate: boolean,
): ExcelDataTableRowFeatureProps {
	const { actionColumns } = props;
	const columns = React.useMemo(
		() => (config ? rowSpanActionColumns(actionColumns, config, canUpdate) : actionColumns),
		[config, actionColumns, canUpdate],
	);
	return config ? { ...props, actionColumns: columns, enableManualSort: false } : props;
}

/** What a grouped table ignores, reported in development. */
function usageProblems(props: ExcelDataTableRowFeatureProps, rows: RowCapabilities): string[] {
	const problems: string[] = [];
	if (props.enableManualSort) {
		problems.push('enableManualSort is ignored with rowSpanField');
	}
	if (rows.capabilities.includes('update') && rows.updateScope !== 'table') {
		problems.push(`rowSpanField edits in updateScope 'table' only; the fields stay read-only here`);
	}
	return problems;
}

function useProblemReport(problems: string[], isGrouped: boolean, tableName: string): void {
	const key = import.meta.env.DEV ? problems.join('; ') : '';
	React.useEffect(() => {
		if (key) {
			console.warn(`ExcelDataTable '${tableName}': ${key}${isGrouped ? '' : ' (rendering flat)'}`);
		}
	}, [key, isGrouped, tableName]);
}
