import { Combobox, Input, InputBase, PopoverWidth, ScrollArea, useCombobox } from '@mantine/core';
import { FC, useState } from 'react';

const groceries = [
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
];

export type SearchableSelectProps = {
	dropdownWidth?: PopoverWidth,
};

/**
 * @see https://mantine.dev/combobox/?e=SelectDropdownSearch
 */
export const SearchableSelect: FC<SearchableSelectProps> = (props) => {
	const [search, setSearch] = useState('');
	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
			combobox.focusTarget();
			setSearch('');
		},

		onDropdownOpen: () => {
			combobox.focusSearchInput();
		},
	});

	const [value, setValue] = useState<string | null>(null);

	const options = groceries
		.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
		.map((item) => (
			<Combobox.Option value={item} key={item}>
				{item}
			</Combobox.Option>
		));

	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			width={props.dropdownWidth}
			onOptionSubmit={(val) => {
				setValue(val);
				combobox.closeDropdown();
			}}
		>
			<Combobox.Target>
				<InputBase
					component='button'
					type='button'
					pointer
					rightSection={<Combobox.Chevron />}
					onClick={() => combobox.toggleDropdown()}
					rightSectionPointerEvents='none'
				>
					{value || <Input.Placeholder>Pick value</Input.Placeholder>}
				</InputBase>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Search
					value={search}
					onChange={(event) => setSearch(event.currentTarget.value)}
					placeholder='Search groceries'
				/>
				<Combobox.Options>
					<ScrollArea.Autosize type='scroll' mah={200}>
						<Combobox.Option value='$create'>➕ Create organization...</Combobox.Option>
						<Combobox.Group label=' '>
							{options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
						</Combobox.Group>
					</ScrollArea.Autosize>
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
};