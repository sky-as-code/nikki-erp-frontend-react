import { ActionIcon, Tooltip } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { RibbonBlock, RibbonBlockTitlePosition, RibbonTab } from '@nikkierp/ui/menu';
import { IconChevronUp, IconPin } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import classes from './Ribbon.module.css';
import { useRibbonContext } from './ribbonContext';
import { RibbonDisplayMode } from './ribbonDisplayMode';
import { CollapsedBlockMenu, RibbonItemView, RibbonMeasureItem } from './RibbonItem';
import { groupRibbonColumns, pickRibbonLayout, RibbonLayout } from './ribbonLayout';
import { MENU_BAR_TEST_ID } from '../helper';


export type RibbonPanelProps = {
	tab: RibbonTab,
	titlePosition: RibbonBlockTitlePosition,
	displayMode: RibbonDisplayMode,
	onToggleMode: () => void,
	panelRef: React.RefObject<HTMLDivElement | null>,
};

export function RibbonPanel(props: RibbonPanelProps): React.ReactNode {
	const { tab, titlePosition, displayMode, onToggleMode, panelRef } = props;
	const { containerRef, measureRef, layout } = useRibbonLayout(tab);

	return (
		<div
			ref={panelRef}
			className={clsx(classes.panel, displayMode === 'tabs-only' && classes.panelFloating)}
			data-display-mode={displayMode}
			data-layout={layout}
			{...testAttrs(MENU_BAR_TEST_ID, 'ribbonPanel')}
		>
			<div ref={containerRef} className={clsx(classes.blocks, layout === 'collapsed' && classes.blocksCollapsed)}>
				{tab.blocks.map(block => (layout === 'full'
					? <RibbonBlockView key={block.titleKey} block={block} titlePosition={titlePosition} />
					: <CollapsedBlockMenu key={block.titleKey} block={block} />
				))}
			</div>
			{/* Always the full layout, so its width says whether the full layout fits. */}
			<div ref={measureRef} className={classes.measureRow} aria-hidden inert>
				{tab.blocks.map(block => (
					<RibbonBlockView key={block.titleKey} block={block} titlePosition={titlePosition} measuring />
				))}
			</div>
			<RibbonModeToggle displayMode={displayMode} onToggle={onToggleMode} />
		</div>
	);
}

function RibbonBlockView({ block, titlePosition, measuring }: {
	block: RibbonBlock,
	titlePosition: RibbonBlockTitlePosition,
	measuring?: boolean,
}): React.ReactNode {
	const { t } = useRibbonContext();
	const Item = measuring ? RibbonMeasureItem : RibbonItemView;

	return (
		<div
			className={clsx(classes.block, titlePosition === 'top' && classes.blockTitleTop)}
			{...(measuring ? {} : testAttrs(MENU_BAR_TEST_ID, 'ribbonBlock', block.titleKey))}
		>
			<div className={classes.blockItems}>
				{groupRibbonColumns(block.items).map((column, index) => (
					<div key={index} className={classes.column}>
						{column.map(item => <Item key={item.labelKey} item={item} />)}
					</div>
				))}
			</div>
			<div className={classes.blockTitle}>{t(block.titleKey)}</div>
		</div>
	);
}

function RibbonModeToggle({ displayMode, onToggle }: {
	displayMode: RibbonDisplayMode,
	onToggle: () => void,
}): React.ReactNode {
	const { t } = useTranslation();
	const isPinned = displayMode === 'ribbon';
	const label = t(isPinned ? 'nikki.shell.ribbon.collapse' : 'nikki.shell.ribbon.pin');

	return (
		<Tooltip label={label}>
			<ActionIcon
				variant='subtle'
				color='gray'
				size='sm'
				className={classes.toggle}
				onClick={onToggle}
				aria-label={label}
				{...testAttrs(MENU_BAR_TEST_ID, 'ribbonModeToggle')}
			>
				{isPinned ? <IconChevronUp size={16} /> : <IconPin size={16} />}
			</ActionIcon>
		</Tooltip>
	);
}

/**
 * Compares the full layout's natural width, from the hidden copy, with the room the panel has. It
 * depends on the header's width rather than the window's, so a narrower header collapses it too.
 */
function useRibbonLayout(tab: RibbonTab): {
	containerRef: React.RefObject<HTMLDivElement | null>,
	measureRef: React.RefObject<HTMLDivElement | null>,
	layout: RibbonLayout,
} {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const measureRef = React.useRef<HTMLDivElement>(null);
	const [layout, setLayout] = React.useState<RibbonLayout>('full');

	React.useLayoutEffect(() => {
		const container = containerRef.current;
		const measurer = measureRef.current;
		if (!container || !measurer) {
			return undefined;
		}
		const recompute = () => setLayout(
			pickRibbonLayout(measurer.getBoundingClientRect().width, container.clientWidth),
		);
		recompute();
		const observer = new ResizeObserver(recompute);
		observer.observe(container);
		observer.observe(measurer);
		return () => observer.disconnect();
	}, [tab]);

	return { containerRef, measureRef, layout };
}
