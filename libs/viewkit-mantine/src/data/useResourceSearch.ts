import * as dyn from '@nikkierp/common/dynamicModel';
import { SearchData } from '@nikkierp/ui/components/DataTable';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { isSameSearchRequest } from './searchRequest';


export type UseResourceSearchOptions = {
	schemaName: string,
	searchCommand: string,
	/** Read once, on mount. Later changes are ignored — use `graphOverride`. */
	initialRequest: dyn.RestSearchRequest,
	/** Re-applied whenever it changes; merged into the live request. */
	graphOverride?: dyn.SearchGraph,
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

	const graphOverride = opts.graphOverride;
	React.useEffect(() => {
		if (graphOverride === undefined) {
			return;
		}
		setSearchRequest(oldReq => oldReq.graph === graphOverride ? oldReq : { ...oldReq, graph: graphOverride });
	}, [graphOverride]);

	const publishSearch = search.publish;
	const refresh = React.useCallback(() => {
		void publishSearch(searchRequest);
	}, [publishSearch, searchRequest]);

	React.useEffect(() => {
		void publishSearch(searchRequest);
	}, [publishSearch, searchRequest]);

	React.useEffect(() => {
		if (search.data) {
			setCachedSearchData(search.data as SearchData);
		}
	}, [search.data]);

	const searchData = (search.data as SearchData | null) ?? cachedSearchData;
	return { pack, searchData, searchRequest, onSearchRequestChange, refresh };
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

	return pack;
}
