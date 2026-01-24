import { Box, Button, Flex, Input, TextInput } from '@mantine/core';
import { IconAdjustmentsAlt, IconSearch } from '@tabler/icons-react';

import classes from './MobileBottomBar.module.css';


type MobileBottomBarProps = {
	searchInputValue: string;
	onSearchChange: (value: string) => void;
	onSearchClear: () => void;
	onFilterClick: () => void;
};

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
	searchInputValue,
	onSearchChange,
	onSearchClear,
	onFilterClick,
}) => (
	<Box className={classes.mobileBottomBar} display={{ base: 'flex', md: 'none' }}>
		<Flex gap={'xs'} align={'center'} w={'100%'} p={'xs'}>
			<Button
				variant={'outline'}
				h={36} w={40} p={0}
				style={{ flexShrink: 0 }}
				onClick={onFilterClick}
			>
				<IconAdjustmentsAlt stroke={1.5} size={24} />
			</Button>
			<Box style={{ flex: 1 }}>
				<TextInput
					placeholder={'Search modules...'}
					value={searchInputValue}
					onChange={(e) => onSearchChange(e.currentTarget.value)}
					leftSection={<IconSearch size={16} />}
					size={'sm'}
					radius={'sm'}
					w={'100%'}
					className={classes.mobileSearchInput}
					rightSection={
						searchInputValue !== '' ? (
							<Input.ClearButton onClick={onSearchClear} />
						) : undefined
					}
				/>
			</Box>
		</Flex>
	</Box>
);