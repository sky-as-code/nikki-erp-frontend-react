import { createTheme, Input, MantineProvider, Stack, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import classes from './ModuleSearchPanel.module.css';
import { useModuleSearchInput } from './useModuleSearchInput';


type ModuleSearchInputProps = {
	searchInputValue: string;
	onSearchChange: (value: string) => void;
	onSearchClear: () => void;
	placeholder?: string;
	maxWidth?: number | string;
};

export const ModuleSearchInput: FC<ModuleSearchInputProps> = ({
	searchInputValue,
	onSearchChange,
	onSearchClear,
	placeholder = 'Search modules... (Ctrl + K)',
	maxWidth = 550,
}) => {
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

	const ClearButtonWrapper = () => (
		<Stack justify='center' align='center'>
			<Input.ClearButton onMouseDown={(e) => e.preventDefault()} onClick={handleClear} />
		</Stack>
	);

	return (
		<MantineProvider theme={theme}>
			<TextInput
				ref={inputRef}
				placeholder={placeholder}
				flex={1}
				size='sm'
				w={'100%'}
				radius={'md'}
				value={searchInputValue}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				classNames={{
					wrapper: `${classes.searchInputWrapper} ${isFocused ? classes.searchInputWrapperFocused : ''}`,
				}}
				leftSection={<IconSearch size={16} />}
				leftSectionPointerEvents='auto'
				rightSection={searchInputValue !== '' ? <ClearButtonWrapper /> : undefined}
				rightSectionPointerEvents='auto'
				maw={maxWidth}
			/>
		</MantineProvider>
	);
};

