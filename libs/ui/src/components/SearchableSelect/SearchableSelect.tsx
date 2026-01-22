import {
	Button,
	Combobox,
	ComboboxStore,
	Input,
	MantineStyleProps,
	PopoverWidth,
	ScrollArea,
	Text,
	useCombobox,
	Image,
} from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { FC, JSX, useEffect, useState } from 'react';


export type SearchableSelectItem = {
	value: string;
	label: string;
};

export type SearchableSelectProps = {
	actionOptionLabel?: string;
	dropdownWidth?: PopoverWidth;
	items: SearchableSelectItem[];
	searchBoxEnabledAt?: number; // Show search box when there are more than this number of items
	searchPlaceholder?: string;
	scrollAreaHeight?: MantineStyleProps['mah'];
	triggerComponent?: typeof Button;
	unselectedPlaceholder?: string;
	value?: string | null;
	onChange?: (value: string) => void;
};



export const SearchableSelect: FC<SearchableSelectProps> = (rawProps) => {
	const props = {
		...rawProps,
		searchBoxEnabledAt: rawProps.searchBoxEnabledAt ?? 5,
	};
	const { value: activeValue } = props;
	const isSearchBoxEnabled =
		props.items.length >= Number(props.searchBoxEnabledAt);
	const { search, setSearch, activeItem, setActiveItem, combobox } =
		useSearchSelect(isSearchBoxEnabled);

	useEffect(() => {
		const selectedItem = findItem(props.items, activeValue);
		setActiveItem(selectedItem);
	}, [activeValue, props.items]);

	const options = props.items
		.filter((item) =>
			item.label?.toLowerCase().includes(search.toLowerCase().trim()),
		)
		.map((item) => (
			<Combobox.Option
				value={item.value}
				key={item.value}
				active={item.value === activeValue}
			>
				{item.label || item.value}
			</Combobox.Option>
		));


	return (
		<Combobox
			size='md'
			store={combobox}
			withinPortal={true}
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
				scrollAreaHeight={props.scrollAreaHeight}
				totalOptsCount={props.items.length}
				options={options}
			/>
		</Combobox>
	);
};

function useSearchSelect(isSearchBoxEnabled: boolean) {
	const [search, setSearch] = useState('');
	const [activeItem, setActiveItem] = useState<
		SearchableSelectItem | null | undefined
	>(null);

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
}

function findItem(items: SearchableSelectItem[], value: string | undefined | null) {
	if (!value) return null;
	return items.find((item) => item.value === value) ?? null;
}

type ComboboxTargetProps = {
	value?: string | null;
	combobox: ComboboxStore;
	triggerComponent?: typeof Button;
	unselectedPlaceholder?: string;
};

const ComboboxTarget: FC<ComboboxTargetProps> = (props) => {
	const { value, combobox } = props;
	const TriggerComponent = props.triggerComponent ?? Button;

	return (
		<Combobox.Target>
			<TriggerComponent
				px={'sm'}
				rightSection={<IconChevronDown size={20}/>}
				// leftSection={<Image mb={2} alt='org.logo' src={'/icon.ico'} width={20} height={20}/>}
				onClick={() => combobox.toggleDropdown()}
			>
				{value ?
					<Text ta={'left'} fz={'xl'} fw={900} miw={100}>{value}</Text>
					: <Input.Placeholder>
						{props.unselectedPlaceholder ?? 'No item selected'}
					</Input.Placeholder>}
			</TriggerComponent>
		</Combobox.Target>
	);
};

type ComboboxDropdownProps = {
	actionOptionLabel?: string;
	search: string;
	searchBoxEnabledAt?: number; // Show search box when there are more than this number of items
	searchPlaceholder?: string;
	setSearch: (value: string) => void;
	scrollAreaHeight?: MantineStyleProps['mah'];
	totalOptsCount: number; // Number of options without applied search/filter
	options: JSX.Element[];
};

const ComboboxDropdown: FC<ComboboxDropdownProps> = (props) => {
	return (
		<Combobox.Dropdown>
			{props.totalOptsCount >= Number(props.searchBoxEnabledAt) && (
				<Combobox.Search
					value={props.search}
					onChange={(event) => props.setSearch(event.currentTarget.value)}
					placeholder={props.searchPlaceholder}
				/>
			)}
			<Combobox.Options>
				<ScrollArea.Autosize
					type='scroll'
					mah={props.scrollAreaHeight ?? '50vh'}
				>
					{props.actionOptionLabel && (
						<Combobox.Option value='$$action$$'>
							{props.actionOptionLabel}
						</Combobox.Option>
					)}
					<Combobox.Group label=' '>
						{props.options.length > 0 ? (
							props.options
						) : (
							<Combobox.Empty>Nothing found</Combobox.Empty>
						)}
					</Combobox.Group>
				</ScrollArea.Autosize>
			</Combobox.Options>
		</Combobox.Dropdown>
	);
};
