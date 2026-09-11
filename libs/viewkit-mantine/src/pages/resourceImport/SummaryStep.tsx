import { Group, Stack, Table, Text, Title } from '@mantine/core';
import React from 'react';

import { targetLabelOf } from './MappingStep';

import type { ImportTarget } from './targets';
import type { RestBulkCreateResponse, RestImportRowError } from '@nikkierp/common/dynamicModel';
import type { TranslateFn } from '@nikkierp/ui/i18n';


type SummaryStepProps = {
	t: TranslateFn,
	tid: (part: string) => Record<string, string>,
	result: RestBulkCreateResponse,
	targets: ImportTarget[],
};

/** Counts and per-row errors. "Back to list" and "Import again" render in the page header. */
export function SummaryStep({ t, tid, result, targets }: SummaryStepProps): React.ReactNode {
	const counts: [string, number][] = [
		['import.totalRows', result.total_rows],
		['import.createdRows', result.created_count],
		['import.updatedRows', result.updated_count],
		['import.failedRows', result.error_count],
	];
	return (
		<Stack gap='md' {...tid('summary')}>
			<Title order={4}>{t('import.summaryTitle')}</Title>
			<Group gap='xl'>
				{counts.map(([key, value]) => (
					<Stack key={key} gap={0} {...tid(key.split('.')[1])}>
						<Text size='xs' c='dimmed'>{t(key)}</Text>
						<Text fw={600} size='lg'>{value}</Text>
					</Stack>
				))}
			</Group>
			{result.errors.length > 0 ? (
				<Table striped withTableBorder className='w-full' {...tid('errors')}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th w={80}>{t('import.row')}</Table.Th>
							<Table.Th w={220}>{t('import.column')}</Table.Th>
							<Table.Th>{t('import.message')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{result.errors.map((error, i) => (
							<Table.Tr key={i}>
								<Table.Td>{error.row}</Table.Td>
								<Table.Td>{targetLabelOf(targets, error.field)}</Table.Td>
								<Table.Td>{describeRowError(t, error)}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			) : null}
		</Stack>
	);
}

type NestedError = { key?: string, message?: string, vars?: Record<string, unknown> };

/**
 * A row rejected by validation carries the field-level client errors the create path produced;
 * those are the message, not the generic wrapper code.
 */
export function describeRowError(t: TranslateFn, error: RestImportRowError): string {
	const nested = error.params?.errors as NestedError[] | undefined;
	if (error.code === 'err_import_validation' && Array.isArray(nested) && nested.length > 0) {
		return nested
			.map(item => (item.key ? t(item.key, item.vars) : '') || item.message || '')
			.filter(Boolean)
			.join('; ');
	}
	return t(error.code, error.params);
}
