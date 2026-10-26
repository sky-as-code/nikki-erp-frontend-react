import { resolveLangJson } from '@nikkierp/ui/components';
import { useCommand } from '@nikkierp/ui/hookhoc';
import React from 'react';

import { ProductAttributeCommands } from '../../../features/productAttribute/commands';
import { ProductAttributeValueCommands } from '../../../features/productAttributeValue/commands';

import type * as dyn from '@nikkierp/common/dynamicModel';


export type CatalogueAttribute = {
	id: string,
	name: unknown,
	code: string,
	mode: string,
	isArchived: boolean,
};

export type CatalogueValue = {
	id: string,
	attributeId: string,
	name: unknown,
	code: string,
	colorHex?: string,
	isArchived: boolean,
	sequence: number,
};

export type AttributeCatalogue = {
	attributes: Map<string, CatalogueAttribute>,
	values: Map<string, CatalogueValue>,
	/** The values of one attribute, archived included, in their own order. */
	valuesOf: (attributeId: string) => CatalogueValue[],
	isLoading: boolean,
};

/** The page size limit of a search. A catalogue past it is listed only in part. */
const PAGE_SIZE = 500;
const RETRY_DELAY_MS = 3000;
const ATTRIBUTE_FIELDS = ['id', 'code', 'name', 'variant_creation_mode', 'is_archived', 'sequence'];
const VALUE_FIELDS = ['id', 'attribute_id', 'code', 'name', 'color_hex', 'is_archived', 'sequence'];
const BY_SEQUENCE: dyn.OrderBy = [['sequence', 'asc'], ['code', 'asc']];

/**
 * The org's attributes, and the values of every attribute in `attributeIds`, archived included: a
 * line keeps showing an attribute or value archived after it was selected. Values load per attribute,
 * as lines name them, so a large catalogue is never read whole.
 */
export function useAttributeCatalogue(attributeIds: string[]): AttributeCatalogue {
	const attributes = useAttributes();
	const values = useValuesOf(attributeIds);
	const valuesOf = React.useCallback((attributeId: string) => [...values.map.values()]
		.filter(value => value.attributeId === attributeId)
		.sort((left, right) => left.sequence - right.sequence), [values.map]);
	return React.useMemo(() => ({
		attributes: attributes.map, values: values.map, valuesOf, isLoading: attributes.isLoading || values.isLoading,
	}), [attributes, values, valuesOf]);
}

function useAttributes() {
	const search = useCommand<dyn.RestSearchResponse<Record<string, unknown>>>(ProductAttributeCommands.SEARCH);
	const publish = search.publish;
	const [map, setMap] = React.useState(new Map<string, CatalogueAttribute>());
	const [isLoading, setIsLoading] = React.useState(true);
	React.useEffect(() => {
		void publish({
			fields: ATTRIBUTE_FIELDS, size: PAGE_SIZE, page: 0, include_archived: true, graph: { order: BY_SEQUENCE },
		}).then(response => {
			const items = response.result?.data?.items ?? [];
			setMap(new Map(items.map(item => [String(item.id), toAttribute(item)])));
			setIsLoading(false);
		});
	}, [publish]);
	return React.useMemo(() => ({ map, isLoading }), [map, isLoading]);
}

function useValuesOf(attributeIds: string[]) {
	const search = useCommand<dyn.RestSearchResponse<Record<string, unknown>>>(ProductAttributeValueCommands.SEARCH);
	const publish = search.publish;
	const [map, setMap] = React.useState(new Map<string, CatalogueValue>());
	const requested = React.useRef(new Set<string>());
	const [pending, setPending] = React.useState(0);
	const [, setRetries] = React.useState(0);
	const missingKey = attributeIds.filter(id => id !== '' && !requested.current.has(id)).sort().join(',');
	React.useEffect(() => {
		if (missingKey === '') {
			return;
		}
		const missing = missingKey.split(',');
		missing.forEach(id => requested.current.add(id));
		setPending(count => count + 1);
		void publish({
			fields: VALUE_FIELDS, size: PAGE_SIZE, page: 0, include_archived: true,
			graph: { if: ['attribute_id', 'in', ...missing], order: BY_SEQUENCE },
		}).then(response => {
			const items = response.result?.data?.items ?? [];
			setMap(previous => new Map([...previous, ...items.map(item => [String(item.id), toValue(item)] as const)]));
			setPending(count => count - 1);
			if (response.error != null || !response.result?.data) {
				// Asked again a little later: an empty dropdown would otherwise stay empty for good.
				setTimeout(() => {
					missing.forEach(id => requested.current.delete(id));
					setRetries(count => count + 1);
				}, RETRY_DELAY_MS);
			}
		});
	}, [missingKey, publish]);
	return React.useMemo(() => ({ map, isLoading: pending > 0 }), [map, pending]);
}

function toAttribute(item: Record<string, unknown>): CatalogueAttribute {
	return {
		id: String(item.id),
		name: item.name,
		code: String(item.code ?? ''),
		mode: String(item.variant_creation_mode ?? 'instant'),
		isArchived: item.is_archived === true,
	};
}

function toValue(item: Record<string, unknown>): CatalogueValue {
	return {
		id: String(item.id),
		attributeId: String(item.attribute_id ?? ''),
		name: item.name,
		code: String(item.code ?? ''),
		colorHex: typeof item.color_hex === 'string' ? item.color_hex : undefined,
		isArchived: item.is_archived === true,
		sequence: typeof item.sequence === 'number' ? item.sequence : 0,
	};
}

/** A `langjson` name by {@link resolveLangJson}, else `fallback` (the code). */
export function localizedName(raw: unknown, language: string, fallback: string): string {
	if (typeof raw === 'string' && raw !== '') {
		return raw;
	}
	if (raw === null || typeof raw !== 'object') {
		return fallback;
	}
	return resolveLangJson(raw as dyn.ModelSchemaLangJson, language) || fallback;
}
