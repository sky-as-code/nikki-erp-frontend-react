import { Button, ButtonProps, Group, Menu } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { TranslateFn } from '@nikkierp/ui/i18n';
import { RibbonMenuContribution, RibbonTab } from '@nikkierp/ui/menu';
import { ShortcutSequence } from '@nikkierp/ui/shortcuts';
import { IconChevronDown, IconDots } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';

import { HeaderPanelSlotContext } from './headerPanelSlot';
import classes from './Ribbon.module.css';
import { RibbonContext, RibbonContextValue, useRibbonContext } from './ribbonContext';
import { RibbonDisplayMode, useRibbonDisplayMode } from './ribbonDisplayMode';
import { findActiveRibbonTab } from './ribbonLayout';
import { RibbonPanel } from './RibbonPanel';
import { RIBBON_DROPDOWN_PROPS, useDismissFloatingPanel } from './useDismissFloatingPanel';
import { MENU_BAR_TEST_ID } from '../helper';
import menuClasses from '../MenuBar.module.css';
import { MenuMeasureRow, useMenuOverflow } from '../menuOverflow';
import { useNumberedEntry } from '../useNumberedEntry';


export type RibbonMenuBarProps = {
	menu: RibbonMenuContribution,
	currentPath: string,
	pathPrefix: string,
	t: TranslateFn,
};

/**
 * The tabs render in the header row; the panel of the selected tab is portalled into the slot the
 * header keeps under that row, so it spans the whole header. In `tabs-only` it floats over the
 * page while open; in `ribbon` it is always shown and takes its own height.
 */
export function RibbonMenuBar({ menu, currentPath, pathPrefix, t }: RibbonMenuBarProps): React.ReactNode {
	const [displayMode, setDisplayMode] = useRibbonDisplayMode();
	const slot = React.useContext(HeaderPanelSlotContext);
	const state = useRibbonTabState(menu.tabs, currentPath, pathPrefix, displayMode === 'tabs-only');
	const stripRef = React.useRef<HTMLDivElement>(null);
	const panelRef = React.useRef<HTMLDivElement>(null);
	const dismissRefs = React.useMemo(() => [stripRef, panelRef], []);
	useDismissFloatingPanel(state.isFloatingOpen, dismissRefs, state.close);

	const context = React.useMemo<RibbonContextValue>(
		() => ({ currentPath, pathPrefix, t, onNavigate: state.close }), [currentPath, pathPrefix, t, state.close],
	);
	const toggleMode = () => toggleDisplayMode(displayMode, setDisplayMode, state.close);
	const tab = menu.tabs[state.activeIndex];

	return (
		<RibbonContext.Provider value={context}>
			<RibbonTabStrip
				tabs={menu.tabs}
				activeIndex={state.activeIndex}
				isExpanded={state.isShown}
				onSelect={state.selectTab}
				stripRef={stripRef}
			/>
			{slot && state.isShown && tab && createPortal(
				<RibbonPanel
					tab={tab}
					titlePosition={menu.blockTitlePosition ?? 'bottom'}
					displayMode={displayMode}
					onToggleMode={toggleMode}
					panelRef={panelRef}
				/>,
				slot,
			)}
		</RibbonContext.Provider>
	);
}

function toggleDisplayMode(
	current: RibbonDisplayMode, set: (mode: RibbonDisplayMode) => void, close: () => void,
): void {
	if (current === 'ribbon') {
		close();
		set('tabs-only');
		return;
	}
	set('ribbon');
}

type RibbonTabState = {
	activeIndex: number,
	isShown: boolean,
	isFloatingOpen: boolean,
	selectTab: (index: number) => void,
	close: () => void,
};

/**
 * Starts on the tab holding the current route and follows the route as it changes. A navigation
 * also closes a floating panel, whichever way it happened.
 */
function useRibbonTabState(
	tabs: readonly RibbonTab[], currentPath: string, pathPrefix: string, isFloating: boolean,
): RibbonTabState {
	const routeTab = findActiveRibbonTab(tabs, currentPath, pathPrefix);
	const [activeIndex, setActiveIndex] = React.useState(Math.max(routeTab, 0));
	const [isOpen, setIsOpen] = React.useState(false);

	React.useEffect(() => {
		if (routeTab >= 0) setActiveIndex(routeTab);
		setIsOpen(false);
	}, [currentPath, routeTab]);

	const close = React.useCallback(() => setIsOpen(false), []);
	const selectTab = (index: number) => {
		if (isFloating && isOpen && index === activeIndex) {
			setIsOpen(false);
			return;
		}
		setActiveIndex(index);
		setIsOpen(true);
	};
	const isShown = !isFloating || isOpen;
	return {
		activeIndex: Math.min(activeIndex, tabs.length - 1),
		isShown,
		isFloatingOpen: isFloating && isOpen,
		selectTab,
		close,
	};
}

type RibbonTabStripProps = {
	tabs: readonly RibbonTab[],
	activeIndex: number,
	isExpanded: boolean,
	onSelect: (index: number) => void,
	stripRef: React.RefObject<HTMLDivElement | null>,
};

function RibbonTabStrip(props: RibbonTabStripProps): React.ReactNode {
	const { tabs, activeIndex, isExpanded, onSelect, stripRef } = props;
	const { t } = useRibbonContext();
	const { containerRef, measureRef, visibleCount } = useMenuOverflow(tabs.length);
	const measureItems = React.useMemo(() => tabs.map(tab => ({ labelKey: tab.labelKey })), [tabs]);

	return (
		<div ref={stripRef} className={classes.tabStrip}>
			<div ref={containerRef} className={menuClasses.horizontalBar}>
				<ShortcutSequence prefix='' max={9}>
					<Group gap='xs' wrap='nowrap'>
						{tabs.slice(0, visibleCount).map((tab, index) => (
							<RibbonTabButton
								key={tab.labelKey}
								tab={tab}
								isSelected={index === activeIndex}
								isExpanded={isExpanded && index === activeIndex}
								onClick={() => onSelect(index)}
							/>
						))}
						{visibleCount < tabs.length && (
							<TabOverflowMenu
								tabs={tabs}
								firstHidden={visibleCount}
								activeIndex={activeIndex}
								onSelect={onSelect}
							/>
						)}
					</Group>
				</ShortcutSequence>
				<MenuMeasureRow
					items={measureItems}
					buttonProps={tabButtonProps(false)}
					t={t}
					measureRef={measureRef}
				/>
			</div>
		</div>
	);
}

function RibbonTabButton({ tab, isSelected, isExpanded, onClick }: {
	tab: RibbonTab,
	isSelected: boolean,
	isExpanded: boolean,
	onClick: () => void,
}): React.ReactNode {
	const { t } = useRibbonContext();
	const entryShortcut = useNumberedEntry<HTMLButtonElement>();

	return (
		<Button
			{...tabButtonProps(isSelected, tab.labelKey)}
			{...entryShortcut}
			aria-expanded={isExpanded}
			aria-pressed={isSelected}
			onClick={onClick}
		>
			{t(tab.labelKey)}
		</Button>
	);
}

function TabOverflowMenu({ tabs, firstHidden, activeIndex, onSelect }: {
	tabs: readonly RibbonTab[],
	firstHidden: number,
	activeIndex: number,
	onSelect: (index: number) => void,
}): React.ReactNode {
	const { t } = useRibbonContext();

	return (
		<Menu position='bottom-start' trigger='click'>
			<Menu.Target>
				<Button {...tabButtonProps(activeIndex >= firstHidden, 'overflow')} rightSection={<IconChevronDown size={14} />}>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown className={menuClasses.menuDropdown} {...RIBBON_DROPDOWN_PROPS}>
				{tabs.slice(firstHidden).map((tab, offset) => (
					<Menu.Item
						key={tab.labelKey}
						onClick={() => onSelect(firstHidden + offset)}
						className={clsx({ [menuClasses.activeMenuItem]: firstHidden + offset === activeIndex })}
						{...testAttrs(MENU_BAR_TEST_ID, 'ribbonTab', tab.labelKey)}
					>
						{t(tab.labelKey)}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

function tabButtonProps(isSelected: boolean, labelKey?: string): ButtonProps {
	return {
		variant: 'subtle',
		c: 'var(--text-color)',
		size: 'xs',
		px: 'xs',
		fz: 'sm',
		fw: 'normal',
		className: clsx(classes.tab, { [classes.tabSelected]: isSelected }),
		...(labelKey ? testAttrs(MENU_BAR_TEST_ID, 'ribbonTab', labelKey) : {}),
	};
}
