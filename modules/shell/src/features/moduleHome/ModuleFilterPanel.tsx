import {
	Center,
	Checkbox,
	SegmentedControl,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { FC } from 'react';

import { ModuleViewMode } from './ModuleHomePage';
import classes from './ModuleHomePage.module.css';


type ModuleFilterPanelProps = {
	viewMode: ModuleViewMode;
	onViewModeChange: (mode: ModuleViewMode) => void;
};

export const ModuleFilterPanel: FC<ModuleFilterPanelProps> = ({
	viewMode,
	onViewModeChange,
}) => {
	return (
		<Stack
			gap={'lg'} p={{ xl: 30, sm: 15 }}
			bdrs={'md'} bg={'var(--mantine-color-white)'}
			className={classes.filterPanel}
		>
			<ViewModeSegmentedControl
				viewMode={viewMode}
				onViewModeChange={onViewModeChange}
			/>

			<Checkbox
				label='Show disabled modules'
				color='var(--mantine-color-black)'
				onChange={() => {}}
			/>
			<Checkbox
				label='Show orphaned modules'
				color='var(--mantine-color-black)'
				onChange={() => {}}
			/>

			<SortBySelect />
			<GroupBySelect />
		</Stack>
	);
};


const GroupBySelect: FC = () => {
	return (<Select
		label={
			<Text className='capitalize' size={'sm'} fw={700}>
				Group by
			</Text>
		}
		placeholder='Pick value'
		data={['Category', 'Status']}
	/>);
};


const SortBySelect: FC = () => {
	return (<Select
		label={
			<Text className='capitalize' size={'sm'} fw={700}>
				Sort by
			</Text>
		}
		placeholder='Pick value'
		data={['Name', 'Commonly used']}
	/>);
};


const ViewModeSegmentedControl: FC<{
	viewMode: ModuleViewMode;
	onViewModeChange: (mode: ModuleViewMode) => void;
}> = ({ viewMode, onViewModeChange }) => {
	const segments = [

		{
			value: 'list',
			label: (
				<Center style={{ gap: 10 }}>
					<IconList size={16} />
					<span>List</span>
				</Center>
			),
		},
		{
			value: 'grid',
			label: (
				<Center style={{ gap: 10 }}>
					<IconLayoutGrid size={16} />
					<span>Grid</span>
				</Center>
			),
		},
	];

	return (
		<SegmentedControl
			data={segments}
			value={viewMode}
			onChange={(val: string) => onViewModeChange(val as ModuleViewMode)}
		/>
	);
};