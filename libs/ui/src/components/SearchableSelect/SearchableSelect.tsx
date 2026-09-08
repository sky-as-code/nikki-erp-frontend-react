import {
	ActionIcon,
	Box,
	Button,
	Combobox,
	ComboboxStore,
	Group,
	Input,
	InputBase,
	MantineStyleProps,
	PopoverWidth,
	ScrollArea,
	Text,
	useCombobox,
} from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { IconChevronDown, IconLock } from '@tabler/icons-react';
import React, { FC, JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useShowLockedFeature } from '../ErrorState';


export type SearchableSelectItem = {
	value: string,
	label: string,
};

/**
 * How the closed control paints.
 *
 * `button` (the default) keeps the original filled, primary-coloured trigger the shell's org and
 * module switchers rely on. `input` renders a Mantine `InputBase` instead, so a select acting as a
 * **form field** matches the inputs beside it rather than shouting in the theme's accent colour.
 */
export type SearchableSelectVariant = 'button' | 'input';

export type SearchableSelectProps = {
	actionOptionLabel?: string,
	/**
	 * Fired when the action option (`actionOptionLabel`) is picked, instead of `onChange` — so a
	 * caller opening a modal from it never has to compare against the `'$$action$$'` sentinel
	 * value itself. The dropdown is already closed by the time this fires.
	 */
	onActionTrigger?: () => void,
	dropdownWidth?: PopoverWidth,
	items: SearchableSelectItem[],
	searchBoxEnabledAt?: number, // Show search box when there are more than this number of items
	searchPlaceholder?: string,
	scrollAreaHeight?: MantineStyleProps['mah'],
	triggerComponent?: typeof Button,
	/** How the closed control paints. Defaults to `button`. See {@link SearchableSelectVariant}. */
	variant?: SearchableSelectVariant,
	unselectedPlaceholder?: string,
	value?: string | null,
	onChange?: (value: string) => void,
	disabled?: boolean,
	/**
	 * Reports every keystroke in the search box, verbatim. For a caller whose `items` are already
	 * server-filtered for the current term (rather than a fixed in-memory list), this is what
	 * drives the next server request — the box's own client-side substring filter over `items`
	 * still runs too, but only ever narrows what's already on the current page.
	 */
	onSearchChange?: (term: string) => void,
	/** `{module}.{component}` prefix for the trigger, search box and options. */
	testId?: string,
	/**
	 * The caller may not read the data behind this dropdown. Renders a lock button beside the
	 * control which explains the refusal when clicked, rather than leaving an empty list the user
	 * cannot account for.
	 */
	locked?: boolean,
	/** The entitlements the caller lacks, shown in the refusal. */
	lockedMissing?: string[],
};

const ACTION_OPTION_VALUE = '$$action$$';



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
				{...testAttrs(props.testId, 'option', item.value)}
			>
				{item.label || item.value}
			</Combobox.Option>
		));


	const control = (
		<Combobox
			size='md'
			store={combobox}
			withinPortal={true}
			width={props.dropdownWidth}
			onOptionSubmit={(val) => {
				combobox.closeDropdown();
				if (val === ACTION_OPTION_VALUE) {
					props.onActionTrigger?.();
					return;
				}
				const selected = findItem(props.items, val);
				setActiveItem(selected);
				props.onChange?.(val);
			}}
		>
			<ComboboxTarget
				value={activeItem?.label}
				combobox={combobox}
				triggerComponent={props.triggerComponent}
				variant={props.variant}
				unselectedPlaceholder={props.unselectedPlaceholder}
				disabled={props.disabled}
				testId={props.testId}
			/>
			<ComboboxDropdown
				actionOptionLabel={props.actionOptionLabel}
				testId={props.testId}
				search={search}
				searchBoxEnabledAt={props.searchBoxEnabledAt}
				searchPlaceholder={props.searchPlaceholder}
				setSearch={value => {
					setSearch(value);
					props.onSearchChange?.(value);
				}}
				scrollAreaHeight={props.scrollAreaHeight}
				totalOptsCount={props.items.length}
				options={options}
			/>
		</Combobox>
	);

	if (!props.locked) {
		return control;
	}

	// The lock sits beside the control rather than replacing it: the field keeps its shape and its
	// current value, and only the affordance for reading more data is called out.
	return (
		<Group gap='xs' wrap='nowrap' align='center'>
			<Box style={{ flex: 1, minWidth: 0 }}>{control}</Box>
			<LockButton missing={props.lockedMissing} testId={props.testId} />
		</Group>
	);
};

/** The affordance that explains a dropdown the caller may not populate. */
function LockButton(props: { missing?: string[], testId?: string }): React.ReactElement {
	const showLocked = useShowLockedFeature();
	const { t: translate } = useTranslation();

	return (
		<ActionIcon
			variant='subtle'
			color='gray'
			aria-label={translate('insufficient_permission_title')}
			onClick={() => showLocked(props.missing ?? [])}
			{...testAttrs(props.testId, 'lock')}
		>
			<IconLock size={16} />
		</ActionIcon>
	);
}

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
		onDropdownOpen: (_eventSource) => {
			if(isSearchBoxEnabled) combobox.focusSearchInput();
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
	value?: string | null,
	combobox: ComboboxStore,
	triggerComponent?: typeof Button,
	unselectedPlaceholder?: string,
	disabled?: boolean,
	variant?: SearchableSelectVariant,
	testId?: string,
};

const ComboboxTarget: FC<ComboboxTargetProps> = (props) => {
	const { value, combobox } = props;

	// The `input` variant renders Mantine's own `InputBase` rather than a Button, so a select
	// standing in for a form field inherits the same border, height and background as every other
	// input beside it. The default Button trigger is filled in the theme's primary colour, which
	// reads as a call-to-action — right for the shell's org switcher, wrong for a field.
	if (props.variant === 'input' && !props.triggerComponent) {
		return (
			<Combobox.Target>
				<InputBase
					component='button'
					type='button'
					pointer
					size='md'
					rightSection={<Combobox.Chevron />}
					rightSectionPointerEvents='none'
					onClick={() => combobox.toggleDropdown()}
					disabled={props.disabled}
					{...testAttrs(props.testId, 'trigger')}
				>
					{value ?? (
						<Input.Placeholder>
							{props.unselectedPlaceholder ?? 'No item selected'}
						</Input.Placeholder>
					)}
				</InputBase>
			</Combobox.Target>
		);
	}

	const TriggerComponent = props.triggerComponent ?? Button;

	return (
		<Combobox.Target>
			<TriggerComponent
				px={'xs'}
				rightSection={<IconChevronDown size={14}/>}
				onClick={() => combobox.toggleDropdown()}
				disabled={props.disabled}
				{...testAttrs(props.testId, 'trigger')}
			>
				{value
					? <Text ta={'left'} fz={'h5'} fw={'bolder'} miw={20}>{value}</Text>
					: <Input.Placeholder>
						{props.unselectedPlaceholder ?? 'No item selected'}
					</Input.Placeholder>}
			</TriggerComponent>
		</Combobox.Target>
	);
};

type ComboboxDropdownProps = {
	actionOptionLabel?: string,
	testId?: string,
	search: string,
	searchBoxEnabledAt?: number, // Show search box when there are more than this number of items
	searchPlaceholder?: string,
	setSearch: (value: string) => void,
	scrollAreaHeight?: MantineStyleProps['mah'],
	totalOptsCount: number, // Number of options without applied search/filter
	options: JSX.Element[],
};

const ComboboxDropdown: FC<ComboboxDropdownProps> = (props) => {
	return (
		<Combobox.Dropdown>
			{props.totalOptsCount >= Number(props.searchBoxEnabledAt) && (
				<Combobox.Search
					value={props.search}
					onChange={(event) => props.setSearch(event.currentTarget.value)}
					placeholder={props.searchPlaceholder}
					{...testAttrs(props.testId, 'search')}
				/>
			)}
			<Combobox.Options>
				<ScrollArea.Autosize
					type='scroll'
					mah={props.scrollAreaHeight ?? '50vh'}
				>
					{props.actionOptionLabel && (
						<Combobox.Option value={ACTION_OPTION_VALUE} {...testAttrs(props.testId, 'actionOption')}>
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
