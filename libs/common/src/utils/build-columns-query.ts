import { camelToSnakeCase } from './string';


export const buildColumnsQuery = <T extends object>(columns: Array<keyof T> = []): Array<['columns', string]> => {
	return columns.map((column) => ['columns', camelToSnakeCase(String(column))]);
};
