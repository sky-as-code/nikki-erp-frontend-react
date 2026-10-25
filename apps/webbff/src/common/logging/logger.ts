export interface Logger {
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
}

export function createConsoleLogger(): Logger {
	return {
		info: (message, ...args) => console.log(message, ...args),
		warn: (message, ...args) => console.warn(message, ...args),
		error: (message, ...args) => console.error(message, ...args),
	};
}
