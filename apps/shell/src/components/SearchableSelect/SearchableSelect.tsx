'use client';

import { Button, ButtonProps, Combobox, ComboboxStore, Input, PopoverWidth, ScrollArea, useCombobox } from '@mantine/core';
import { IconCircleDottedLetterN } from '@tabler/icons-react';
import { FC, JSX, useEffect, useState } from 'react';


export type SearchableSelectItem = {
	value: string,
	label: string,
};

export type SearchableSelectProps = {
	actionOptionLabel?: string,
	dropdownWidth?: PopoverWidth,
	items: SearchableSelectItem[],
	triggerComponent?: typeof Button,
	searchBoxEnabledAt?: number, // Show search box when there are more than this number of items
	searchPlaceholder?: string,
	unselectedPlaceholder?: string,
	value?: string | null,
	onChange?: (value: string) => void,
};

/**
 * @see https://mantine.dev/combobox/?e=SelectDropdownSearch
 */
export const SearchableSelect: FC<SearchableSelectProps> = (props) => {
	const { value: activeValue } = props;
	const isSearchBoxEnabled = props.items.length >= Number(props.searchBoxEnabledAt);
	const { search, setSearch, activeItem, setActiveItem, combobox } = useSearchSelect(isSearchBoxEnabled);
	let selectedItem: SearchableSelectItem | undefined;

	if (activeValue) {
		selectedItem = findItem(props.items, activeValue);
	}

	useEffect(() => {
		selectedItem && setActiveItem(selectedItem);
	}, [setActiveItem, activeValue, props.items]);

	const options = props.items
		.filter(item => item.label?.toLowerCase().includes(search.toLowerCase().trim()))
		.map(item => (
			<Combobox.Option value={item.value} key={item.value} active={item.value === activeValue}>
				{item.label || item.value}
			</Combobox.Option>
		));
	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			width={props.dropdownWidth}
			onOptionSubmit={(val) => {
				const selected = findItem(props.items, val);
				setActiveItem(selected);
				combobox.closeDropdown();
				props.onChange?.(val);
			}}
		>
			<ComboboxTarget
				value={activeItem?.label}
				combobox={combobox}
				triggerComponent={props.triggerComponent}
				unselectedPlaceholder={props.unselectedPlaceholder}
			/>
			<ComboboxDropdown
				actionOptionLabel={props.actionOptionLabel}
				search={search}
				searchBoxEnabledAt={props.searchBoxEnabledAt}
				searchPlaceholder={props.searchPlaceholder}
				setSearch={setSearch}
				options={options}
			/>
		</Combobox>
	);
};

function useSearchSelect(isSearchBoxEnabled: boolean) {
	const [search, setSearch] = useState('');
	const [activeItem, setActiveItem] = useState<SearchableSelectItem | null | undefined>(null);

	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
			// combobox.focusTarget();
			setSearch('');
		},
		onDropdownOpen: (eventSource) => {
			isSearchBoxEnabled && combobox.focusSearchInput();
			combobox.selectActiveOption();
			// if (eventSource === 'keyboard') {
			// }
			// else {
			// 	combobox.updateSelectedOptionIndex('active');
			// }
		},
	});

	return { search, setSearch, activeItem, setActiveItem, combobox };
};

function findItem(items: SearchableSelectItem[], value: string) {
	return items.find(item => item.value === value);
}

type ComboboxTargetProps = {
	value?: string | null;
	combobox: ComboboxStore,
	triggerComponent?: typeof Button,
	unselectedPlaceholder?: string,
};

const ComboboxTarget: FC<ComboboxTargetProps> = (props) => {
	const { value, combobox } = props;
	const TriggerComponent = props.triggerComponent ?? Button;
	const targetProps: Partial<ButtonProps> & React.DOMAttributes<HTMLButtonElement> = {
		// leftSection: <IconCircleDottedLetterN size={34} />,
		rightSection: <Combobox.Chevron />,
		onClick: () => combobox.toggleDropdown(),
	};


	return (
		<Combobox.Target>
			<TriggerComponent
				{...targetProps}
				variant='subtle'
				size='compact-lg'
				fz='xl'
				fw='bolder'
				p={0}
				color='#000000'
			>
				{value || <Input.Placeholder>{props.unselectedPlaceholder ?? 'No item selected'}</Input.Placeholder>}
			</TriggerComponent>
		</Combobox.Target>
	);
};

type ComboboxDropdownProps = {
	actionOptionLabel?: string,
	search: string;
	searchBoxEnabledAt?: number; // Show search box when there are more than this number of items
	searchPlaceholder?: string;
	setSearch: (value: string) => void;
	options: JSX.Element[];
};

const ComboboxDropdown: FC<ComboboxDropdownProps> = (props) => {
	return (
		<Combobox.Dropdown>
			{props.options.length >= Number(props.searchBoxEnabledAt) && (
				<Combobox.Search
					value={props.search}
					onChange={(event) => props.setSearch(event.currentTarget.value)}
					placeholder={props.searchPlaceholder}
				/>
			)}
			<Combobox.Options>
				<ScrollArea.Autosize type='scroll' mah='50vh'>
					{props.actionOptionLabel && <Combobox.Option value='$$action$$'>{props.actionOptionLabel}</Combobox.Option>}
					<Combobox.Group label=' '>
						{props.options.length > 0 ? props.options : <Combobox.Empty>Nothing found</Combobox.Empty>}
					</Combobox.Group>
				</ScrollArea.Autosize>
			</Combobox.Options>
		</Combobox.Dropdown>
	);
};
