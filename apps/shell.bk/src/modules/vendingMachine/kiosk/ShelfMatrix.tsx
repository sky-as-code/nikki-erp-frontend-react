'use client';

import { ActionIcon, Anchor, Avatar, Group, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';

import classes from './ShelfMatrix.module.css';

type Person = {
	firstName: string
	lastName: string
	age: number
	visits: number
	status: string
	progress: number
};

type KioskSlot = {
	// TODO: Product should be another type
	product: {
		name: string,
		photo: string,
	},
	maxQuantity: number,
	currentQuantity: number,
	isAlert: boolean,
};

const defaultData: Person[] = [
	{
		firstName: 'tanner',
		lastName: 'linsley',
		age: 24,
		visits: 100,
		status: 'In Relationship',
		progress: 50,
	},
	{
		firstName: 'tandy',
		lastName: 'miller',
		age: 40,
		visits: 40,
		status: 'Single',
		progress: 80,
	},
	{
		firstName: 'joe',
		lastName: 'dirte',
		age: 45,
		visits: 20,
		status: 'Complicated',
		progress: 10,
	},
];

const columnHelper = createColumnHelper<KioskSlot[]>();

function createRowHeaderDef(): ColumnDef<KioskSlot[]> {
	return columnHelper.display({
		id: 'col-0',
		header: '',
		cell: (props) => {
			return (
				<Stack gap='md' align='center' className='text-center'>
					<Text size='md' fw='bold'>{ String.fromCharCode(65 + props.row.index) }</Text>
					<Text size='md'>Push Tape</Text>
					<ActionIcon variant='subtle' size='xl'><IconTrash color='red' /></ActionIcon>
				</Stack>
			);
		},
	});
}

function createColumnDef(colIdx: number): ColumnDef<KioskSlot[]> {
	return {
		id: 'col-' + colIdx,
		header: String(colIdx),

		cell: (props) => {
			// const row = props.row[props.rowIdx];
			const { row: { index : rowIdx } } = props;
			const colIdx = props.column.getIndex();
			const model = props.row.original[colIdx];

			return (
				<Stack gap='sm' className={clsx({
					// [classes.warningSlot]: rowIdx == 1 && colIdx == 1,
				})}>
					<Text size='md' fw='bold'>{rowIdx}-{colIdx}. Coca Zero Chất Xơ </Text>
					<Group gap='sm' justify='space-between'>
						<Avatar />
						<div>
							<div>
								<Anchor>Copy</Anchor> /
								<Anchor>Paste</Anchor>
							</div>
							<Text size='md'>5/5</Text>
						</div>
					</Group>
					<Group gap='md' justify='space-between'>
						<ActionIcon variant='subtle' size='xl'><IconTrash color='red' /></ActionIcon>
						<ActionIcon variant='subtle' size='xl'><IconPencil color='blue' /></ActionIcon>
						{/* <IconCircleFilled color={(rowIdx + colIdx) % 2 === 0 ? 'orange' : 'green'} /> */}
					</Group>
				</Stack>
			);
		},
	};
}

const matrix: KioskSlot[][] = [];

for (let i = 0; i < 10; ++i) {
	matrix.push(Array(10).fill({
		product: {
			name: 'Coca Zero Chất Xơ',
			photo: '',
		},
		maxQuantity: 5,
		currentQuantity: 5,
		isAlert: true,
	}));
}


// eslint-disable-next-line max-lines-per-function
export const ShelfMatrix: React.FC = () => {
	const maxCols = 10;
	const columnDef: ColumnDef<KioskSlot[]>[] = [
		createRowHeaderDef(),
	];

	for (let i = 1; i <= maxCols; ++i) {
		columnDef.push(createColumnDef(i));
	}

	const columns = React.useMemo(() => columnDef, []);

	const [data, _setData] = React.useState(() => [...defaultData]);

	const table = useReactTable({
		data: matrix,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className={classes.shelfMatrix}>
			<table>
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<th key={header.id}
									className={clsx(
										'text-center p-2 min-w-[145px]',
										{'sticky left-0 !bg-white !z-20': header.index === 0},
									)}>
									{header.isPlaceholder
										? null
										: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map(row => (
						<tr key={row.id}>
							{row.getVisibleCells().map(cell => (
								<td key={cell.id} className={clsx(
									'p-2',
									{
										[classes.warningSlot]: row.index == 1 && cell.column.getIndex() == 1,
									},
									{
										['sticky left-0 !z-10 !bg-white']: cell.column.getIndex() === 0,
									}
								)}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					{table.getFooterGroups().map(footerGroup => (
						<tr key={footerGroup.id}>
							{footerGroup.headers.map(header => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
											header.column.columnDef.footer,
											header.getContext(),
										)}
								</th>
							))}
						</tr>
					))}
				</tfoot>
			</table>
		</div>
	);
};
