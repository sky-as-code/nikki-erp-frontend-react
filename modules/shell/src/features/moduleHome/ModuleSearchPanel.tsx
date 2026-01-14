import { Button, createTheme, Flex, MantineProvider, TextInput } from '@mantine/core';
import { Input } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { FC, useRef, useEffect } from 'react';
import { useState } from 'react';

import classes from './ModuleSearchPanel.module.css';


export const ModuleSearchPanel: FC = () => {
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

	const [value, setValue] = useState<string>('');
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.currentTarget.value);
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);


	return (
		<Flex
			justify={{ base: 'center', sm: 'flex-center' }} gap={'sm'}
			py={'sm'} bdrs={'md'}
			// bg='var(--mantine-color-gray-2)'
			// bg='transparent'
		>
			<MantineProvider theme={theme}>
				<TextInput
					ref={inputRef}
					placeholder='Search modules... (Ctrl + K)'
					flex={1} size='sm' w={'100%'} radius={'md'}
					value={value} onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					classNames={{
						wrapper: `${classes.searchInputWrapper} ${isFocused ? classes.searchInputWrapperFocused : ''}`,
					}}
					leftSection={<IconSearch size={16} />}
					leftSectionPointerEvents='auto'
					rightSection={value !== '' ? <Input.ClearButton onClick={() => setValue('')} /> : undefined}
					rightSectionPointerEvents='auto'
					maw={500}
				/>
			</MantineProvider>
			<Button size='sm' radius={'md'}>Search</Button>
		</Flex>
	);
};