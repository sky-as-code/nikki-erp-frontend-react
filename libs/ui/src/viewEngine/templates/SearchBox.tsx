import {
	ActionIcon,
	Box,
	Button,
	Checkbox,
	Divider,
	Group,
	Modal,
	Paper,
	Pill,
	Select,
	Stack,
	TagsInput,
	Text,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronUp,
	IconFilter,
	IconSearch,
} from '@tabler/icons-react';
import React from 'react';

import classes from './SearchBox.module.css';


type SearchBoxProps = {
	fields: string[],
};

const searchBoxWidthStep = 80;
const defaultFilters = ['Goods or Combo or Services', 'Name does not contain rein'];

function buildFieldOptions(fields: string[]) {
	return [{ value: '', label: '- Select a field -' }, ...fields.map(field => ({ value: field, label: field }))];
}

type ExpandedPanelProps = {
	options: { value: string, label: string }[],
	onDiscard: () => void,
	onOpenCustomFilter: () => void,
};

function ExpandedPanel({ options, onDiscard, onOpenCustomFilter }: ExpandedPanelProps): React.ReactNode {
	return (
		<Paper p='md' withBorder shadow='xs' className='absolute left-0 right-0 top-[calc(100%+4px)] z-[150]'>
			<Group align='flex-start' grow>
				<Stack gap='xs'>
					<Text fw={600}>Quick filters</Text>
					<Button variant='subtle' justify='flex-start'>Filter 1</Button>
					<Button variant='subtle' justify='flex-start'>Filter 2</Button>
					<Checkbox label='Include archive' />
					<Divider />
					<UnstyledButton onClick={onOpenCustomFilter}>
						<Text c='blue.7'>Custom filters</Text>
					</UnstyledButton>
				</Stack>

				<Stack gap='xs'>
					<Text fw={600}>Sort by</Text>
					<Select data={options} defaultValue='' />
					<Select data={options} defaultValue='' />
				</Stack>

				<Stack gap='xs'>
					<Text fw={600}>Group by</Text>
					<Select data={options} defaultValue='' />
					<Text fw={600} mt='sm'>Favorites</Text>
					<Group gap={4}>
						<Text size='sm'>Save current search</Text>
						<IconChevronDown size={14} />
					</Group>
				</Stack>
			</Group>

			<Group justify='flex-end' mt='md'>
				<Button variant='default' onClick={onDiscard}>Discard</Button>
				<Button onClick={() => {}}>Apply</Button>
			</Group>
		</Paper>
	);
}

function CustomFilterDialog({
	opened,
	onClose,
}: {
	opened: boolean,
	onClose: () => void,
}): React.ReactNode {
	return (
		<Modal opened={opened} onClose={onClose} title='Custom filter' centered>
			<Stack gap='md'>
				<Text>Match <b>any</b> of these conditions</Text>
				<Box h={120} />
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>Discard</Button>
					<Button onClick={() => {}}>Apply</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

function FilterTagsInput({
	filters,
	setFilters,
	searchValue,
	setSearchValue,
}: {
	filters: string[],
	setFilters: (items: string[]) => void,
	searchValue: string,
	setSearchValue: (value: string) => void,
}): React.ReactNode {
	const nextVersionProps = {
		renderPill: ({ value, onRemove }: { value: string, onRemove?: () => void }) => (
			<Pill withRemoveButton onRemove={onRemove} style={{ minWidth: 150, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
				<Group gap={4} wrap='nowrap'>
					<IconFilter size={12} />
					<span className={classes.pillText}>{value}</span>
				</Group>
			</Pill>
		),
	} as any;
	return (
		<TagsInput
			value={filters}
			onChange={setFilters}
			searchValue={searchValue}
			onSearchChange={setSearchValue}
			placeholder='Search...'
			leftSection={<IconSearch size={14} />}
			variant='unstyled'
			className='grow'
			{...nextVersionProps}
		/>
	);
}

export function SearchBox({ fields }: SearchBoxProps): React.ReactNode {
	const wrapperRef = React.useRef<HTMLDivElement | null>(null);
	const barRef = React.useRef<HTMLDivElement | null>(null);
	const [expanded, setExpanded] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState('');
	const [customFilterOpen, setCustomFilterOpen] = React.useState(false);
	const [filters, setFilters] = React.useState(defaultFilters);
	const [wrapperWidth, setWrapperWidth] = React.useState(360);
	const options = React.useMemo(() => buildFieldOptions(fields), [fields]);
	const openCustomFilters = () => {
		setExpanded(false);
		setCustomFilterOpen(true);
	};

	React.useLayoutEffect(() => {
		const bar = barRef.current;
		const wrapper = wrapperRef.current;
		if (!bar || !wrapper || typeof window === 'undefined') {
			return;
		}
		const maxAllowedWidth = Math.min(900, Math.floor(window.innerWidth * 0.62));
		const isWrapped = bar.getBoundingClientRect().height > 44;
		if (isWrapped && wrapperWidth < maxAllowedWidth) {
			setWrapperWidth(prev => Math.min(maxAllowedWidth, prev + searchBoxWidthStep));
		}
	}, [filters, searchValue, wrapperWidth]);

	return (
		<Box ref={wrapperRef} className={`relative ${classes.searchBox}`} w={wrapperWidth}>
			<Group
				ref={barRef}
				gap='xs'
				wrap='nowrap'
				className='rounded-md border border-gray-300 bg-white px-2 py-1 shadow-sm'
			>
				<FilterTagsInput
					filters={filters}
					setFilters={setFilters}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
				/>
				<ActionIcon
					variant='light'
					size='sm'
					onClick={() => setExpanded(prev => !prev)}
					aria-label={expanded ? 'Collapse search options' : 'Expand search options'}
				>
					{expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
				</ActionIcon>
			</Group>

			{expanded ? (
				<ExpandedPanel
					options={options}
					onDiscard={() => setExpanded(false)}
					onOpenCustomFilter={openCustomFilters}
				/>
			) : null}
			<CustomFilterDialog opened={customFilterOpen} onClose={() => setCustomFilterOpen(false)} />
		</Box>
	);
}
