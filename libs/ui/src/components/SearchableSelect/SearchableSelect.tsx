import {
	ActionIcon,
	Box,
	Button,
	CloseButton,
	Combobox,
	ComboboxProps,
	ComboboxStore,
	Divider,
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

import { useDropdownWidthProps } from './dropdownWidth';
import { DEFAULT_MAX_OPTIONS, limitOptions } from './optionLimit';
import { useShowLockedFeature } from '../ErrorState';
import { useFormInputSize } from '../Input/inlineControls';
import { withFormInputDensity, withInputDensity } from '../Input/inputDensity';

import type { FormInputSize } from '../Input/inputDensity';


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
	/**
	 * Passed through to Mantine's `Combobox`, after this component's own defaults, e.g. `classNames`
	 * to bound a content-sized (`width: 'max-content'`) dropdown.
	 */
	comboboxProps?: Omit<ComboboxProps, 'store' | 'onOptionSubmit' | 'children'>,
	items: SearchableSelectItem[],
	searchBoxEnabledAt?: number, // Show search box when there are more than this number of items
	searchPlaceholder?: string,
	scrollAreaHeight?: MantineStyleProps['mah'],
	triggerComponent?: typeof Button,
	/** How the closed control paints. Defaults to `button`. See {@link SearchableSelectVariant}. */
	variant?: SearchableSelectVariant,
	/**
	 * The `input` variant stands in for a form field: it takes the form field's height
	 * (`--nikki-form-control-height`) and text size, and its options match that text. Without it the
	 * control matches the `Input` and `Select` wrappers instead.
	 */
	formField?: boolean,
	unselectedPlaceholder?: string,
	value?: string | null,
	onChange?: (value: string) => void,
	/**
	 * Offers a clear mark on the `input` variant while a value is picked; picking it (or Backspace /
	 * Delete on the control) calls `onClear`. A form field passes this when it is not required.
	 */
	clearable?: boolean,
	onClear?: () => void,
	/**
	 * The user left the control: an option was picked (after `onChange`) or the dropdown was
	 * dismissed. Not fired for the action option, whose caller decides when its own flow ends. A form
	 * field passes its `onBlur` here, since focus moves into the dropdown long before the user leaves.
	 */
	onBlur?: () => void,
	/**
	 * At most this many matching options are shown, the picked one always among them; `0` shows
	 * all. Defaults to {@link DEFAULT_MAX_OPTIONS}. A caller that fetches the options should request
	 * `searchPageSize(maxOptions)` rows, so the list and the request agree.
	 */
	maxOptions?: number,
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

/** The options whose label contains the search term, the current value marked active. */
function renderOptions(
	items: SearchableSelectItem[], search: string, activeValue: string | null | undefined, testId: string | undefined,
	maxOptions: number,
): JSX.Element[] {
	const term = search.toLowerCase().trim();
	const matching = items.filter(item => item.label?.toLowerCase().includes(term));
	return limitOptions(matching, maxOptions, activeValue)
		.map(item => (
			<Combobox.Option
				value={item.value}
				key={item.value}
				active={item.value === activeValue}
				{...testAttrs(testId, 'option', item.value)}
			>
				{item.label || item.value}
			</Combobox.Option>
		));
}



export const SearchableSelect: FC<SearchableSelectProps> = (rawProps) => {
	const props = {
		...rawProps,
		searchBoxEnabledAt: rawProps.searchBoxEnabledAt ?? 5,
	};
	const { value: activeValue } = props;
	const isSearchBoxEnabled =
		props.items.length >= Number(props.searchBoxEnabledAt);
	const { search, setSearch, activeItem, setActiveItem, combobox, closeOnSubmit } =
		useSearchSelect(isSearchBoxEnabled, props.onBlur);

	useEffect(() => {
		const selectedItem = findItem(props.items, activeValue);
		setActiveItem(selectedItem);
	}, [activeValue, props.items]);

	const widthProps = useDropdownWidthProps(props.dropdownWidth);
	const formSize = useFormInputSize();
	// The options follow the text of the control, which Mantine's `Combobox` derives from `size`.
	const size = props.formField ? formSize : undefined;
	const options = renderOptions(
		props.items, search, activeValue, props.testId, props.maxOptions ?? DEFAULT_MAX_OPTIONS,
	);
	const onClear = props.clearable ? () => {
		setActiveItem(null);
		props.onClear?.();
	} : undefined;

	const control = (
		<Combobox
			store={combobox}
			size={size}
			withinPortal={true}
			{...widthProps} {...props.comboboxProps}
			onOptionSubmit={(val) => {
				closeOnSubmit();
				if (val === ACTION_OPTION_VALUE) {
					props.onActionTrigger?.();
					return;
				}
				const selected = findItem(props.items, val);
				setActiveItem(selected);
				props.onChange?.(val);
				props.onBlur?.();
			}}
		>
			<ComboboxTarget
				value={activeItem?.label}
				combobox={combobox}
				triggerComponent={props.triggerComponent}
				variant={props.variant}
				size={size}
				unselectedPlaceholder={props.unselectedPlaceholder}
				disabled={props.disabled}
				onClear={onClear}
				testId={props.testId}
			/>
			<ComboboxDropdown
				actionOptionLabel={props.actionOptionLabel}
				testId={props.testId}
				search={search}
				showSearchBox={isSearchBoxEnabled}
				searchPlaceholder={props.searchPlaceholder}
				setSearch={value => {
					setSearch(value);
					props.onSearchChange?.(value);
				}}
				scrollAreaHeight={props.scrollAreaHeight}
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

function useSearchSelect(isSearchBoxEnabled: boolean, onBlur: (() => void) | undefined) {
	const onBlurRef = React.useRef(onBlur);
	onBlurRef.current = onBlur;
	// An option submit reports the blur itself, after its change, so the field validates the new value.
	const isSubmittingRef = React.useRef(false);
	const [search, setSearch] = useState('');
	const [activeItem, setActiveItem] = useState<
		SearchableSelectItem | null | undefined
	>(null);

	const combobox = useCombobox({
		onDropdownClose: () => {
			combobox.resetSelectedOption();
			// combobox.focusTarget();
			setSearch('');
			if (!isSubmittingRef.current) {
				onBlurRef.current?.();
			}
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

	const closeOnSubmit = () => {
		isSubmittingRef.current = true;
		combobox.closeDropdown();
		isSubmittingRef.current = false;
	};

	return { search, setSearch, activeItem, setActiveItem, combobox, closeOnSubmit };
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
	/** Set for a form field: its text size, with the form field's height. */
	size?: FormInputSize,
	/** Set only when the control may be cleared; shown while a value is picked. */
	onClear?: () => void,
	testId?: string,
};

/** Sized like the `Input` and `Select` wrappers, so the control matches the inputs beside it. */
const INPUT_DENSITY_CLASS_NAMES = withInputDensity({});
/** Sized like the form fields (`formInputProps`), for a select standing in for one. */
const FORM_INPUT_DENSITY_CLASS_NAMES = withFormInputDensity({});

const ComboboxTarget: FC<ComboboxTargetProps> = (props) => {
	const { value, combobox } = props;

	// The `input` variant renders Mantine's own `InputBase` rather than a Button, so a select
	// standing in for a form field inherits the same border, height and background as every other
	// input beside it. The default Button trigger is filled in the theme's primary colour, which
	// reads as a call-to-action — right for the shell's org switcher, wrong for a field.
	if (props.variant === 'input' && !props.triggerComponent) {
		const onClear = value && !props.disabled ? props.onClear : undefined;
		return (
			<Combobox.Target>
				<InputBase
					component='button'
					type='button'
					pointer
					size={props.size}
					classNames={props.size ? FORM_INPUT_DENSITY_CLASS_NAMES : INPUT_DENSITY_CLASS_NAMES}
					rightSection={onClear
						? <ClearMark onClear={onClear} testId={props.testId} />
						: <Combobox.Chevron />}
					rightSectionPointerEvents={onClear ? 'all' : 'none'}
					onClick={() => combobox.toggleDropdown()}
					onKeyDown={onClear ? event => isClearKey(event.key) && onClear() : undefined}
					disabled={props.disabled}
					{...testAttrs(props.testId, 'trigger')}
				>
					{value
						? <span className='block truncate' title={value}>{value}</span>
						: (
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
					? <Text ta={'left'} fz={'h5'} fw={'bolder'} miw={20} truncate title={value}>{value}</Text>
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
	/** Decided once, from the unfiltered item count, by the same rule that focuses the box on open. */
	showSearchBox: boolean,
	searchPlaceholder?: string,
	setSearch: (value: string) => void,
	scrollAreaHeight?: MantineStyleProps['mah'],
	options: JSX.Element[],
};

const ComboboxDropdown: FC<ComboboxDropdownProps> = (props) => {
	return (
		<Combobox.Dropdown>
			{props.showSearchBox && (
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
					{props.showSearchBox ? (
						// The blank group label draws the rule that separates the list from the search box
						// above it; without a search box it would be a bar with nothing to separate.
						<Combobox.Group label=' ' {...testAttrs(props.testId, 'searchSeparator')}>
							<OptionsOrEmpty options={props.options} />
						</Combobox.Group>
					) : (
						<OptionsOrEmpty options={props.options} />
					)}
				</ScrollArea.Autosize>
				{props.actionOptionLabel && (
					<>
						<Divider my={4} {...testAttrs(props.testId, 'actionDivider')} />
						<Combobox.Option value={ACTION_OPTION_VALUE} {...testAttrs(props.testId, 'actionOption')}>
							{props.actionOptionLabel}
						</Combobox.Option>
					</>
				)}
			</Combobox.Options>
		</Combobox.Dropdown>
	);
};

function OptionsOrEmpty({ options }: { options: JSX.Element[] }): React.ReactNode {
	return options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>;
}

function isClearKey(key: string): boolean {
	return key === 'Backspace' || key === 'Delete';
}

/**
 * The clear mark inside the control. A `span`, not a button: the control itself is a `<button>`,
 * which may not contain another. Its mouse-down is swallowed so the press does not also open the
 * dropdown; keyboard users clear with Backspace / Delete on the control.
 */
function ClearMark({ onClear, testId }: { onClear: () => void, testId?: string }): React.ReactElement {
	const { t: translate } = useTranslation();
	return (
		<CloseButton
			component='span'
			size='sm'
			aria-label={translate('action.clear', { defaultValue: 'Clear' })}
			onMouseDown={(event: React.MouseEvent) => {
				event.preventDefault();
				event.stopPropagation();
			}}
			onClick={(event: React.MouseEvent) => {
				event.stopPropagation();
				onClear();
			}}
			{...testAttrs(testId, 'clear')}
		/>
	);
}
