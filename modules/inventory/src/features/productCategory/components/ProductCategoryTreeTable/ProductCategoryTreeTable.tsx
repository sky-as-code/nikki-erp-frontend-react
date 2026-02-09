/* eslint-disable max-lines-per-function */
import {
	ActionIcon,
	Box,
	Menu,
	Paper,
	ScrollArea,
	Table,
	Text,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconDotsVertical,
	IconEdit,
	IconEye,
	IconTrash,
} from '@tabler/icons-react';
import React from 'react';

import { localizedTextToString } from '../../../localizedText';

import type { ProductCategory } from '../../types';


export type ProductCategoryTreeRow = {
	category: ProductCategory;
	depth: number;
	parentName: string;
	hasChildren: boolean;
	isExpanded: boolean;
};

interface ProductCategoryTreeTableProps {
	rows: ProductCategoryTreeRow[];
	onToggleExpand: (categoryId: string) => void;
	onView: (categoryId: string) => void;
	onEdit: (categoryId: string) => void;
	onDelete: (categoryId: string) => void;
}

const INDENT_PER_LEVEL = 24;

export function ProductCategoryTreeTable({
	rows,
	onToggleExpand,
	onView,
	onEdit,
	onDelete,
}: ProductCategoryTreeTableProps): React.ReactElement {
	return (
		<Paper p='md' withBorder>
			<ScrollArea>
				<Table striped withTableBorder withColumnBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Category Name</Table.Th>
							<Table.Th>Parent Category</Table.Th>
							<Table.Th w={80}>Actions</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.length === 0 && (
							<Table.Tr>
								<Table.Td colSpan={3}>
									<Text c='dimmed' ta='center'>No categories found</Text>
								</Table.Td>
							</Table.Tr>
						)}
						{rows.map((row) => (
							<Table.Tr key={row.category.id}>
								<Table.Td>
									<Box pl={row.depth * INDENT_PER_LEVEL}>
										<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											{row.hasChildren ? (
												<ActionIcon
													variant='subtle'
													size='sm'
													onClick={() => onToggleExpand(row.category.id)}
													aria-label={row.isExpanded ? 'Collapse category' : 'Expand category'}
												>
													{row.isExpanded
														? <IconChevronDown size={16} />
														: <IconChevronRight size={16} />}
												</ActionIcon>
											) : (
												<Box w={28} />
											)}
											<Text fw={600}>{localizedTextToString(row.category.name)}</Text>
										</Box>
									</Box>
								</Table.Td>
								<Table.Td>{row.parentName}</Table.Td>
								<Table.Td>
									<Menu withinPortal position='bottom-end'>
										<Menu.Target>
											<ActionIcon variant='subtle' aria-label='Open category actions'>
												<IconDotsVertical size={16} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item
												leftSection={<IconEye size={14} />}
												onClick={() => onView(row.category.id)}
											>
												View
											</Menu.Item>
											<Menu.Item
												leftSection={<IconEdit size={14} />}
												onClick={() => onEdit(row.category.id)}
											>
												Edit
											</Menu.Item>
											<Menu.Item
												leftSection={<IconTrash size={14} />}
												color='red'
												onClick={() => onDelete(row.category.id)}
											>
												Delete
											</Menu.Item>
										</Menu.Dropdown>
									</Menu>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</ScrollArea>
		</Paper>
	);
}
