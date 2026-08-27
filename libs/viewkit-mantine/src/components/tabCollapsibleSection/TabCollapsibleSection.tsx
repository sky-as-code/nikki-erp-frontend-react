import { Collapse, Group, SegmentedControl, Stack, Title, UnstyledButton } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { MetaComponent } from '@nikkierp/viewengine/render';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import React from 'react';

import { tabCollapsibleSectionPropsSchema, TabCollapsibleSectionProps } from './props';
import { TAB_COLLAPSIBLE_SECTION } from '../../ids';
import classes from '../collapsibleSection/CollapsibleSection.module.css';
import layoutClasses from '../formBlockLayout.module.css';
import { PaperWithBorder } from '../paperWithBorder';

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

	const sectionTitle = showSectionTitle && props.header != null
		? <Title order={4}>{t(props.header)}</Title>
		: null;

	const body = (
		<div className={layoutClasses.formBlockWrapper}>
			{props.tabs.map(tab => (
				<div
					key={tab.key}
					style={showTabs && active !== ALL_TAB && active !== tab.key ? { display: 'none' } : undefined}
				>
					<MetaComponent node={tab.content} />
				</div>
			))}
		</div>
	);

	return (
		<Stack component={PaperWithBorder} gap='md' {...componentAttrs(TAB_COLLAPSIBLE_SECTION)}>
			<Group gap='xs' align='center' wrap='wrap'>
				{props.collapsible ? (
					<UnstyledButton
						className={classes.collapsibleHeader}
						onClick={() => setExpanded(prev => !prev)}
						aria-expanded={expanded}
						{...testAttrs(testIdPrefix, props.header, 'toggle')}
					>
						<Group gap='xs'>
							{expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
							{sectionTitle}
						</Group>
					</UnstyledButton>
				) : sectionTitle}
				{showTabs ? (
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
			</Group>
			{props.collapsible ? (
				<Collapse
					expanded={expanded}
					transitionDuration={props.transitionDuration}
					transitionTimingFunction={props.transitionTimingFunction}
					className={layoutClasses.containerInlineSize}
				>
					{body}
				</Collapse>
			) : (
				<div className={layoutClasses.containerInlineSize}>{body}</div>
			)}
		</Stack>
	);
}
