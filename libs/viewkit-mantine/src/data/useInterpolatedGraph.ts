import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';
import { useParams } from 'react-router-dom';

import { interpolateParams, InterpolateResult } from './interpolate';

import type { ResourceTableProps } from '../components/resourceTable/props';


/**
 * `useParams()` returns a fresh object every render, so the memo is keyed on a
 * serialised form and re-parses it — keying on the object itself would rebuild
 * the graph every render and refetch forever.
 *
 * The result is additionally keyed on the interpolated graph's *value*: consumers
 * feed it straight into the published search request, and `interpolateParams`
 * allocates a new object per recompute, so identity alone would republish on every
 * render even when the resolved graph is unchanged.
 */
export function useInterpolatedGraph(
	initialGraph: ResourceTableProps['initialGraph'],
): InterpolateResult<dyn.SearchGraph | undefined> {
	const paramsKey = JSON.stringify(useParams());

	const resolved = React.useMemo(
		() => interpolateParams(initialGraph as dyn.SearchGraph | undefined, JSON.parse(paramsKey)),
		[initialGraph, paramsKey],
	);
	const resolvedKey = JSON.stringify(resolved);
	const stableRef = React.useRef(resolved);
	const stableKeyRef = React.useRef(resolvedKey);

	if (stableKeyRef.current !== resolvedKey) {
		stableKeyRef.current = resolvedKey;
		stableRef.current = resolved;
	}
	return stableRef.current;
}
