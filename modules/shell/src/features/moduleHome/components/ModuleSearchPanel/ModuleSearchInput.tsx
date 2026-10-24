import { createTheme, Input, Stack, TextInput } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { toAriaKeyShortcuts, useShortcut } from '@nikkierp/ui/shortcuts';
import { SyncedMantineProvider } from '@nikkierp/ui/theme';
import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import classes from './ModuleSearchPanel.module.css';
import { useModuleSearchInput } from '../../hooks/useModuleSearchInput';


const TEST_ID = 'shell.moduleSearch';
const SEARCH_SHORTCUT = '/';


type ModuleSearchInputProps = {
	searchInputValue: string,
	onSearchChange: (value: string) => void,
	onSearchClear: () => void,
	placeholder?: string,
	maxWidth?: number | string,
};

export const ModuleSearchInput: FC<ModuleSearchInputProps> = ({
	searchInputValue,
	onSearchChange,
	onSearchClear,
	placeholder,
	maxWidth = 550,
}) => {
	const translate = useTranslate('common');
	const theme = createTheme({
		components: {
			Input: Input.extend({
				classNames: {
					input: classes.searchInput,
					wrapper: classes.searchInputWrapper,
				},
			}),
		},
	});

	const {
		isFocused,
		inputRef,
		handleChange,
		handleClear,
		handleFocus,
		handleBlur,
	} = useModuleSearchInput({ searchInputValue, onSearchChange, onSearchClear });
	useShortcut(inputRef, SEARCH_SHORTCUT, { mode: 'focus' });

	const ClearButtonWrapper = () => (
		<Stack justify='center' align='center'>
			<Input.ClearButton
				onMouseDown={(e) => e.preventDefault()} onClick={handleClear}
				{...testAttrs(TEST_ID, 'clear')}
			/>
		</Stack>
	);

	return (
		<SyncedMantineProvider theme={theme}>
			<TextInput
				ref={inputRef}
				placeholder={placeholder ?? translate('search.placeholder')}
				aria-keyshortcuts={toAriaKeyShortcuts(SEARCH_SHORTCUT)}
				flex={1}
				w={'100%'}
				radius={'md'}
				value={searchInputValue}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				{...testAttrs(TEST_ID, 'input')}
				classNames={{
					wrapper: `${classes.searchInputWrapper} ${isFocused ? classes.searchInputWrapperFocused : ''}`,
				}}
				leftSection={<IconSearch size={16} />}
				leftSectionPointerEvents='auto'
				rightSection={searchInputValue !== '' ? <ClearButtonWrapper /> : undefined}
				rightSectionPointerEvents='auto'
				maw={maxWidth}
			/>
		</SyncedMantineProvider>
	);
};

