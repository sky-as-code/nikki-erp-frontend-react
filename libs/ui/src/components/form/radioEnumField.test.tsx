import { describe, expect, it } from 'vitest';

import { enumRadioOptions } from './radioEnumField';

import type * as dyn from '@nikkierp/common/dynamicModel';


describe('enumRadioOptions', () => {
	it('offers one option per enum value, labelled by the `{field}.{value}` key as the select labels it', () => {
		const fieldDef = {
			name: 'product_type',
			data_type: { name: 'enumString', options: { enumValues: ['goods', 'service'] } },
		} as unknown as dyn.ModelSchemaField;
		const localize = (key: unknown) => `t(${JSON.stringify(key)})`;

		const options = enumRadioOptions(fieldDef, localize);

		expect(options.map(option => option.value)).toEqual(['goods', 'service']);
		expect(options[0].label).toContain('product_type.goods');
	});

	it('offers nothing for an enum without values', () => {
		const fieldDef = { name: 'kind', data_type: { name: 'enumString' } } as unknown as dyn.ModelSchemaField;

		expect(enumRadioOptions(fieldDef, () => '')).toEqual([]);
	});
});
