/* eslint-disable max-lines-per-function */
import {
	Badge,
	Button,
	Group,
	Modal,
	ScrollArea,
	Select,
	Space,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { AutoTable } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskActions, selectKioskLogs, selectKioskLogsPagination, VendingMachineDispatch } from '@/appState';
import { buildSimpleSearchGraph, SimpleFilter } from '@/components/ControlPanel/buildSimpleSearchGraph';
import { SearchGraph } from '@/components/FilterGroup';

import { KioskLog } from '../../types';


const kioskActivityLogSchema: ModelSchema = {
	name: 'kioskActivityLog',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		createdAt: { type: 'string', label: 'nikki.vendingMachine.kiosk.activity.fields.time' },
		eventType: { type: 'string', label: 'nikki.vendingMachine.kiosk.activity.fields.type' },
		payload: { type: 'string', label: 'nikki.vendingMachine.kiosk.activity.fields.content' },
		actions: { type: 'string', label: 'nikki.general.actions.title' },
	},
};


const useKioskActivity = ({page, size, graph}: {page: number, size: number, graph: SearchGraph}) => {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const kioskLogs = useMicroAppSelector(selectKioskLogs);
	const kioskLogsPagination = useMicroAppSelector(selectKioskLogsPagination);

	useEffect(() => {
		dispatch(kioskActions.searchKioskLogs({
			page,
			size,
			graph,
		}));
	}, [dispatch, page, size, graph]);

	return { kioskLogs, kioskLogsPagination };
};

export const KioskActivity: React.FC = () => {
	const { t: translate } = useTranslation();
	const [selectedLog, setSelectedLog] = useState<KioskLog | null>(null);
	const [detailModalOpened, setDetailModalOpened] = useState(false);

	const presets = useMemo(() => [
		{ value: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'), label: 'Yesterday' },
		{ value: dayjs().format('YYYY-MM-DD HH:mm:ss'), label: 'Today' },
		{ value: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'), label: 'Tomorrow' },
		{ value: dayjs().add(1, 'month').format('YYYY-MM-DD HH:mm:ss'), label: 'Next month' },
		{ value: dayjs().add(1, 'year').format('YYYY-MM-DD HH:mm:ss'), label: 'Next year' },
		{
			value: dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
			label: 'Last month',
		},
		{ value: dayjs().subtract(1, 'year').format('YYYY-MM-DD HH:mm:ss'), label: 'Last year' },
	], []);


	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);

	const graph = useMemo(() => {
		const filters: SimpleFilter[] = [];
		if (searchQuery) {
			filters.push({
				key: 'search',
				type: 'search',
				value: searchQuery,
				searchFields: ['message', 'eventType'],
			});
		}
		if (selectedType) {
			filters.push({
				key: 'eventType',
				type: 'select',
				value: [selectedType],
			});
		}
		if (startDate) {
			filters.push({
				key: 'createdAt',
				type: 'date',
				value: [startDate, null],
			});
		}
		if (endDate) {
			filters.push({
				key: 'createdAt',
				type: 'date',
				value: [null, endDate],
			});
		}

		return buildSimpleSearchGraph(filters);
	}, [selectedType, startDate, endDate, searchQuery]);

	const { kioskLogs, kioskLogsPagination: _kioskLogsPagination } = useKioskActivity({
		page: 0,
		size: 10,
		graph,
	});

	const getTypeBadge = (type: string) => {
		const typeMap: Record<string, { color: string; label: string }> = {
			warning: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.activity.type.warning') },
			statusDetail: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.activity.type.statusDetail') },
			error: { color: 'red', label: translate('nikki.vendingMachine.kiosk.activity.type.error') },
			info: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.activity.type.info') },
		};
		const typeInfo = typeMap[type] || { color: 'gray', label: type };
		return <Badge color={typeInfo.color}>{typeInfo.label}</Badge>;
	};

	const formatTimestamp = (timestamp: string): string => {
		const date = new Date(timestamp);
		return date.toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const isJsonString = (str: string): boolean => {
		try {
			JSON.parse(str);
			return true;
		}
		catch {
			return false;
		}
	};

	const formatJsonContent = (content: string): string => {
		if (isJsonString(content)) {
			try {
				const parsed = JSON.parse(content);
				return JSON.stringify(parsed, null, 2);
			}
			catch {
				return content;
			}
		}
		return content;
	};

	const handleViewDetail = useCallback((log: KioskLog) => {
		setSelectedLog(log);
		setDetailModalOpened(true);
	}, []);

	const activityTableData = useMemo(
		() => kioskLogs.data.map((log: KioskLog) => ({
			...log,
			actions: '',
		})) as Record<string, unknown>[],
		[kioskLogs.data],
	);

	const activityColumnRenderers = useMemo(
		() => ({
			createdAt: (row: Record<string, unknown>) => (
				<Text size='sm'>{formatTimestamp(String(row.createdAt))}</Text>
			),
			eventType: (row: Record<string, unknown>) => getTypeBadge(String(row.eventType)),
			payload: (row: Record<string, unknown>) => (
				<Text size='sm' lineClamp={2}>
					{row.payload != null ? JSON.stringify(row.payload, null, 2) : ''}
				</Text>
			),
			actions: (row: Record<string, unknown>) => (
				<Button
					size='xs'
					variant='subtle'
					onClick={() => handleViewDetail(row as unknown as KioskLog)}
				>
					{translate('nikki.general.actions.view')}
				</Button>
			),
		}),
		[translate, handleViewDetail],
	);

	return (
		<Stack gap='md'>
			<Group gap='md' align='flex-end'>
				<TextInput
					placeholder={translate('nikki.vendingMachine.kiosk.activity.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					style={{ flex: 1 }}
				/>
				<Select
					placeholder={translate('nikki.vendingMachine.kiosk.activity.filter.type')}
					value={selectedType}
					onChange={setSelectedType}
					data={[
						{ value: 'warning', label: translate('nikki.vendingMachine.kiosk.activity.type.warning') },
						{ value: 'statusDetail', label: translate('nikki.vendingMachine.kiosk.activity.type.statusDetail') },
						{ value: 'error', label: translate('nikki.vendingMachine.kiosk.activity.type.error') },
						{ value: 'info', label: translate('nikki.vendingMachine.kiosk.activity.type.info') },
					]}
					clearable
				/>
				<DateTimePicker
					w={200}
					placeholder={translate('nikki.vendingMachine.kiosk.activity.filter.startDate')}
					value={startDate}
					onChange={(value) => setStartDate(value ? new Date(value) : null)}
					clearable
					presets={presets}
				/>
				<DateTimePicker
					w={200}
					placeholder={translate('nikki.vendingMachine.kiosk.activity.filter.endDate')}
					value={endDate}
					onChange={(value) => setEndDate(value ? new Date(value) : null)}
					clearable
					presets={presets}
				/>
			</Group>

			<ScrollArea>
				{kioskLogs.data.length === 0 && kioskLogs.status !== 'pending' ? (
					<Text c='dimmed' ta='center' py='md'>
						{translate('nikki.vendingMachine.kiosk.activity.noLogs')}
					</Text>
				) : (
					<AutoTable
						columnSizes={{
							createdAt: { width: 250 },
							eventType: { width: 250 },
							payload: { flex: 1, minWidth: 300 },
							actions: { width: 160 },
						}}
						columns={['createdAt', 'eventType', 'payload', 'actions']}
						data={activityTableData}
						schema={kioskActivityLogSchema}
						columnRenderers={activityColumnRenderers}
						isLoading={kioskLogs.status === 'pending'}
					/>
				)}
			</ScrollArea>

			{/* Detail Modal */}
			<Modal
				opened={detailModalOpened}
				onClose={() => {
					setDetailModalOpened(false);
					setSelectedLog(null);
				}}
				title={translate('nikki.vendingMachine.kiosk.activity.detail.title')}
				size='xl'
			>
				{selectedLog && (
					<Stack gap='md'>
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kiosk.activity.fields.time')}
							</Text>
							<Text size='sm' fw={500}>{formatTimestamp(selectedLog.createdAt)}</Text>
						</div>
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kiosk.activity.fields.type')}
							</Text>
							{getTypeBadge(selectedLog.eventType)}
						</div>
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kiosk.activity.fields.content')}
							</Text>
							<ScrollArea
								h={400}
								type='scroll'
								scrollbarSize={12}
								styles={{
									scrollbar: {
										'&:hover': {
											backgroundColor: 'var(--mantine-color-gray-2)',
										},
									},
									thumb: {
										backgroundColor: 'var(--mantine-color-gray-4)',
										'&:hover': {
											backgroundColor: 'var(--mantine-color-gray-5)',
										},
										minHeight: 50,
									},
								}}
							>
								<Textarea
									value={formatJsonContent(selectedLog.payload ? JSON.stringify(selectedLog.payload, null, 2) : '')}
									readOnly
									styles={{
										input: {
											fontFamily: isJsonString(selectedLog.payload ? JSON.stringify(selectedLog.payload, null, 2) : '') ? 'monospace' : 'inherit',
											fontSize: '12px',
											minHeight: 400,
										},
									}}
								/>
							</ScrollArea>
							<Space h='md' />
						</div>
					</Stack>
				)}
			</Modal>
		</Stack>
	);
};
