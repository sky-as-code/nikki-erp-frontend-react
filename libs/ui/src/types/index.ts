import { ComponentType } from 'react';


export * from './navItem';

export type ImportFn = () => Promise<ImportResult>;

export type ImportResult = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default: ComponentType<any>;
};