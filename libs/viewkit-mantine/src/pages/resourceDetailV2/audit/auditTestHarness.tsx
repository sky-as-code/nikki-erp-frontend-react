import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ResourceDetailProvider } from '../../resourceDetail/ResourceDetailProvider';
import { ResourceUpdateContext } from '../resourceUpdateContext';

import type { ResourceUpdateContextValue } from '../resourceUpdateContext';
import type * as dyn from '@nikkierp/common/dynamicModel';


export const TEST_ID = 'users.userDetail';

const STATUS_VALUES = ['draft', 'active', 'suspended'];

export const TEST_SCHEMA_PACK = {
	schemaName: 'iam_user',
	modelSchema: {
		name: 'iam_user',
		label: { $ref: 'iam_user.label' },
		to_relations: [
			{ edge: 'roles', dest_schema_name: 'iam_role', relation_type: 'many:many' },
			{ edge: 'manager', src_field: 'manager_id', dest_schema_name: 'iam_user', relation_type: 'many:one' },
		],
		fields: {
			display_name: { name: 'display_name', label: { $ref: 'fields.display_name' }, data_type: { name: 'string' } },
			// No translation exists for an m2m edge's own label: the History names it after the peer.
			roles: { name: 'roles', label: { $ref: 'fields.roles' }, data_type: { name: 'model' }, is_edge_model: true },
			status: {
				name: 'status', label: { $ref: 'fields.status' },
				data_type: { name: 'enumString', options: { enumValues: STATUS_VALUES } },
			},
		},
	},
} as unknown as dyn.SchemaPack;

/** The schemas the test record's edges point at, as `useRelatedSchemas` loads them. */
export const TEST_RELATED_SCHEMAS = {
	iam_role: { name: 'iam_role', label: { $ref: 'iam_role.label' }, fields: {} },
} as unknown as Record<string, dyn.ModelSchema>;

export const TEST_STATUSES = [
	{ value: 'active', label: 'status.active' },
	{ value: 'suspended', label: 'status.suspended', alternativeEnd: true },
];

const noop = (): void => undefined;

export function testUpdateContext(overrides: Partial<ResourceUpdateContextValue> = {}): ResourceUpdateContextValue {
	return {
		commands: { getById: 'iam.iam_user.get_by_id' },
		resource: { id: 'U1', etag: 'E1', status: 'active' },
		edgeLabels: {},
		isReading: false,
		isWriting: false,
		refresh: noop,
		onSubmit: async () => true,
		saveClientErrors: [],
		saveError: null,
		loadError: null,
		registerAfterSave: () => noop,
		hasPendingAfterSave: () => false,
		submitAfterSaveOnly: async () => true,
		registerFileField: () => noop,
		hasPendingFiles: () => false,
		...overrides,
	};
}

/** The update context with a live Audit toggle state, as `ResourceUpdateProvider` holds it. */
function StatefulUpdateContext({ overrides, children }: {
	overrides: Partial<ResourceUpdateContextValue>,
	children: React.ReactNode,
}): React.ReactNode {
	const [auditOpen, setAuditOpen] = React.useState(false);
	const value = React.useMemo(
		() => testUpdateContext({ auditOpen, setAuditOpen, ...overrides }),
		[auditOpen, overrides],
	);
	return <ResourceUpdateContext.Provider value={value}>{children}</ResourceUpdateContext.Provider>;
}

/** jsdom has no `matchMedia`, which Mantine's color scheme and media hooks read. */
function polyfillMatchMedia(): void {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
}

/** Renders `ui` on `/iam_user/U1` inside the detail and update contexts the template provides. */
export function renderInDetailPage(ui: React.ReactNode, overrides: Partial<ResourceUpdateContextValue> = {}) {
	polyfillMatchMedia();
	return render(
		<MantineProvider env='test'>
			<MemoryRouter initialEntries={['/iam_user/U1']}>
				<Routes>
					<Route
						path='/iam_user/:id'
						element={(
							<ResourceDetailProvider
								translationNs='iam' schemaPack={TEST_SCHEMA_PACK} isReading={false} isWriting={false} testId={TEST_ID}
							>
								<StatefulUpdateContext overrides={overrides}>{ui}</StatefulUpdateContext>
							</ResourceDetailProvider>
						)}
					/>
				</Routes>
			</MemoryRouter>
		</MantineProvider>,
	);
}

export const byTestId = (...segments: string[]): string => [TEST_ID, ...segments].join('.');
