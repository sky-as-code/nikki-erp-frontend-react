// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useFieldDataSeed } from './resourceCreateForm';

import type * as dyn from '@nikkierp/common/dynamicModel';


const modelSchema = { fields: { name: {}, operation_code: {} } } as unknown as dyn.ModelSchema;

function seedAt(url: string, schema: dyn.ModelSchema | null = modelSchema) {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
	);
	return renderHook(() => useFieldDataSeed(schema ?? undefined), { wrapper }).result.current;
}

describe('useFieldDataSeed', () => {
	it('pre-fills the known fields of a ?field_data= link and ignores unknown keys', () => {
		const data = encodeURIComponent('{"operation_code":"incoming","not_a_field":1}');
		expect(seedAt(`/inventory_stock_transfer/new?field_data=${data}`)).toEqual({ operation_code: 'incoming' });
	});

	it('seeds nothing without the parameter or a schema', () => {
		expect(seedAt('/x/new')).toBeUndefined();
		expect(seedAt('/x/new?field_data=%7B%22name%22%3A%22A%22%7D', null)).toBeUndefined();
	});
});
