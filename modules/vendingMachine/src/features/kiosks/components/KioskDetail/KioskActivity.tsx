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
	Table,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskActivityLog } from '../../types';



// Mock data based on user's sample
const mockLogs: KioskActivityLog[] = [
	{
		id: '1',
		timestamp: '2026-02-05T10:14:00',
		type: 'warning',
		content: 'REDIS :: REDIS_PING_TIMEOUT_5000ms',
	},
	{
		id: '2',
		timestamp: '2026-02-05T07:53:00',
		type: 'warning',
		content: 'OUTPUT_DOOR :: Cửa bị mở trong tiến trình mua hàng',
	},
	{
		id: '3',
		timestamp: '2026-02-04T17:25:00',
		type: 'warning',
		content: 'OUTPUT_DOOR :: Cửa bị mở trong tiến trình mua hàng',
	},
	{
		id: '4',
		timestamp: '2026-01-16T14:35:00',
		type: 'warning',
		content: JSON.stringify({
			code: 'FAILED',
			message: 'NO SUCCESSFUL ITEM',
			data: {
				sessionState: {
					currentState: 'IN_PROGESS',
					currentJob: 'RETURN_HOME',
				},
			},
		}, null, 2),
	},
	{
		id: '5',
		timestamp: '2026-01-15T12:41:00',
		type: 'warning',
		content: 'RED_WARNING :: Số lượng sản phẩm tồn trên máng đạt tối đa',
	},
];

export const KioskActivity: React.FC = () => {
	const { t: translate } = useTranslation();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [selectedLog, setSelectedLog] = useState<KioskActivityLog | null>(null);
	const [detailModalOpened, setDetailModalOpened] = useState(false);

	const filteredLogs = useMemo(() => {
		let filtered = [...mockLogs];

		// Filter by type
		if (selectedType) {
			filtered = filtered.filter(log => log.type === selectedType);
		}

		// Filter by date range
		if (startDate) {
			filtered = filtered.filter(log => {
				const logDate = new Date(log.timestamp);
				return logDate >= startDate;
			});
		}
		if (endDate) {
			filtered = filtered.filter(log => {
				const logDate = new Date(log.timestamp);
				logDate.setHours(23, 59, 59, 999);
				return logDate <= endDate;
			});
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(log =>
				log.content.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [mockLogs, selectedType, startDate, endDate, searchQuery]);

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

	const handleViewDetail = (log: KioskActivityLog) => {
		setSelectedLog(log);
		setDetailModalOpened(true);
	};

	return (
		<Stack gap='md'>
			{/* Filters */}
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
				<DatePickerInput
					placeholder={translate('nikki.vendingMachine.kiosk.activity.filter.startDate')}
					value={startDate}
					onChange={(value) => setStartDate(value ? new Date(value) : null)}
					clearable
				/>
				<DatePickerInput
					placeholder={translate('nikki.vendingMachine.kiosk.activity.filter.endDate')}
					value={endDate}
					onChange={(value) => setEndDate(value ? new Date(value) : null)}
					clearable
				/>
			</Group>

			{/* Table */}
			<ScrollArea>
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.activity.fields.time')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.activity.fields.type')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.kiosk.activity.fields.content')}</Table.Th>
							<Table.Th>{translate('nikki.general.actions.title')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{filteredLogs.length === 0 ? (
							<Table.Tr>
								<Table.Td colSpan={4} style={{ textAlign: 'center' }}>
									<Text c='dimmed'>{translate('nikki.vendingMachine.kiosk.activity.noLogs')}</Text>
								</Table.Td>
							</Table.Tr>
						) : (
							filteredLogs.map((log) => (
								<Table.Tr key={log.id}>
									<Table.Td>
										<Text size='sm'>{formatTimestamp(log.timestamp)}</Text>
									</Table.Td>
									<Table.Td>
										{getTypeBadge(log.type)}
									</Table.Td>
									<Table.Td>
										<Text size='sm' lineClamp={2}>
											{log.content}
										</Text>
									</Table.Td>
									<Table.Td>
										<Button
											size='xs'
											variant='subtle'
											onClick={() => handleViewDetail(log)}
										>
											{translate('nikki.general.actions.view')}
										</Button>
									</Table.Td>
								</Table.Tr>
							))
						)}
					</Table.Tbody>
				</Table>
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
							<Text size='sm' fw={500}>{formatTimestamp(selectedLog.timestamp)}</Text>
						</div>
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.kiosk.activity.fields.type')}
							</Text>
							{getTypeBadge(selectedLog.type)}
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
									value={formatJsonContent(selectedLog.content)}
									readOnly
									styles={{
										input: {
											fontFamily: isJsonString(selectedLog.content) ? 'monospace' : 'inherit',
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
