import React from 'react';
import { describe, expect, it } from 'vitest';

import { ExcelDataTable } from './index';

import type { NewRowFieldEditor, SearchData } from './types';


/**
 * The three compositions the requirement names, built (not rendered) so the public surface is
 * type-checked and every namespace member exists. Rendering needs the micro-app providers.
 */
const data = { items: [], total: 0, page: 0, size: 50, desired_fields: [], masked_fields: [] } as unknown as SearchData;

describe('ExcelDataTable compositions', () => {
	it('builds the body-only table', () => {
		const tree = (
			<ExcelDataTable.Provider data={data}>
				<ExcelDataTable.Table />
			</ExcelDataTable.Provider>
		);
		expect(React.isValidElement(tree)).toBe(true);
	});

	it('builds the full-fledged table', () => {
		const tree = (
			<ExcelDataTable.Provider data={data} initialViewMode='list' updateCommand='products.update'>
				<ExcelDataTable.Toolbar
					left={(
						<>
							<ExcelDataTable.Title render={ctx => `Products (${ctx.data.total})`} />
							<ExcelDataTable.Actions>
								<ExcelDataTable.ActionRefresh iconOnly command='products.search' />
								<ExcelDataTable.Action label='Create' href='../new' />
								<ExcelDataTable.CollapsedActions>
									<ExcelDataTable.Action label='Archive' command='products.archive' selectionMode='multiple' />
								</ExcelDataTable.CollapsedActions>
							</ExcelDataTable.Actions>
						</>
					)}
					right={(
						<>
							<ExcelDataTable.FilterButton />
							<ExcelDataTable.Pagination />
							<ExcelDataTable.ViewModeButtons>
								<ExcelDataTable.ViewModeButton mode='list' label='List' />
								<ExcelDataTable.ViewModeButton mode='grid' label='Grid' />
							</ExcelDataTable.ViewModeButtons>
							<ExcelDataTable.SettingsButton />
						</>
					)}
				/>
				<ExcelDataTable.FilterPanel />
				<ExcelDataTable.ForViewMode view='list'>
					<ExcelDataTable.TableHeader />
					<ExcelDataTable.Table />
				</ExcelDataTable.ForViewMode>
			</ExcelDataTable.Provider>
		);
		expect(React.isValidElement(tree)).toBe(true);
	});

	it('builds the table with pagination above and below', () => {
		const tree = (
			<ExcelDataTable.Provider data={data}>
				<ExcelDataTable.Toolbar
					left={<ExcelDataTable.Actions refreshCommand='products.search' refreshIconOnly />}
					right={<><ExcelDataTable.Pagination /><ExcelDataTable.SettingsButton /></>}
				/>
				<ExcelDataTable.TableHeader />
				<ExcelDataTable.Table />
				<ExcelDataTable.Toolbar right={<ExcelDataTable.Pagination />} />
			</ExcelDataTable.Provider>
		);
		expect(React.isValidElement(tree)).toBe(true);
	});
});

describe('ExcelDataTable row-write compositions', () => {
	it('builds a page-fed table that creates, updates and deletes through callbacks', () => {
		const resourcePicker: NewRowFieldEditor = ({ field }) => <span>{field}</span>;
		const tree = (
			<ExcelDataTable.Provider
				data={data}
				indexColumnVisible={false}
				capabilities={['create', 'update', 'delete']}
				onCreated={() => undefined}
				onUpdated={async () => true}
				onDeleted={() => false}
				createEntitlement='manage_entitlements:iam_role:tenant'
				updateEntitlement='manage_entitlements:iam_role:tenant'
				deleteEntitlement='manage_entitlements:iam_role:tenant'
				newRowPrompt='Add new entitlement'
				newRowFieldEditors={{ resource_id: resourcePicker }}
			>
				<ExcelDataTable.TableHeader />
				<ExcelDataTable.Table />
			</ExcelDataTable.Provider>
		);
		expect(React.isValidElement(tree)).toBe(true);
	});

	it('builds an assignment table that inserts existing records through commands', () => {
		const tree = (
			<ExcelDataTable.Provider
				data={data}
				capabilities={['create', 'delete']}
				createCommand='iam.role.manageUsers'
				deleteCommand='iam.role.manageUsers'
				newRowSource='server-resource'
				newRowResourceSchema='iam_user'
				newRowSearchField='id'
				newRowSearchCommand='iam.user.search'
			>
				<ExcelDataTable.Table />
				<ExcelDataTable.EditRowActions mode='create' onConfirm={() => undefined} onDiscard={() => undefined} />
			</ExcelDataTable.Provider>
		);
		expect(React.isValidElement(tree)).toBe(true);
	});
});
