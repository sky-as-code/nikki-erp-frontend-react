import { Stack, Tabs } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceFormTabsPropsSchema, ResourceFormTabsProps } from './props';
import { RESOURCE_FORM_TABS } from '../../ids';
import { printDebugFormValues } from '../../pages/resourceDetail/ResourceDetailProvider';
import { SectionActionBar } from '../../pages/resourceDetail/resourceUpdateParts';
import { PaperWithBorder } from '../paperWithBorder';
import { useResourceFormView } from '../resourceFormViewContext';

import type { ComponentRenderRuntime, IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * A tabbed container for a resource detail page.
 *
 * `ai-prompts/ui-design-principles.md` makes tabs the agreed detail-page layout, which is why this
 * lives in the shared kit rather than in one module's own.
 *
 * It sits on the same side of the line as `resource_form__section`, not `collapsible_section`: it
 * renders the enclosing form's `SectionActionBar`, so each tab carries its own Edit/Save/Discard
 * control for the form it contains. `SectionActionBar` reads the resource-update context
 * unconditionally, so this component throws outside that family by design — do not reach for it as
 * a general-purpose tab strip.
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
			<TabsActionBar expanded={expanded} onToggleCollapse={() => setExpanded(prev => !prev)} />
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

/**
 * The same wiring `resource_form__section` uses: `useCrudFormRuntime` supplies submit and loading,
 * `useResourceFormView` shares edit mode across the form subtree, and a local fallback keeps the
 * bar working when no view context is present.
 */
function TabsActionBar({ expanded, onToggleCollapse }: {
	expanded: boolean,
	onToggleCollapse: () => void,
}): React.ReactNode {
	const formRuntime = useCrudFormRuntime();
	const [localMode, setLocalMode] = React.useState(false);
	const view = useResourceFormView();

	return (
		<SectionActionBar
			expanded={expanded}
			onToggleCollapse={onToggleCollapse}
			onSaveClick={formRuntime ? formRuntime.handleSubmit(printDebugFormValues) : () => undefined}
			isLoading={formRuntime?.isLoading ?? false}
			updateMode={view?.updateMode ?? localMode}
			setUpdateMode={view?.setUpdateMode ?? setLocalMode}
		/>
	);
}
