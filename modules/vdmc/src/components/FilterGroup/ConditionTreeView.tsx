import {
	Box,
	Checkbox,
	Group,
	RangeSlider,
	Stack,
	Text,
} from '@mantine/core';
import { throttle } from 'lodash';
import React, { useEffect, useMemo } from 'react';

import { FilterConditionNode, FilterConfig, FilterState } from './types';


/**
 * Component hiển thị checkbox filter
 */
const ConditionCheckbox: React.FC<{
	nodeId: string;
	nodeWithId: FilterConditionNode | FilterConfig;
	operatorValue: any;
	parentKey?: string;
	existingFilterValue: FilterState['filter'][0] | undefined;
	onFilterChange: (nodeId: string, value: any) => void;
}> = ({ nodeId, nodeWithId, operatorValue, parentKey, existingFilterValue, onFilterChange }) => {
	const isArrayValue = Array.isArray(operatorValue);
	const filterValue = operatorValue;

	let valueLabel: string;
	if (isArrayValue) {
		const valueArray = filterValue as (string | number | boolean)[];
		valueLabel = `${valueArray.map((v) => String(v)).join(', ')}`;
	}
	else {
		valueLabel = String(operatorValue);
	}

	const isChecked = !!existingFilterValue;
	const [operator] = nodeWithId.condition;
	const label = parentKey && nodeWithId.key !== parentKey ? `${nodeWithId?.label} ${operator} ${valueLabel}` : `${valueLabel}`;

	return (
		<Checkbox
			label={label}
			checked={isChecked}
			onChange={() => {
				onFilterChange(nodeId, isChecked ? null : filterValue);
			}}
		/>
	);
};


/**
 * Component hiển thị range slider filter
 */
const ConditionRangeSlider: React.FC<{
	nodeId: string;
	displayLabel: string;
	filterComponent: NonNullable<FilterConditionNode['component']>;
	currentValue: any;
	onFilterChange: (nodeId: string, value: any) => void;
}> = ({ nodeId, displayLabel, filterComponent, currentValue, onFilterChange }) => {
	const min = filterComponent.min ?? 0;
	const max = filterComponent.max ?? 100;
	const step = filterComponent.step ?? 1;

	const rangeValue: [number, number] = Array.isArray(currentValue) && currentValue.length === 2
		? [currentValue[0] as number, currentValue[1] as number]
		: [min, max];

	// Throttle onChange handler using lodash throttle
	const throttledOnChange = useMemo(
		() => throttle((value: [number, number]) => {
			onFilterChange(nodeId, value);
		}, 300),
		[nodeId, onFilterChange],
	);

	// Cleanup throttle on unmount
	useEffect(() => {
		return () => {
			throttledOnChange.cancel();
		};
	}, [throttledOnChange]);

	return (
		<Stack gap='xs'>
			<Text size='sm' fw={500}>
				{displayLabel}
			</Text>
			<RangeSlider
				min={min}
				max={max}
				step={step}
				value={rangeValue}
				onChange={throttledOnChange}
				label={(value) => value}
			/>
			<Group gap='xs' justify='space-between'>
				<Text size='xs' c='dimmed'>
					Min: {rangeValue[0]}
				</Text>
				<Text size='xs' c='dimmed'>
					Max: {rangeValue[1]}
				</Text>
			</Group>
		</Stack>
	);
};


export interface ConditionTreeViewProps {
	filterConfig: FilterConfig | FilterConditionNode;
	filterState: FilterState['filter'];
	onFilterChange: (nodeId: string, value: any) => void;
}


/**
 * Component hiển thị một condition node trong cây filter
 * Nếu condition là $and hoặc $or, sẽ render lại ConditionNode mới với children
 * Nếu condition là operator đơn giản, sẽ render dưới dạng checkbox
 */
const ConditionNode: React.FC<{
	node: FilterConditionNode | FilterConfig;
	filterState: FilterState['filter'];
	onFilterChange: (nodeId: string, value: any) => void;
	depth?: number;
	parentNode?: {
		path: string;
		label: string;
		operator: string;
		key: string;
	}
	index?: number; // Index của node trong parent
}> = ({ node, filterState, onFilterChange, depth = 0, parentNode, index }) => {
	if (!node) return null;
	const [operator, conditionValue] = node.condition;

	const { path: parentPath, key: parentKey } = parentNode || {};

	// Tạo nodeId dựa trên path: parentPath-key-index hoặc key (nếu là root)
	// Path được tạo theo key + index trong node hiện tại
	const nodeId = parentPath !== undefined && index !== undefined
		? `${parentPath}-${node.key}_${index}`
		: node.key;

	// Cập nhật nodeId cho node nếu chưa có
	const nodeWithId = { ...node, nodeId };

	// Nếu là $and hoặc $or, render lại ConditionNode với children
	if (!node.component && ['$and', '$or'].includes(operator)) {
		const childNodes = conditionValue as FilterConditionNode[];
		const label = parentPath ? `${nodeWithId?.label} (${operator})` : '';

		return (
			<Stack gap='xs' pl={depth > 1 ? 'md' : 0}>
				<Text size='sm' fw={500}>
					{label}
				</Text>
				{childNodes.map((childNode, childIndex) => (
					<ConditionNode
						key={`${childNode.key}-${childIndex}`}
						node={childNode}
						filterState={filterState}
						onFilterChange={onFilterChange}
						depth={depth + 1}
						parentNode={{ path: nodeId, label, operator: nodeWithId.condition[0], key: nodeWithId.key }}
						index={childIndex}
					/>
				))}
			</Stack>
		);
	}

	// Nếu không phải $and hoặc $or, render component dựa trên type
	const displayLabel = nodeWithId.label || nodeWithId.key;
	const existingFilterValue = filterState.find((f) => f.nodeId === nodeId);
	const currentValue = existingFilterValue?.value;

	// Render component dựa trên type
	const renderFilterComponent = () => {
		// Default: render checkbox như cũ nếu không có type
		if (!nodeWithId.component) {
			return (
				<ConditionCheckbox
					nodeId={nodeId}
					nodeWithId={nodeWithId}
					operatorValue={conditionValue}
					parentKey={parentKey}
					existingFilterValue={existingFilterValue}
					onFilterChange={onFilterChange}
				/>
			);
		}

		// Range: range slider
		const filterComponent = nodeWithId.component;
		if (filterComponent?.type === 'range_number') {
			return (
				<ConditionRangeSlider
					nodeId={nodeId}
					displayLabel={displayLabel}
					filterComponent={filterComponent}
					currentValue={currentValue}
					onFilterChange={onFilterChange}
				/>
			);
		}

		return null;
	};

	return (
		<Box pl={depth > 0 ? 'md' : 0}>
			{renderFilterComponent()}
		</Box>
	);
};


/**
 * Component hiển thị cây filter từ filter list
 * Nhận vào filter list và trả về list ConditionNode
 */
export const ConditionTreeView: React.FC<ConditionTreeViewProps> = ({
	filterConfig,
	filterState,
	onFilterChange,
}) => {
	return (
		<Stack gap='xs'>
			<ConditionNode
				node={filterConfig}
				filterState={filterState}
				onFilterChange={onFilterChange}
				parentNode={undefined}
				index={undefined}
			/>
		</Stack>
	);
};
