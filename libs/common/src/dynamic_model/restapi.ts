import { RequestMaker } from '../request/request';

import type { ModelSchema } from './model_schema';


export type RestApiOptions = {
	requestMaker: RequestMaker,
	resourcePath: string,
	primaryResourcePath?: string,
};

export class RestApi {
	private _opts: RestApiOptions;
	private _basePath: string = '';

	constructor(opts: RestApiOptions) {
		this._opts = opts;
		if (!opts.primaryResourcePath) {
			this._basePath = opts.resourcePath;
		}
	}

	public create(request: RestCreateRequest, primaryResourceId?: string): Promise<RestCreateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker.post<RestCreateResponse>(restPath, { json: request });
	}

	public delete(request: RestDeleteRequest, primaryResourceId?: string): Promise<RestDeleteResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker.delete<RestDeleteResponse>(`${restPath}/${request.id}`, { searchParams: request });
	}

	public exists(request: RestExistsRequest): Promise<RestExistsResponse> {
		const restPath = this._getBasePath();
		return this._opts.requestMaker.post<RestExistsResponse>(restPath + '/exists', {
			searchParams: this._toSearchParams(request),
		});
	}

	public getOne(request: RestGetOneRequest, primaryResourceId?: string): Promise<RestGetOneResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker.get<RestGetOneResponse>(`${restPath}/${request.id}`, {
			searchParams: this._toSearchParams(request),
		});
	}

	public getModelSchema(primaryResourceId?: string): Promise<RestGetModelSchemaResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker.get<RestGetModelSchemaResponse>(`${restPath}/meta/schema`);
	}

	public manageM2m(
		request: RestManageM2mRequest, path: string, primaryResourceId?: string,
	): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const { add: _, remove: __, ...primaryKey } = request;
		if (Object.keys(primaryKey).length !== 0) {
			throw new Error('manageM2m: Must define key field(s)');
		}
		return this._opts.requestMaker.post<RestMutateResponse>(`${restPath}/${path}`, { json: request });
	}

	public search(request: RestSearchRequest, primaryResourceId?: string): Promise<RestSearchResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		return this._opts.requestMaker.get<RestSearchResponse>(restPath, {
			searchParams: this._toSearchParams(request),
		});
	}

	public setIsArchived(request: RestSetIsArchivedRequest, primaryResourceId?: string): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker.post<RestMutateResponse>(`${restPath}/${id}/archived`, { json: body });
	}

	public update(request: RestUpdateRequest, primaryResourceId?: string): Promise<RestMutateResponse> {
		const restPath = this._getBasePath(primaryResourceId);
		const { id, ...body } = request;
		return this._opts.requestMaker.put<RestMutateResponse>(`${restPath}/${id}`, { json: body });
	}

	private _getBasePath(primaryResourceId?: string): string {
		if (this._opts.primaryResourcePath) {
			if (primaryResourceId) { throw new Error('primaryResourceId is required'); }
			return `${this._opts.primaryResourcePath}/${primaryResourceId}/${this._opts.resourcePath}`;
		}
		return this._basePath;
	}

	private _toSearchParams(request: Record<string, any>): URLSearchParams {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(request)) {
			if (value == null) continue;
			if (Array.isArray(value)) {
				value.forEach(item => searchParams.append(key, item));
				continue;
			}
			else if (typeof value === 'object') {
				throw new Error('Unsupported value type in SearchParams');
			}
			searchParams.append(key, String(value));
		}
		return searchParams;
	}

}

export type RestCreateRequest = Record<string, any>;

export type RestCreateResponse = {
	id: string;
	etag: string;
	created_at: string;
};

export type RestDeleteRequest = {
	id: string;
};

export type RestDeleteResponse = {
	affected_count: number;
	affected_at: string;
};

export type RestExistsRequest = {
	ids: string[];
};

export type RestExistsResponse = {
	existing: string[];
	not_existing: string[];
};

export type RestGetOneRequest = {
	id: string;
	columns?: string[];
};

export type RestGetOneResponse = Record<string, any>;

export type RestGetModelSchemaResponse = ModelSchema;

export type RestSetIsArchivedRequest = {
	id: string;
	etag: string;
	is_archived: boolean;
};

export type RestSearchRequest = {
	columns?: string[];
	page?: number;
	size?: number;
	graph?: Record<string, any>;
	language?: string;
};

export type RestSearchResponse = {
	items: Array<Record<string, any>>;
	total: number;
	page: number;
	size: number;
};

export type RestUpdateRequest = Record<string, any> & {
	id: string;
	etag: string;
};

export type RestMutateResponse = {
	affected_count: number;
	affected_at: string;
	etag: string;
};

export type RestManageM2mRequest = Record<string, any> & {
	add?: string[];
	remove?: string[];
};