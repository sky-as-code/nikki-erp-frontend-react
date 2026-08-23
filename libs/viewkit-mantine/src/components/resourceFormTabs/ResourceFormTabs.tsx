import { ActionIcon, Group, Stack, Tabs } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { resourceFormTabsPropsSchema, ResourceFormTabsProps } from './props';
import { RESOURCE_FORM_TABS } from '../../ids';
import { PaperWithBorder } from '../paperWithBorder';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * A tabbed container for a resource detail page.
 *
 * `ai-prompts/ui-design-principles.md` makes tabs the agreed detail-page layout, which is why this
 * lives in the shared kit rather than in one module's own.
 *
 * Action buttons (Update/Save/Cancel, contextual actions, overflow menu) all live in the page
 * header's `ResourceActionBar`, not here — only the collapse toggle stays local to the tab group,
 * the same split the field-block grid uses.
 *
 * Children map to `tabs` **by position**: the nth child node is the body of the nth tab. Extra
 * children beyond `tabs.length` are ignored rather than silently rendered in the wrong panel.
 */
export const resourceFormTabsRenderer: IComponentRenderer<ResourceFormTabsProps> = {
	type: RESOURCE_FORM_TABS,
	propsSchema: resourceFormTabsPropsSchema,
	render(props, runtime) {
		return <ResourceFormTabs props={props} runtime={runtime} />;
	},
};

function ResourceFormTabs({ props, runtime }: {
	props: ResourceFormTabsProps,
	runtime: ComponentRenderRuntime,
}): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const [expanded, setExpanded] = React.useState(true);
	const [active, setActive] = React.useState<string>(props.defaultTab ?? props.tabs[0].key);
	const children = runtime.children ?? [];
	const prefix = props.testId ?? 'ui.resourceFormTabs';

	return (
		<Stack component={PaperWithBorder} gap='md' {...componentAttrs(RESOURCE_FORM_TABS)}>
			<Group gap='xs' align='center'>
				<ActionIcon
					variant='subtle'
					size='sm'
					onClick={() => setExpanded(prev => !prev)}
					aria-label='Toggle own properties'
				>
					{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
				</ActionIcon>
			</Group>
			<Tabs value={active} onChange={value => setActive(value ?? props.tabs[0].key)} keepMounted={false}>
				<Tabs.List>
					{props.tabs.map(tab => (
						<Tabs.Tab key={tab.key} value={tab.key} {...testAttrs(prefix, 'tab', tab.key)}>
							{t(tab.header)}
						</Tabs.Tab>
					))}
				</Tabs.List>
				{expanded ? props.tabs.map((tab, index) => (
					<Tabs.Panel key={tab.key} value={tab.key} pt='md'>
						<MetaComponent node={children[index] ?? []} />
					</Tabs.Panel>
				)) : null}
			</Tabs>
		</Stack>
	);
}
