/* eslint-disable max-lines-per-function */
import { Badge, Group, Combobox, useCombobox, Flex, Input, Button } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterGroupConfig, FilterState } from './types';
import { useFilterOperations } from './useFilterOperations';


export interface SearchComboboxProps {
	config: FilterGroupConfig;
	state: FilterState;
	updateState: (updates: Partial<FilterState>) => void;
	resetState?: () => void;
	placeholder?: string;
}

export const SearchCombobox: React.FC<SearchComboboxProps> = ({
	config,
	state,
	updateState,
	placeholder,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const searchFields = config.search || [];
	const {t: translate} = useTranslation();

	const [isFocused, setIsFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const [opened, setOpened] = useState(false);
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		opened,
	});
	const { tags, handleSearchChange } = useFilterOperations({
		state,
		updateState,
		config,
	});

	// Tạo options từ searchFields - hiện khi chưa chọn field
	const fieldOptions = useMemo(() => {
		if (searchQuery.trim()) {
			return searchFields.map((field) => ({
				value: field.key,
				label: field.label,
			}));
		}
		return [];
	}, [searchFields, searchQuery, isFocused]);

	// Xử lý khi chọn field từ dropdown
	const handleFieldSelect = (fieldKey: string) => {
		const field = searchFields.find((f) => f.key === fieldKey);
		if (field) {
			// Nếu đã có giá trị nhập vào (searchQuery), tự động thêm tag ngay lập tức
			if (searchQuery.trim()) {
				handleSearchChange(field.key, searchQuery.trim());
			}
			setSearchQuery('');
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};



	// Xử lý khi nhấn Enter
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (searchQuery.trim() && fieldOptions.length > 0) {
				if (fieldOptions[0]) {
					handleFieldSelect(fieldOptions[0].value);
				}
			}
		}
	};

	// Xử lý khi blur
	const handleBlur = () => {
		setIsFocused(false);
		setOpened(false);
	};

	// Khi có giá trị nhập vào, tự động mở dropdown
	useEffect(() => {
		if (searchQuery.trim() !== '' && searchFields.length > 0) {
			setOpened(true);
		}
	}, [searchQuery, isFocused, searchFields.length]);


	const renderTags = () => {
		return (tags.length > 0 && (
			<Group
				gap={3}
				wrap='nowrap'
				style={{
					minHeight: 24,
					overflowX: 'auto',
				}}
				maw={500}
			>
				{tags.map((tag, index) => (
					<Badge
						key={`${tag.type}-${tag.key}-${index}`}
						size='sm'
						variant='light'
						color='blue'
						w='max-content'
						maw={200}
						rightSection={
							<IconX
								size={12}
								style={{ cursor: 'pointer', marginLeft: 4 }}
								onClick={(e) => {
									e.stopPropagation();
									tag?.onRemove();
								}}
							/>
						}
						style={{
							cursor: 'default',
						}}
					>
						{tag.label}: {Array.isArray(tag.value) ? tag.value.join(' or ') : tag.value}
					</Badge>
				))}
			</Group>
		));
	};



	return (
		<Flex
			style={{
				position: 'relative',
				minWidth: 300,
				width: '100%',
				maxWidth: 600,
			}}
			direction='column'
			gap='xs'
		>
			<Combobox
				store={combobox}
				onOptionSubmit={handleFieldSelect}
				withinPortal={false}
			>
				<Combobox.Target>
					<Input.Wrapper
						display={'flex'}
						bg={'white'}
						px={'xs'}
						style={{alignItems: 'center', gap: 6 }}
					>
						<IconSearch size={16} />
						{renderTags()}
						<Input flex={1} ref={inputRef}
							placeholder={placeholder || translate('nikki.general.search.placeholder')}
							value={searchQuery}
							onChange={(e) => {
								if (searchFields.length === 0) {
									return;
								}
								const value = e.currentTarget.value;
								setSearchQuery(value);
							}}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							onFocus={() => setIsFocused(true)}
							autoFocus
							variant='unstyled'
						/>
						{searchQuery &&
							<Button
								variant='transparent'
								color='gray'
								px={5}
								onClick={() => {
									setSearchQuery('');
								}}
							>
								<IconX size={16} />
							</Button>
						}
					</Input.Wrapper>
				</Combobox.Target>

				{fieldOptions.length > 0 && (
					<Combobox.Dropdown>
						<Combobox.Options>
							{fieldOptions.map((option) => (
								<Combobox.Option value={option.value} key={option.value}>
									{option.label}
								</Combobox.Option>
							))}
						</Combobox.Options>
					</Combobox.Dropdown>
				)}
			</Combobox>
		</Flex>
	);
};
