import { CheckIcon, Group, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import React from 'react';

import { TEST_ID_PREFIX } from './sectionText';

import type { ComboboxItem, ComboboxLikeRenderOptionInput } from '@mantine/core';


/** The sentinel option of the values select that opens the picker; never a value of the field. */
export const BROWSE_ALL = '$$browseAll$$';

/**
 * One option of the values select. A custom `renderOption` replaces Mantine's own check mark, so a
 * picked value draws it here: the dropdown then shows which values are already pills, and picking
 * one again removes it, as Mantine does. "Browse all…" is an action, never checked.
 */
export function renderValueOption({ option, checked }: ComboboxLikeRenderOptionInput<ComboboxItem>,
): React.ReactNode {
	if (option.value === BROWSE_ALL) {
		return <Text size='xs' c='blue' {...testAttrs(TEST_ID_PREFIX, 'valuesBrowseAll')}>{option.label}</Text>;
	}
	return (
		<Group gap={6} wrap='nowrap' {...testAttrs(TEST_ID_PREFIX, 'valuesOption')} data-checked={checked || undefined}>
			{checked ? <CheckIcon size={12} {...testAttrs(TEST_ID_PREFIX, 'valuesOptionCheck')} /> : null}
			<span>{option.label}</span>
		</Group>
	);
}
