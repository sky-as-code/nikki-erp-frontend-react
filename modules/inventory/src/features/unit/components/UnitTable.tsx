import { Paper } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import { JsonToString } from '../../../utils/serializer';
import type { Unit } from '../types';

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
			renderers.baseUnit = (row: Record<string, unknown>) => {
				const baseUnitId = row.baseUnit as string | null | undefined;
				if (!baseUnitId) {
					return '-';
				}
				const baseUnit = unitMap.get(baseUnitId);
				if (!baseUnit) return baseUnitId;
				return JsonToString(baseUnit.name);
			};
		}

		return renderers;
	}, [unitMap]);

	return (
		<Paper p="md" withBorder>
			<AutoTable
				schema={schema}
				columns={columns}
				data={tableData}
				isLoading={isLoading}
				columnAsLink="name"
				columnRenderers={columnRenderers}
			/>
		</Paper>
	);
}