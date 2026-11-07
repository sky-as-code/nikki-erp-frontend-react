import { Badge, Group, Stack, Table, Text } from '@mantine/core';
import { resourceCommands } from '@nikkierp/common/dynamicModel';
import { testAttrs } from '@nikkierp/common/utils';
import { Button } from '@nikkierp/ui/components';
import { useClientErrorTranslate, useTranslate } from '@nikkierp/ui/i18n';
import { useCommandBus } from '@nikkierp/ui/microApp';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import { useOptionalResourceUpdateContext, useResourceFormView } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { BomRowsEditor } from './BomRowsEditor';
import {
	BOM_LINE, BOM_OPERATION, BOM_VERSION, diffRows, LINE_COLUMNS, OPERATION_COLUMNS, pickVersion, useRelationOptions,
	useSearchRows,
} from './bomStructureData';
import { PRODUCTION_MODULE } from '../../../constants';
import { BOM_STRUCTURE } from '../../ids';

import type { ColumnSpec, Option, Row } from './bomStructureData';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const TEST_ID = `${PRODUCTION_MODULE}.bomStructure`;

export const bomStructureRenderer: IComponentRenderer<Record<string, never>> = {
	type: BOM_STRUCTURE,
	render() {
		return (
			<ComponentAnchor id={BOM_STRUCTURE}>
				<BomStructure />
			</ComponentAnchor>
		);
	},
};

type Structure = { version?: Row, lines: Row[], operations: Row[] };

/**
 * The BoM's components and operations, read from its draft version (editable) or else its active one.
 * Like a product template's Attributes section: the rows show here, and Configure opens an editor that
 * saves the whole set. Only a draft version changes; an active one is replaced through New version.
 */
function BomStructure(): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const update = useOptionalResourceUpdateContext();
	const editingForm = useResourceFormView()?.updateMode ?? false;
	const record = update?.resource as Row | undefined;
	const { structure, reload } = useStructure(record);
	const [editing, setEditing] = React.useState<'lines' | 'operations' | null>(null);
	const versionId = structure.version ? String(structure.version.id) : undefined;
	const lineOptions = useRelationOptions(LINE_COLUMNS, versionId);
	const operationOptions = useRelationOptions(OPERATION_COLUMNS, versionId);
	if (!record) {
		return null;
	}
	const draft = structure.version?.status === 'draft';
	return (
		<Stack gap='sm' {...testAttrs(TEST_ID)}>
			<VersionLine version={structure.version} draft={draft} />
			<StructureTable
				title={t('tabs.bom_lines')} columns={LINE_COLUMNS} rows={structure.lines} options={lineOptions}
				canEdit={draft && !editingForm} onConfigure={() => setEditing('lines')} testId='lines'
				configureLabel={t('bom_structure.configure_lines', { defaultValue: 'Configure components' })}
			/>
			<StructureTable
				title={t('tabs.bom_operations')} columns={OPERATION_COLUMNS} rows={structure.operations}
				options={operationOptions} canEdit={draft && !editingForm} onConfigure={() => setEditing('operations')}
				configureLabel={t('bom_structure.configure_operations', { defaultValue: 'Configure operations' })}
				testId='operations'
			/>
			{editing && versionId ? (
				<EditorFor
					kind={editing} versionId={versionId} structure={structure}
					options={editing === 'lines' ? lineOptions : operationOptions}
					onDone={() => {
						setEditing(null);
						reload();
					}}
				/>
			) : null}
		</Stack>
	);
}

function VersionLine({ version, draft }: { version?: Row, draft: boolean }): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	if (!version) {
		return <Text c='dimmed'>{t('bom_structure.no_version', { defaultValue: 'This BoM has no draft or active version yet.' })}</Text>;
	}
	return (
		<Group gap='xs'>
			<Text fw={500}>{t('bom_structure.version', { defaultValue: 'Version {{no}}', no: version.version_no })}</Text>
			<Badge variant='light'>{t(`status.${String(version.status)}`)}</Badge>
			{draft ? null : (
				<Text c='dimmed' size='sm'>
					{t('bom_structure.read_only_hint', {
						defaultValue: 'Only a draft version can change. Use New version to start one.',
					})}
				</Text>
			)}
		</Group>
	);
}

type TableProps = {
	title: string, columns: ColumnSpec[], rows: Row[], options: Record<string, Option[]>,
	canEdit: boolean, onConfigure: () => void, configureLabel: string, testId: string,
};

function StructureTable(props: TableProps): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const display = (column: ColumnSpec, row: Row) => {
		const value = row[column.field];
		if (column.kind === 'relation') {
			return (props.options[column.field] ?? []).find(option => option.value === value)?.label ?? String(value ?? '');
		}
		return String(value ?? '');
	};
	return (
		<Stack gap={4} {...testAttrs(TEST_ID, props.testId)}>
			<Group justify='space-between'>
				<Text fw={600}>{props.title}</Text>
				<Button variant='outline' size='compact-sm' disabled={!props.canEdit} onClick={props.onConfigure}>
					{props.configureLabel}
				</Button>
			</Group>
			<Table withTableBorder striped>
				<Table.Thead>
					<Table.Tr>{props.columns.map(column => <Table.Th key={column.field}>{t(`fields.${column.field}`)}</Table.Th>)}</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{props.rows.map(row => (
						<Table.Tr key={String(row.id)}>
							{props.columns.map(column => (
								<Table.Td key={column.field}>{display(column, row)}</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</Stack>
	);
}

type EditorForProps = {
	kind: 'lines' | 'operations', versionId: string, structure: Structure,
	options: Record<string, Option[]>, onDone: () => void,
};

/** The editor for one kind of row, writing the difference through the generic CRUD commands. */
function EditorFor({ kind, versionId, structure, options, onDone }: EditorForProps): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const translateError = useClientErrorTranslate([PRODUCTION_MODULE, 'common']);
	const bus = useCommandBus();
	const [saving, setSaving] = React.useState(false);
	const [error, setError] = React.useState<string>();
	const columns = kind === 'lines' ? LINE_COLUMNS : OPERATION_COLUMNS;
	const schema = kind === 'lines' ? BOM_LINE : BOM_OPERATION;
	const save = async (rows: Row[]) => {
		setSaving(true);
		setError(undefined);
		const commands = resourceCommands(schema);
		for (const write of diffRows(kind === 'lines' ? structure.lines : structure.operations, rows, columns, versionId)) {
			const name = write.kind === 'create' ? commands.CREATE : write.kind === 'update' ? commands.UPDATE : commands.DELETE;
			const response = await bus.publish({ name, payload: write.payload });
			const clientError = response.result?.clientErrors?.[0];
			const message = clientError
				? `${clientError.field ? `${t(`fields.${clientError.field}`)}: ` : ''}${translateError(clientError)}`
				: (response.error ? String(response.error) : undefined);
			if (message) {
				setSaving(false);
				setError(message);
				return;
			}
		}
		setSaving(false);
		onDone();
	};
	return (
		<BomRowsEditor
			title={kind === 'lines'
				? t('bom_structure.configure_lines', { defaultValue: 'Configure components' })
				: t('bom_structure.configure_operations', { defaultValue: 'Configure operations' })}
			columns={columns} rows={kind === 'lines' ? structure.lines : structure.operations} options={options}
			saving={saving} error={error} onSave={rows => void save(rows)} onClose={onDone}
		/>
	);
}

/** The shown version and its rows, reloaded after each save. */
function useStructure(record: Row | undefined): { structure: Structure, reload: () => void } {
	const search = useSearchRows();
	const [structure, setStructure] = React.useState<Structure>({ lines: [], operations: [] });
	const [tick, setTick] = React.useState(0);
	const bomId = record?.id;
	const activeVersionId = record?.active_version_id;
	React.useEffect(() => {
		if (!bomId) {
			return;
		}
		let active = true;
		void (async () => {
			const version = await findVersion(search, bomId, activeVersionId);
			const byVersion: dyn.SearchNode | undefined = version
				? { if: ['bom_version_id', '=', version.id] }
				: undefined;
			const [lines, operations] = version
				? await Promise.all([
					search(BOM_LINE, byVersion, ['id', 'etag', ...LINE_COLUMNS.map(column => column.field)]),
					search(BOM_OPERATION, byVersion, ['id', 'etag', ...OPERATION_COLUMNS.map(column => column.field)]),
				])
				: [[], []];
			const bySequence = (a: Row, b: Row) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0);
			if (active) {
				setStructure({ version, lines: lines.sort(bySequence), operations: operations.sort(bySequence) });
			}
		})();
		return () => {
			active = false;
		};
	}, [bomId, activeVersionId, search, tick]);
	return { structure, reload: React.useCallback(() => setTick(value => value + 1), []) };
}

/**
 * The version to show. A BoM opens with draft version 1 in its own create, but the page right after
 * creating can ask before that version is readable through the generic search; one late retry covers it.
 */
async function findVersion(
	search: ReturnType<typeof useSearchRows>, bomId: unknown, activeVersionId: unknown,
): Promise<Row | undefined> {
	const read = async () => pickVersion(
		await search(BOM_VERSION, { if: ['bom_id', '=', bomId] }, ['id', 'version_no', 'status']), activeVersionId);
	const version = await read();
	if (version) {
		return version;
	}
	await new Promise(resolve => setTimeout(resolve, 1000));
	return read();
}
