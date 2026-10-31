import { Collapse, Paper, SegmentedControl } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import React from 'react';

import { tabCollapsibleSectionPropsSchema, TabCollapsibleSectionProps } from './props';
import { TAB_COLLAPSIBLE_SECTION } from '../../ids';
import { useSectionTitle } from '../../pages/resourceDetail/sectionTitle';
import { SectionHeader } from '../collapsibleSection/SectionHeader';
import shellClasses from '../collapsibleSection/SectionShell.module.css';
import panelClasses from '../formPanel/FormPanel.module.css';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


const ALL_TAB = 'all';

/**
 * A `collapsibleSection`-shaped block, but for a row of titled blocks that has grown too large to
 * show all at once. Once `tabs.length` exceeds `minBlockCountWithoutTabs` it adds a `SegmentedControl`
 * (`[All] | [Block 1] | ...`) that narrows visible blocks to one at a time; below the threshold every
 * block's fields show inline, same as `collapsibleSectionNode({ layout: 'formBlocks' })`.
 *
 * Hidden tabs stay mounted (`display: none`) rather than unmounting, so switching tabs never drops
 * form state.
 */
export const tabCollapsibleSectionRenderer: IComponentRenderer<TabCollapsibleSectionProps> = {
	type: TAB_COLLAPSIBLE_SECTION,
	propsSchema: tabCollapsibleSectionPropsSchema,
	render(props) {
		return <TabCollapsibleSection props={props} />;
	},
};

function TabCollapsibleSection({ props }: { props: TabCollapsibleSectionProps }): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const [expanded, setExpanded] = React.useState(props.expanded);
	const [active, setActive] = React.useState<string>(ALL_TAB);
	const testIdPrefix = props.testId ?? 'ui.tabCollapsibleSection';

	const showTabs = props.tabs.length > props.minBlockCountWithoutTabs;
	const showSectionTitle = props.header != null
		&& (props.titleVisibility === 'show' || (props.titleVisibility === 'auto' && !showTabs));

	const headerText = useSectionTitle(props.header, t);
	const sectionTitle = showSectionTitle ? headerText : null;
	const titleId = React.useId();

	const body = (
		<div className={panelClasses.sections}>
			{props.tabs.map(tab => (
				<div
					key={tab.key} className={panelClasses.contents}
					style={showTabs && active !== ALL_TAB && active !== tab.key ? { display: 'none' } : undefined}
				>
					<MetaComponent node={tab.content} />
				</div>
			))}
		</div>
	);

	return (
		<Paper
			withBorder radius='md' className={shellClasses.panel}
			aria-labelledby={sectionTitle != null ? titleId : undefined}
			{...componentAttrs(TAB_COLLAPSIBLE_SECTION)}
		>
			{props.collapsible || sectionTitle != null || showTabs ? <SectionHeader
				title={sectionTitle} titleId={titleId} collapsible={props.collapsible}
				expanded={expanded} onToggle={() => setExpanded(prev => !prev)}
				toggleAttrs={testAttrs(testIdPrefix, props.header, 'toggle')}
				rightSegment={showTabs ? (
					<SegmentedControl
						value={active}
						onChange={setActive}
						data={[
							{ label: t('common.all', 'All'), value: ALL_TAB },
							...props.tabs.map(tab => ({ label: t(tab.header), value: tab.key })),
						]}
						{...testAttrs(testIdPrefix, 'blockVisibility')}
					/>
				) : null}
			/> : null}
			{props.collapsible ? (
				<Collapse
					expanded={expanded}
					transitionDuration={props.transitionDuration}
					transitionTimingFunction={props.transitionTimingFunction}
				>
					{body}
				</Collapse>
			) : body}
		</Paper>
	);
}
