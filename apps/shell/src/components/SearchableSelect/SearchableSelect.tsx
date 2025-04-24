'use client';

import { Box, Combobox, ComboboxStore, Input, Anchor, PopoverWidth, ScrollArea, useCombobox } from '@mantine/core';
import { IconCircleDottedLetterN } from '@tabler/icons-react';
import { FC, JSX, useEffect, useState } from 'react';

type GroceryItem = {
	id: string;
	name: string;
	slug: string;
};

const slugify = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with single dash
		.trim();
};

const groceries: GroceryItem[] = [
	'🍎 Apples',
	'🍌 Bananas',
	'🥦 Broccoli',
	'🥕 Carrots',
	'🍫 Chocolate',
	'🍇 Grapes',
	'🍋 Lemon',
	'🥬 Lettuce',
	'🍄 Mushrooms',
	'🍊 Oranges',
	'🥔 Potatoes',
	'🍅 Tomatoes',
	'🥚 Eggs',
	'🥛 Milk',
	'🍞 Bread',
	'🍗 Chicken',
	'🍔 Hamburger',
	'🧀 Cheese',
	'🥩 Steak',
	'🍟 French Fries',
	'🍕 Pizza',
	'🥦 Cauliflower',
	'🥜 Peanuts',
	'🍦 Ice Cream',
	'🍯 Honey',
	'🥖 Baguette',
	'🍣 Sushi',
	'🥝 Kiwi',
	'🍓 Strawberries',
].map(item => {
	const obj: any = {
		id: item.match(/^\p{Emoji}/u)?.[0] || '',  // Get first emoji character
		name: item, // Remove emoji and leading space
		slug: slugify(item.replace(/^\p{Emoji}\s*/u, '').trim()),
	};
	return obj;
});

export type SearchableSelectProps = {
	dropdownWidth?: PopoverWidth;
	value?: string | null;
	onChange?: (value: string) => void;
};

/**
 * @see https://mantine.dev/combobox/?e=SelectDropdownSearch
 */
export const SearchableSelect: FC<SearchableSelectProps> = ({ dropdownWidth, value: activeValue, onChange }) => {
	const { search, setSearch, value, setValue, combobox } = useSearchSelect();

	useEffect(() => {
		activeValue && setValue(activeValue);

	}, [setValue, activeValue]);

	const options = groceries
		.filter(item => item.name.toLowerCase().includes(search.toLowerCase().trim()))
		.map(item => (
			<Combobox.Option value={item.slug} key={item.slug} active={item.slug === activeValue}>
				{item.name}
			</Combobox.Option>
		));
	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			width={dropdownWidth}
			onOptionSubmit={(val) => {
				const selected = groceries.find(item => item.slug === val)?.slug || '';
				setValue(selected);
				combobox.closeDropdown();
				onChange?.(val);
			}}
		>
			<ComboboxTarget value={value} combobox={combobox} />
			<ComboboxDropdown
				search={search}
				setSearch={setSearch}
				options={options}
			/>
		</Combobox>
	);
};

const useSearchSelect = () => {
	const [search, setSearch] = useState('');
	const [value, setValue] = useState<string | null>(null);

	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
			combobox.focusTarget();
			setSearch('');
		},
		onDropdownOpen: (eventSource) => {
			combobox.focusSearchInput();
			combobox.selectActiveOption();
			// if (eventSource === 'keyboard') {
			// }
			// else {
			// 	combobox.updateSelectedOptionIndex('active');
			// }
		},
	});

	return { search, setSearch, value, setValue, combobox };
};

type ComboboxTargetProps = {
	value: string | null;
	combobox: ComboboxStore;
};

const ComboboxTarget: FC<ComboboxTargetProps> = ({ value, combobox }) => (
	<Combobox.Target>
		{/* <InputBase
			component='button'
			type='button'
			pointer
			rightSection={<Combobox.Chevron />}
			onClick={() => combobox.toggleDropdown()}
			rightSectionPointerEvents='none'
			w={200}
			style={{
				fontSize: '2rem',
				fontWeight: 'bold',
			}}

		> */}
		<button
			className='flex flex-row items-center gap-1'
			onClick={() => combobox.toggleDropdown()}
			style={{
				fontSize: '1.25rem',
				fontWeight: 'bold',
				cursor: 'pointer',
			}}
		>
			<IconCircleDottedLetterN size={34} />
			{value || <Input.Placeholder>Select organization</Input.Placeholder>}
			<Combobox.Chevron />
		</button>
		{/* </InputBase> */}
	</Combobox.Target>
);

type ComboboxDropdownProps = {
	search: string;
	setSearch: (value: string) => void;
	options: JSX.Element[];
};

const ComboboxDropdown: FC<ComboboxDropdownProps> = ({search, setSearch, options}) => (
	<Combobox.Dropdown>
		<Combobox.Search
			value={search}
			onChange={(event) => setSearch(event.currentTarget.value)}
			placeholder='Search groceries'
		/>
		<Combobox.Options>
			<ScrollArea.Autosize type='scroll' mah={200}>
				<Combobox.Option value='$create'>Manage organization...</Combobox.Option>
				<Combobox.Group label=' '>
					{options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
				</Combobox.Group>
			</ScrollArea.Autosize>
		</Combobox.Options>
	</Combobox.Dropdown>
);
