import driveFileSchemaJson from '../../file-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';

/**
 * Schema từ file-schema.json, thêm 2 cột ảo cho bảng: type (Folder/File), actions.
 */
const baseSchema = driveFileSchemaJson as ModelSchema;

export const DRIVE_FILE_TABLE_SCHEMA: ModelSchema = baseSchema;
// export const DRIVE_FILE_TABLE_SCHEMA: ModelSchema = {
// 	...baseSchema,
// 	fields: {
// 		...baseSchema.fields,
// 		type: {
// 			type: 'string',
// 			label: "{ \"$ref\": 'nikki.drive.table.type' }",
// 		},
// 		actions: {
// 			type: 'string',
// 			label: "{ \"$ref\": 'nikki.drive.table.actions' }",
// 		},
// 	},
// };

export const DRIVE_FILE_TABLE_COLUMNS = [
	'name',
	'type',
	'size',
	'visibility',
	'status',
	'createdAt',
	'actions',
] as const;

export type DriveFileTableColumn = typeof DRIVE_FILE_TABLE_COLUMNS[keyof typeof DRIVE_FILE_TABLE_COLUMNS];
