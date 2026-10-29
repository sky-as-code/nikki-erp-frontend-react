import { useWatchedFormValues } from '@nikkierp/ui/components/form';
import React from 'react';

import type { FieldVisibilityMode } from './fieldVisibility';
import type { OwnPropertySection } from '../resourceDetail/props';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { RecordSearchScope } from '@nikkierp/ui/components/form';


export type RelationSearchSpec = NonNullable<OwnPropertySection['relationSearch']>;

/** The form fields whose values narrow a select of the spec. */
export function relationSearchSourceFields(spec: RelationSearchSpec | undefined): string[] {
	if (!spec) {
		return [];
	}
	const fields = Object.values(spec).flatMap(entry => Object.values(entry.matchFormFields ?? {}));
	return Array.from(new Set(fields)).sort();
}

/** Each select's scope for the current form values. A source field left empty narrows nothing. */
export function buildRelationSearchScopes(
	spec: RelationSearchSpec, values: Record<string, unknown>,
): Record<string, RecordSearchScope> {
	return Object.fromEntries(Object.entries(spec).map(([field, entry]) => {
		const conditions: dyn.SearchNode[] = Object.entries(entry.matchFormFields ?? {})
			.filter(([, formField]) => hasValue(values[formField]))
			.map(([targetField, formField]) => ({ if: [targetField, '=', values[formField]] }));
		const graph: dyn.SearchNode | undefined = conditions.length > 1 ? { and: conditions } : conditions[0];
		return [field, { searchField: entry.searchField, graph }];
	}));
}

function hasValue(value: unknown): boolean {
	return value !== undefined && value !== null && value !== '';
}

/**
 * The scopes of one block's relation selects, following the live form. Read mode renders no select,
 * so it watches nothing.
 */
export function useRelationSearchScopes(
	spec: RelationSearchSpec | undefined, mode: FieldVisibilityMode,
): Record<string, RecordSearchScope> | undefined {
	const sources = React.useMemo(() => relationSearchSourceFields(spec), [spec]);
	const live = useWatchedFormValues(mode === 'read' ? noFields : sources);
	return React.useMemo(
		() => (spec ? buildRelationSearchScopes(spec, live ?? {}) : undefined),
		[spec, live],
	);
}

const noFields: string[] = [];
