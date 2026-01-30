/* eslint-disable max-lines-per-function */
import { Badge, Group, Combobox, useCombobox, TextInput, Flex, InputBase, Input, CloseButton } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import React, { useRef, useState, useEffect, useMemo } from 'react';

import { FilterTag, SearchConfig } from './types';


export interface SearchInputWithTagsProps {
	tags: FilterTag[];
	onTagRemove: (tag: FilterTag) => void;
	onSearchChange: (fieldKey: string, value: string) => void;
	searchValue?: string; // Optional, chỉ dùng để reset khi cần
	searchFields?: SearchConfig[];
	placeholder?: string;
	onFilterDropdownToggle?: (opened: boolean) => void; // Callback để điều khiển FilterDropdown
	filterDropdownOpened?: boolean; // Trạng thái mở/đóng của FilterDropdown
	style?: React.CSSProperties;
}

export const SearchInputWithTags: React.FC<SearchInputWithTagsProps> = ({
	tags,
	onTagRemove,
	onSearchChange,
	searchValue: _searchValue,
	placeholder = 'Tìm kiếm...',
	searchFields = [],
	onFilterDropdownToggle,
	filterDropdownOpened,
	style,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);
	// const [selectedField, setSelectedField] = useState<SearchConfig | null>(null);
	// const [inputValue, setInputValue] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
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
				onSearchChange(field.key, searchQuery.trim());
			}

			setSearchQuery('');
			combobox.closeDropdown();
			// Đảm bảo input được focus
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};

	// Xử lý khi thay đổi giá trị trong input
	const handleInputChange = (value: string) => {
		setSearchQuery(value);
		// Mở dropdown khi có giá trị và chưa chọn field
		if (value.trim() !== '' && isFocused && searchFields.length > 0) {
			combobox.openDropdown();
		}
		// Ẩn FilterDropdown khi đang nhập
		if (value.trim() !== '') {
			onFilterDropdownToggle?.(false);
		}
	};

	// Xử lý khi nhấn Enter
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (searchQuery.trim() && fieldOptions.length > 0) {
				// Chưa chọn field nhưng có giá trị, chọn option đầu tiên nếu có
				const firstOption = fieldOptions[0];
				if (firstOption) {
					handleFieldSelect(firstOption.value);
				}
			}
		}
	};

	// Xử lý khi blur
	const handleBlur = () => {
		setTimeout(() => {
			setIsFocused(false);
			combobox.closeDropdown();
		}, 200);
	};

	// Xử lý khi focus
	const handleFocus = () => {
		setIsFocused(true);
		if (searchFields.length > 0 && searchQuery.trim() !== '') {
			combobox.openDropdown();
			// onFilterDropdownToggle?.(false);
		}
		else {
			// onFilterDropdownToggle?.(true);
		}
	};

	// Xử lý khi click
	const handleClick = () => {
		setIsFocused(true);
		if (searchFields.length > 0 && searchQuery.trim() !== '') {
			combobox.openDropdown();
			onFilterDropdownToggle?.(false);
		}
		else {
			onFilterDropdownToggle?.(true);
		}
	};

	// Khi có giá trị nhập vào, tự động mở dropdown
	useEffect(() => {
		if (searchQuery.trim() !== '' &&  isFocused && searchFields.length > 0) {
			combobox.openDropdown();
		}
		else if (!isFocused) {
			combobox.closeDropdown();
		}
	}, [searchQuery, isFocused, searchFields.length]);

	// Đảm bảo input giữ focus khi FilterDropdown toggle
	useEffect(() => {
		if (filterDropdownOpened !== undefined && isFocused && inputRef.current) {
			const timer = setTimeout(() => {
				if (inputRef.current && document.activeElement !== inputRef.current) {
					inputRef.current.focus();
				}
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [filterDropdownOpened, isFocused]);

	const renderTags = () => {

		return (tags.length > 0 && (
			<Group
				gap='xs'
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
									onTagRemove(tag);
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
				...style,
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
					<Input.Wrapper display={'flex'} style={{alignItems: 'center'}} bg={'white'}>
						<IconSearch size={16} />
						{renderTags()}
						<Input ref={inputRef}
							placeholder={
								placeholder
							}

							value={searchQuery}
							onChange={(e) => {
								const value = e.currentTarget.value;
								handleInputChange(value);
							}}
							onFocus={handleFocus}
							onClick={handleClick}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							variant='unstyled'
						/>
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
