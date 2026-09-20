import { z } from 'zod';


/**
 * The row body of the enclosing `ExcelDataTable`.
 *
 * Everything it draws — rows, columns, selection, inline edits — comes from the table context,
 * so the node carries almost nothing. There is deliberately no `className`: a CSS-module class
 * cannot be named from page JSON, and the body's layout belongs to the component rather than to
 * each template that hosts it.
 */
export const excelDataTableBodyPropsSchema = z.object({
	/** i18n key, shown in place of rows when the result set is empty. */
	emptyText: z.string().min(1).optional(),
}).strict();

export type ExcelDataTableBodyProps = z.infer<typeof excelDataTableBodyPropsSchema>;
export type ExcelDataTableBodyPropsInput = z.input<typeof excelDataTableBodyPropsSchema>;
