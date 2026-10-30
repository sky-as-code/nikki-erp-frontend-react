import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME, PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME,
} from '../../../../constants/inventory';
import { localizedName } from '../templateAttributes/attributeCatalogue';

import type { ICommandBus } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


const PAGE_SIZE = 200;
const BY_SEQUENCE: dyn.OrderBy = [['sequence', 'asc']];
const NEVER_MODE = 'never';

/** A template's attribute as the Attribute picker offers it: the catalogue attribute id, its line beside it. */
export type AttributeOption = { value: string, label: string, templateAttributeId: string };
/** A catalogue value the template offers for one of its attributes. */
export type ValueOption = { value: string, label: string };

type RawItem = Record<string, unknown>;

const NO_ITEMS: RawItem[] = [];

/**
 * The template's lines that make variants: enabled, and not `never` — by the snapshot the line was
 * applied with, else by its attribute's own mode. A never-mode attribute must not be sent with a move.
 */
export function toAttributeOptions(items: RawItem[], language: string): AttributeOption[] {
	return items
		.filter((item) => {
			const attribute = item.attribute as RawItem | undefined;
			const mode = item.variant_creation_snapshot ?? attribute?.variant_creation_mode;
			return item.is_enabled !== false && mode !== NEVER_MODE && Boolean(item.attribute_id);
		})
		.map(item => ({
			value: String(item.attribute_id),
			label: localizedName((item.attribute as RawItem | undefined)?.name, language, String(item.attribute_id)),
			templateAttributeId: String(item.id),
		}));
}

/** The values the line still offers (`is_selected`), by catalogue value id. */
export function toValueOptions(items: RawItem[], language: string): ValueOption[] {
	return items
		.filter(item => item.is_selected !== false && Boolean(item.attribute_value_id))
		.map(item => ({
			value: String(item.attribute_value_id),
			label: localizedName(item.attribute_value_name, language, String(item.attribute_value_id)),
		}));
}

export type MoveOptionLoaders = {
	attributesOf: (templateId: string) => Promise<RawItem[] | null>,
	valuesOf: (templateAttributeId: string) => Promise<RawItem[] | null>,
};

async function search(bus: ICommandBus, name: string, payload: dyn.RestSearchRequest): Promise<RawItem[] | null> {
	const response = await bus.publish<dyn.RestSearchResponse<RawItem>>({ name, payload });
	return response.error != null ? null : response.result?.data?.items ?? null;
}

/**
 * Option reads cached for the section's life, so the pickers of every sub-row of one template ask once.
 * A failed read is dropped from the cache: the next picker to mount asks again.
 */
export function useMoveOptionLoaders(): MoveOptionLoaders {
	const bus = useCommandBus();
	return React.useMemo(() => {
		const cache = new Map<string, Promise<RawItem[] | null>>();
		const cached = (key: string, read: () => Promise<RawItem[] | null>) => {
			const hit = cache.get(key) ?? read().then((items) => {
				if (!items) cache.delete(key);
				return items;
			});
			cache.set(key, hit);
			return hit;
		};
		return {
			attributesOf: templateId => cached(`a:${templateId}`, () => search(
				bus, resourceCommands(PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME).SEARCH, {
					page: 0, size: PAGE_SIZE,
					fields: ['id', 'attribute_id', 'is_enabled', 'variant_creation_snapshot', 'attribute.name',
						'attribute.variant_creation_mode'],
					graph: { if: ['product_template_id', '=', templateId], order: BY_SEQUENCE },
				},
			)),
			valuesOf: templateAttributeId => cached(`v:${templateAttributeId}`, () => search(
				bus, resourceCommands(PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME).SEARCH, {
					page: 0, size: PAGE_SIZE,
					fields: ['id', 'attribute_value_id', 'attribute_value_name', 'is_selected'],
					graph: { if: ['template_attribute_id', '=', templateAttributeId], order: BY_SEQUENCE },
				},
			)),
		};
	}, [bus]);
}

export const MoveOptionsContext = React.createContext<MoveOptionLoaders | null>(null);

export type LoadedOptions<T> = { options: T[], isPending: boolean, failed: boolean };

/** Options read through `load(key)`; none, and nothing read, while `key` is empty. */
export function useLoadedOptions<T>(
	key: string, load: ((key: string) => Promise<RawItem[] | null>) | undefined, map: (items: RawItem[]) => T[],
): LoadedOptions<T> {
	const [state, setState] = React.useState<{ key: string, items: RawItem[] | null, done: boolean }>(
		{ key: '', items: NO_ITEMS, done: true },
	);
	React.useEffect(() => {
		if (!key || !load) return;
		let active = true;
		setState({ key, items: NO_ITEMS, done: false });
		void load(key).then((items) => {
			if (active) setState({ key, items, done: true });
		});
		return () => {
			active = false;
		};
	}, [key, load]);
	const current = state.key === key ? state : { key, items: NO_ITEMS, done: !key };
	const options = React.useMemo(() => (current.items ? map(current.items) : []), [current.items, map]);
	return { options, isPending: !current.done, failed: current.items === null };
}
