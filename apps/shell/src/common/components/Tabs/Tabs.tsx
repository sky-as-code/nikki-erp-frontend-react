'use client';

import { Tabs as MTabs } from '@mantine/core';
import React from 'react';

import classes from './Tabs.module.css';


export type TabsProps = Omit<React.ComponentProps<typeof MTabs>, 'classNames'>;

export const Tabs: React.FC<TabsProps> = (props) => {
	return (
		<MTabs
			{...props}
			classNames={classes}
		>
			{props.children}
		</MTabs>
	);
};

export const TabList = MTabs.List;
export const TabListItem = MTabs.Tab;
export const TabPanel = MTabs.Panel;
