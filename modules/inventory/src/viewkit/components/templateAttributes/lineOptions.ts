import type { AttributeCatalogue, CatalogueAttribute, CatalogueValue } from './attributeCatalogue';
import type { TemplateConfigDraft } from './templateConfigDrafts';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The attributes already on a line of the table, saved or draft. A line removed in this edit is no
 * longer in the draft, so its attribute is offered again.
 */
export function usedAttributeIds(draft: TemplateConfigDraft): Set<string> {
	return new Set(draft.lines.map(line => line.attributeId));
}

/**
 * What the insert row offers: the non-archived attributes no line holds yet. The row's own pick stays
 * listed, or the select would drop the value it shows.
 */
export function selectableAttributes(
	catalogue: AttributeCatalogue, draft: TemplateConfigDraft, current: string,
): CatalogueAttribute[] {
	const used = usedAttributeIds(draft);
	return [...catalogue.attributes.values()]
		.filter(item => item.id === current || (!item.isArchived && !used.has(item.id)));
}

/** The attribute's non-archived values; one archived after it was selected stays, so the line keeps it. */
export function selectableValues(
	catalogue: AttributeCatalogue, attributeId: string, selectedIds: string[],
): CatalogueValue[] {
	const selected = new Set(selectedIds);
	return catalogue.valuesOf(attributeId).filter(value => !value.isArchived || selected.has(value.id));
}

/**
 * The "Browse all…" picker's scope for attributes: those no line holds. The picker's search hides
 * archived rows by itself.
 */
export function attributePickerGraph(draft: TemplateConfigDraft): dyn.SearchGraph | undefined {
	const used = [...usedAttributeIds(draft)].filter(id => id !== '');
	return used.length > 0 ? { if: ['id', 'not_in', ...used] } : undefined;
}

export function valuePickerGraph(attributeId: string): dyn.SearchGraph {
	return { if: ['attribute_id', '=', attributeId] };
}

/**
 * The values after an Apply in the picker: what was picked, plus the archived values the line
 * already held. The picker never lists those, so leaving them out would drop them silently.
 */
export function mergePickedValues(
	catalogue: AttributeCatalogue, selectedIds: string[], pickedIds: string[],
): string[] {
	const keptArchived = selectedIds.filter(id => catalogue.values.get(id)?.isArchived === true);
	return [...new Set([...keptArchived, ...pickedIds])];
}
