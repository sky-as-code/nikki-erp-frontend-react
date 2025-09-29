import {
    ActionIcon,
    Anchor,
    Avatar,
    Grid,
    Group,
    Stack,
    TabsPanel,
    Text,
    useMantineColorScheme,
} from '@mantine/core'
import {
    IconCircleFilled,
    IconPencil,
    IconTrash,
} from '@tabler/icons-react'
import React from 'react'
import { DataGrid, Column } from 'react-data-grid'

import { TabList, TabListItem, Tabs } from '@/common/components/Tabs/Tabs'
import { ShelfMatrix } from '@/modules/vendingMachine/kiosk/ShelfMatrix'




export const UserDetail: React.FC<{
    id?: string;
    isSplit?: boolean;
}> = ({ id, isSplit }) => {
    return (
	<Grid grow className='w-full p-4 min-h-0'>
		<Grid.Col span='auto' className='h-full'>
			{/* <Paper className='h-full'> */}
			<Tabs
				variant='unstyled'
				defaultValue='stock-matrix'
				className='h-full flex flex-col'
                >
				<TabList>
					<TabListItem value='stock-matrix' fz='md'>
						Stock Matrix
					</TabListItem>
					<TabListItem value='messages' fz='md'>
						Messages
					</TabListItem>
					<TabListItem value='settings' fz='md'>
						Settings
					</TabListItem>
				</TabList>

				<TabsPanel value='stock-matrix' className='min-h-0 py-[1px]'>
					<ShelfMatrix />
				</TabsPanel>

				<TabsPanel value='messages'>
					<KioskMatrix />
				</TabsPanel>

				<TabsPanel value='settings'>Settings tab content</TabsPanel>
			</Tabs>
			{/* </Paper> */}
		</Grid.Col>
	</Grid>
    )
}

const KioskMatrix: React.FC = () => {
    const maxCols = 10
    const columnDef: Column<KioskSlot[]>[] = [createRowHeaderDef()]

    for (let i = 1; i <= maxCols; ++i) {
        columnDef.push(createColumnDef(i))
    }

    return <DataTable columnsDef={columnDef} rows={matrix} />
}

type DataTableProps = {
    columnsDef: Column<KioskSlot[]>[];
    rows: any[];
}

const DataTable: React.FC<DataTableProps> = React.memo((props) => {
    const columns = React.useMemo<any>(() => props.columnsDef, [])
    const { colorScheme } = useMantineColorScheme()

    return (
	<DataGrid
		columns={columns}
		rows={matrix}
		rowHeight={150}
		headerRowHeight={30}
		className={`h-full rdg-${colorScheme}`}
        />
    )
})

function createRowHeaderDef(): Column<KioskSlot[]> {
    return {
        key: 'col-0',
        name: '',
        frozen: true,
        renderCell: (props) => {
            // const row = props.row[props.rowIdx];
            return (
	<Stack gap='md' align='center' className='text-center'>
		<Text size='md' fw='bold'>
			{String.fromCharCode(65 + props.rowIdx)}
		</Text>
		<Text size='md'>Push Tape</Text>
		<ActionIcon variant='subtle' size='xl'>
			<IconTrash color='red' />
		</ActionIcon>
	</Stack>
            )
        },
        // header: '__',
        // Cell: ({ cell }) => {
        // 	// const row: KioskSlot[] = cell.row.original;
        // 	const rowIdx = cell.row.index;
        // 	return (
        // 		<Stack gap='md'>
        // 			<Text size='md' fw='bold'>{ String.fromCharCode(65 + rowIdx) }</Text>
        // 			<Text size='md'>Push Tape</Text>
        // 			<ActionIcon variant='subtle'><IconTrash color='red' /></ActionIcon>
        // 		</Stack>
        // 	)
        // },
    }
}

function createColumnDef(colIdx: number): Column<KioskSlot[]> {
    return {
        key: 'col-' + colIdx,
        name: String(colIdx),
        headerCellClass: 'text-center',
        renderCell: (props) => {
            // const row = props.row[props.rowIdx];
            const { rowIdx } = props
            const colIdx = props.column.idx
            return (
	<Stack gap='sm'>
		<Text size='md' fw='bold'>
			{rowIdx}-{colIdx}. Coca Zero Chất Xơ{' '}
		</Text>
		<Group gap='sm'>
			<Avatar />
			<div>
				<div>
					<Anchor>Copy</Anchor> /<Anchor>Paste</Anchor>
				</div>
				<Text size='md'>5/5</Text>
			</div>
		</Group>
		<Group gap='md' justify='space-between'>
			<ActionIcon variant='subtle' size='xl'>
				<IconTrash color='red' />
			</ActionIcon>
			<ActionIcon variant='subtle' size='xl'>
				<IconPencil color='blue' />
			</ActionIcon>
			<IconCircleFilled
				color={(rowIdx + colIdx) % 2 === 0 ? 'orange' : 'green'}
                        />
		</Group>
	</Stack>
            )
        },
    }
}

type KioskShelfType = {
    name: string;
    engine: 'hangingConveyor' | 'pushTape' | 'conveyor' | 'spring';
    unit: 'switch' | 'timer';
    slotCount: number;
}

type KioskShelf = {
    type: KioskShelfType;
    slots: KioskSlot[];
}

type KioskSlot = {
    // TODO: Product should be another type
    product: {
        name: string;
        photo: string;
    };
    maxQuantity: number;
    currentQuantity: number;
    isAlert: boolean;
}

// const row: KioskSlot[] = [
// 	{
// 		name: 'Aquafina 01',
// 		maxQuantity: 5,
// 		currentQuantity: 5,
// 		isAlert: true,
// 	},
// ];

const matrix: KioskSlot[][] = []

for (let i = 0; i < 10; ++i) {
    matrix.push(Array(10).fill({}))
}
