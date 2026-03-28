export const toPlainJson = (obj: Record<string, any>): Record<string, any> => {
	const seen = new WeakSet();
	return JSON.parse(
		JSON.stringify(obj, (_key, value) => {
			if (typeof value === 'function' || typeof value === 'undefined') return null;
			if (typeof value === 'bigint') return value.toString();
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) return '[Circular]'; // Mark circular references
				seen.add(value);
			}
			return value;
		}),
	);
};

export const serializeError = (error: any) => {
	if (error instanceof Error) {
		return { message: error.message, stack: error.stack, name: error.name };
	}
	return error;
};

export const stringifyError = (error: any) => {
	return JSON.stringify(toPlainJson(serializeError(error)));
};
