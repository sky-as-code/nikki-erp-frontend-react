import * as dyn from '@nikkierp/common/dynamicModel';
import { mergeSearchGraphs, SearchData } from '@nikkierp/ui/components/DataTable';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { isSameSearchRequest } from './searchRequest';


export type UseResourceSearchOptions = {
	schemaName: string,
	searchCommand: string,
	/** Read once, on mount. Later changes are ignored — use `baseGraph`. */
	initialRequest: dyn.RestSearchRequest,
	/**
	 * A scoping condition the page author fixed, ANDed with whatever the user filters on.
	 *
	 * Re-applied whenever it changes. It narrows the user's query and is never shown as an
	 * editable condition, so an embedded table's record scoping cannot be widened away.
	 */
	baseGraph?: dyn.SearchGraph,
};

export type UseResourceSearchResult = {
	pack: dyn.SchemaPack | null,
	/** Cached across pending requests, so the table does not flicker. */
	searchData: SearchData | null,
	searchRequest: dyn.RestSearchRequest,
	onSearchRequestChange: (request: dyn.RestSearchRequest) => void,
	refresh: () => void,
};

/**
 * True for the `size: 0` stub that `RestApi.search` resolves locally, without an HTTP call.
 *
 * The caller seeds that stub so the first round-trip is free, and `DataTable` rewrites it into
 * the first real request. It must therefore still reach the table — it is what *starts* the
 * real search — but it carries no `desired_fields`, so it must never displace real rows in the
 * cache, or the table would render a header-less body over them.
 */
export function isStubSearchData(data: SearchData | null): boolean {
	return data != null && data.size === 0 && data.desired_fields.length === 0;
}

/**
 * The schema + search plumbing shared by the resource list page and the
 * related-records table: fetch the schema pack, publish the search command
 * whenever the request changes, and keep the last result so a pending request
 * does not blank the table.
 */
export function useResourceSearch(opts: UseResourceSearchOptions): UseResourceSearchResult {
	const pack = useSchemaPack(opts.schemaName);
	const search = useCommand<dyn.RestSearchResponse<any>>(opts.searchCommand);
	// Initialiser form: a fresh object literal from the caller must not retrigger.
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(() => opts.initialRequest);
	const [cachedSearchData, setCachedSearchData] = React.useState<SearchData | null>(null);

	const onSearchRequestChange = React.useCallback((newReq: dyn.RestSearchRequest) => {
		setSearchRequest(oldReq => isSameSearchRequest(oldReq, newReq) ? oldReq : newReq);
	}, []);

	// The base graph is prop-derived, so it must be merged during render rather than folded into
	// `searchRequest` by an effect. `searchCommand` (and with it `publish`) changes synchronously
	// on the render that new props arrive, while a state write lands one render later; publishing
	// in between sends one resource's filter graph to another resource's endpoint. A route change
	// that swaps both at once — /users/:id to /roles/:id, which reuses this component because the
	// router keys routes by pattern — did exactly that, and the server rejected the unknown field.
	//
	// ANDed, not substituted: the base narrows the user's query. Substituting discarded every
	// filter and sort the user had set on any page carrying one.
	const baseGraph = opts.baseGraph;
	const userGraph = searchRequest.graph;
	const mergedGraph = React.useMemo(
		() => mergeSearchGraphs(baseGraph, userGraph),
		[baseGraph, userGraph],
	);
	// Memoised on the merged graph rather than rebuilt inline: `isSameSearchRequest` compares
	// `graph` by reference, so a fresh object every render would republish forever.
	const effectiveRequest = React.useMemo(
		() => baseGraph === undefined ? searchRequest : { ...searchRequest, graph: mergedGraph },
		[searchRequest, baseGraph, mergedGraph],
	);

	const publishSearch = search.publish;
	const refresh = React.useCallback(() => {
		void publishSearch(effectiveRequest);
	}, [publishSearch, effectiveRequest]);

	// Guarded on `pack`: it is null while the schema pack still describes the previous resource,
	// which is the same stale window, so this also suppresses a request built from props that
	// have not fully settled.
	React.useEffect(() => {
		if (!pack) {
			return;
		}
		void publishSearch(effectiveRequest);
	}, [pack, publishSearch, effectiveRequest]);

	// Rows and schema must describe the same resource. The cache outlives a schema change when the
	// hook is reused rather than remounted (a split view swapping panes), and stale rows rendered
	// against the new schema miss every field lookup, so each cell falls back to `String(value)`.
	// The graph is included because /users/1 to /users/2 changes neither schema nor command, yet
	// must not keep showing record 1's rows while record 2's search is in flight.
	React.useEffect(() => {
		setCachedSearchData(null);
	// Keyed on `baseGraph` alone, not the merged graph: the merged one changes on every user
	// filter edit, and blanking the cache there would flash an empty table on each Apply.
	}, [opts.schemaName, opts.searchCommand, baseGraph]);

	React.useEffect(() => {
		if (search.data && !isStubSearchData(search.data as SearchData)) {
			setCachedSearchData(search.data as SearchData);
		}
	}, [search.data]);

	// Prefer the cache over the stub: the stub resolves synchronously and would otherwise beat
	// every real response to the table, blanking its columns for a frame. It still has to be
	// handed over when there is nothing cached, because rewriting it is what starts the real
	// search — dropping it entirely leaves the page loading forever.
	const liveSearchData = search.data as SearchData | null;
	const searchData = isStubSearchData(liveSearchData)
		? (cachedSearchData ?? liveSearchData)
		: (liveSearchData ?? cachedSearchData);
	// The merged request, not the raw state: it is what was published, and `getSearchRequestOrderBy`
	// reads `graph.order` off it.
	return { pack, searchData, searchRequest: effectiveRequest, onSearchRequestChange, refresh };
}

function useSchemaPack(schemaName: string): dyn.SchemaPack | null {
	const commandBus = useCommandBus();
	const [pack, setPack] = React.useState<dyn.SchemaPack | null>(null);
	const [etag, setEtag] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		void dyn.publishGetSchema(commandBus, schemaName).then(next => {
			setPack(next);
			setEtag(next?.modelSchema?.etag);
		});
	}, [commandBus, schemaName, etag === pack?.modelSchema?.etag]);

	// `setPack` above lands a render after `schemaName` changed, so until it does, `pack` still
	// describes the previous resource. Reporting null instead keeps the callers' `!pack` gate shut
	// rather than letting them pair one resource's schema with another's rows.
	return pack?.schemaName === schemaName ? pack : null;
}
