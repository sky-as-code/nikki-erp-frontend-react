import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { JsonToString } from '../../../utils/serializer';
import type { Unit } from '../types';

const CONVERSION_COLUMN = 'Base Unit / Multiplier';

interface UnitTableProps {
	units: Unit[];
	isLoading: boolean;
	schema: ModelSchema;
	columns: string[];
}

export function UnitTable({
	units,
	isLoading,
	schema,
	columns,
}: UnitTableProps): React.ReactElement {

	const unitMap = React.useMemo<Map<string, Unit>>(() => {
		return new Map(units.map((unit) => [unit.id, unit]));
	}, [units]);

	const tableData = React.useMemo(() => {
		return units.map((unit) => ({
			...unit,
			name: JsonToString(unit.name),
		}));
	}, [units]);

	const columnRenderers = React.useMemo(() => {
		const renderers: Record<string, (row: Record<string, unknown>) => React.ReactNode> = {};

		if (unitMap) {
			renderers[CONVERSION_COLUMN] = (row: Record<string, unknown>) => {
				const baseUnitId = row.baseUnit as string | null | undefined;
				if (!baseUnitId) {
					return <Text size='sm' c='dimmed'>No base unit set</Text>;
				}

				const baseUnit = unitMap.get(baseUnitId);
				const baseUnitName = baseUnit ? JsonToString(baseUnit.name) : baseUnitId;
				const unitName = String(row.name || row.id || '-');
				const multiplier = row.multiplier as number | null | undefined;
				const multiplierText = typeof multiplier === 'number' ? String(multiplier) : '-';

				return (
					<Stack gap={2}>
						<Group gap='xs' wrap='wrap'>
							<Badge variant='light' color='gray' size='md'>
								Base Unit: {baseUnitName}
							</Badge>
							<Badge variant='light' color='blue' size='md'>
								Multiplier: {multiplierText}
							</Badge>
						</Group>
						<Text size='md' c='dimmed'>
							1 {baseUnitName} = {multiplierText} {unitName}
						</Text>
					</Stack>
				);
			};
			renderers.status = (row: Record<string, unknown>) => {
				const status = String(row.status || '-');
				const color = status === 'active'
					? 'green'
					: status === 'inactive'
						? 'red'
						: 'gray';

				return (
					<Badge variant='light' color={color}>
						{status}
					</Badge>
				);
			};
			renderers.createdAt = (row: Record<string, unknown>) => {
				const createdAt = row.createdAt as string;
				return (
					<Text size='sm' > 
						{new Date(createdAt).toLocaleDateString()}
					</Text>
				);
			}
		}

		return renderers;
	}, [unitMap]);

	return (
			<AutoTable
				schema={schema}
				columns={columns}
				data={tableData}
				isLoading={isLoading}
				columnAsLink="name"
				columnRenderers={columnRenderers}
			/>
	);
}