export type ImportFn = () => Promise<ImportResult>;

export type ImportResult<T = any> = {
	default: T;
};