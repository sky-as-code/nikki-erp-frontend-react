import React from 'react';
import { describe, expect, it } from 'vitest';

import { EXCEL_DATA_TABLE_BODY } from './ids';
import { getViewModeIcon } from './pages/resourceListV2/viewModeIcons';
import { resourceListV2PropsWithViewModes } from './propsWithIcons';


const base = { schemaName: 'iam_role', translationNs: 'iam', searchCommand: 'iam.role.search' };

/** `TemplateRef.props` is optional on the shared type; this builder always sets it. */
function buildViewModes(input: Parameters<typeof resourceListV2PropsWithViewModes>[0]) {
	const { props } = resourceListV2PropsWithViewModes(input);
	if (!props) {
		throw new Error('builder returned no props');
	}
	return props;
}

const cardMode = {
	mode: 'card',
	label: 'role.view_mode.card',
	viewkitComponent: { type: 'component' as const, component: 'coremart.x.components.card.v1' },
};

describe('resourceListV2PropsWithViewModes', () => {
	it('keeps the default list mode when the page declares none', () => {
		const props = buildViewModes(base);
		expect(props.viewModes).toHaveLength(1);
		expect(props.viewModes[0].viewkitComponent?.component).toBe(EXCEL_DATA_TABLE_BODY);
	});

	it('appends a mode beside the defaults', () => {
		const props = buildViewModes({
			...base,
			getViewModes: defaults => defaults.concat([cardMode]),
		});
		expect(props.viewModes.map(view => view.mode)).toEqual(['list', 'card']);
	});

	it('replaces the defaults outright', () => {
		const props = buildViewModes({
			...base,
			getViewModes: () => [cardMode],
		});
		expect(props.viewModes.map(view => view.mode)).toEqual(['card']);
	});

	/**
	 * The point of the whole side channel: the icon is a React element, so it must not survive
	 * into the props, and the page must still be able to find it again.
	 */
	it('stores a JSX icon behind a token instead of in the metadata', () => {
		// `createElement` rather than JSX only because this package collects `.test.ts` files; it
		// is the same element a page would write as `<IconLayoutCards />`.
		const icon = React.createElement('svg');
		const props = buildViewModes({
			...base,
			getViewModes: defaults => defaults.concat([{ ...cardMode, icon }]),
		});
		const card = props.viewModes[1];
		expect(card.iconToken).toBeTypeOf('string');
		expect(getViewModeIcon(card.iconToken)).toBe(icon);
		expect(JSON.parse(JSON.stringify(props))).toEqual(props);
	});

	// Mutating what the factory is handed must not reach the next page that asks for the defaults.
	it('hands each factory its own copy of the defaults', () => {
		resourceListV2PropsWithViewModes({
			...base,
			getViewModes: defaults => {
				defaults[0].label = 'mutated';
				return defaults;
			},
		});
		const props = buildViewModes(base);
		expect(props.viewModes[0].label).toBe('datatable.list');
	});

	it('refuses both `viewModes` and `getViewModes`', () => {
		expect(() => resourceListV2PropsWithViewModes({
			...base,
			viewModes: [cardMode],
			getViewModes: defaults => defaults,
		})).toThrow(/not both/);
	});
});
