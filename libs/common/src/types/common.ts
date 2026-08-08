export class ClientErrors {
	public static canConvert(error: unknown): error is unknown[] {
		return Array.isArray(error) && error.every(ClientErrorItem.canConvert);
	}

	public static from(errors: unknown[]): ClientErrors {
		return new ClientErrors(errors.map(it => new ClientErrorItem(it)));
	}

	public static containsAuthorizationError(error: unknown): boolean {
		if (! (error instanceof ClientErrors)) {
			return false;
		}
		for (const item of error.#items) {
			if (ClientErrorItem.isAuthorizationError(item)) {
				return true;
			}
		}
		return false;
	}
	#items: ClientErrorItem[];

	public constructor(items: ClientErrorItem[]) {
		this.#items = items;
	}

	public get items(): ClientErrorItem[] {
		return this.#items;
	}

	public get length(): number {
		return this.#items.length;
	}

	public get(idx: number): ClientErrorItem | null {
		return this.#items[idx] ?? null;
	}

}

export class ClientErrorItem extends Error {
	public static canConvert(error: unknown): boolean {
		return (error instanceof ClientErrorItem) ||
			(typeof error === 'object' && error !== null && 'key' in error && 'message' in error && 'type' in error);
	}

	public static isAuthorizationError(error: unknown): boolean {
		return error instanceof ClientErrorItem && error.name === 'authorization';
	}

	public static isBusinessError(error: unknown): boolean {
		return error instanceof ClientErrorItem && error.name === 'business';
	}

	public static isValidationError(error: unknown): boolean {
		return error instanceof ClientErrorItem && error.name === 'validation';
	}

	#field?: string;
	#key: string;
	#message: string;
	#type: 'validation' | 'business' | 'authorization';

	/**
	 * @implements Error
	 */
	public get name(): 'validation' | 'business' | 'authorization' {
		return this.#type;
	}

	/**
	 * @implements Error
	 */
	public get message(): string {
		return this.#message;
	}

	public get field(): string | undefined {
		return this.#field;
	}

	public get key(): string {
		return this.#key;
	}

	public constructor(error: unknown) {
		super();
		if (error instanceof ClientErrorItem) {
			this.#field = error.#field;
			this.#key = error.#key;
			this.#type = error.#type;
			this.#message = error.#message;
		}
		else {
			this.#field = (error as any).field;
			this.#key = (error as any).key;
			this.#message = (error as any).message;
			this.#type = (error as any).type;
			const vars = (error as any).vars;
			if (vars) {
				this.#message = this.#interpolateMessage(this.#message, vars);
			}
		}
	}

	#interpolateMessage(message: string, vars?: Record<string, unknown>): string {
		if (!vars) {
			return message;
		}

		return message.replace(/\{\{\.(\w+)\}\}/g, (placeholder, key: string): string => {
			if (!(key in vars)) {
				return placeholder;
			}

			const value = vars[key];
			return value === null || value === undefined ? '' : String(value);
		});
	}
};


export type ApiResult<T> = {
	data?: T;
	errors?: string[];
};

/**
 * @deprecated Use RestCreateResponse instead
 */
export interface CreateResponse {
	id: string;
	etag: string;
	createdAt: Date;
};

/**
 * @deprecated Use RestMutateResponse instead
 */
export interface UpdateResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};

/**
 * @deprecated Use RestDeleteResponse instead
 */
export interface DeleteResponse {
	id: string;
	deletedAt: Date;
};

/**
 * @deprecated Use RestSearchResponse instead
 */
export interface SearchResponse<T> {
	items: T[];
	total: number;
	page: number;
	size: number;
};

/**
 * @deprecated Use RestSearchRequest instead
 */
export interface ListQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	[key: string]: unknown;
}

/**
 * @deprecated Use RestSearchResponse instead
 */
export interface ListResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * @deprecated
 */
export interface ManageMembersRequest {
	id: string;
	add?: string[];
	remove?: string[];
	etag: string;
};

/**
 * @deprecated Use RestManageM2mResponse instead
 */
export interface ManageMembersResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};