import { Badge, Button, Group, Modal, ScrollArea, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconDeviceDesktop, IconMapPin, IconSearch } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useKioskList } from '@/features/kiosks/hooks';
import { Kiosk, KioskMode, KioskStatus } from '@/features/kiosks/types';


export interface KioskSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectKiosks: (kiosks: Kiosk[]) => void;
	selectedKioskIds?: string[];
}

// eslint-disable-next-line max-lines-per-function
export const KioskSelectModal: React.FC<KioskSelectModalProps> = ({
	opened,
	onClose,
	onSelectKiosks,
	selectedKioskIds = [],
}) => {
	const { t: translate } = useTranslation();
	const [kiosks, setKiosks] = useState<Kiosk[]>([]);
	const [selectedKiosks, setSelectedKiosks] = useState<Kiosk[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const { kiosks: searchedKiosks } = useKioskList();

	React.useEffect(() => {
		if (opened) {
			setKiosks(searchedKiosks ?? []);
		}
	}, [opened]);

	// Filter out already selected kiosks
	const availableKiosks = useMemo(() => {
		const selectedIds = new Set(selectedKioskIds);
		return kiosks.filter((k) => !selectedIds.has(k.id));
	}, [kiosks, selectedKioskIds]);

	const filteredKiosks = useMemo(() => {
		if (!searchQuery.trim()) return availableKiosks;
		const query = searchQuery.toLowerCase();
		return availableKiosks.filter(
			(kiosk) =>
				kiosk.code.toLowerCase().includes(query) ||
				kiosk.name.toLowerCase().includes(query) ||
				kiosk.locationAddress?.toLowerCase().includes(query),
		);
	}, [availableKiosks, searchQuery]);

	const getStatusBadge = (status?: KioskStatus | null) => {
		const statusMap = {
			[KioskStatus.ACTIVE]: { color: 'green', label: translate('nikki.vendingMachine.kiosk.status.activated') },
			[KioskStatus.INACTIVE]: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.status.disabled') },
			[KioskStatus.DELETED]: { color: 'red', label: translate('nikki.vendingMachine.kiosk.status.deleted') },
		};
		const statusInfo = statusMap[status ?? KioskStatus.INACTIVE];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	const getModeBadge = (mode?: KioskMode | null) => {
		const modeMap = {
			[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
			[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
			[KioskMode.SLIDESHOW_ONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.slideshowOnly') },
		};
		const modeInfo = modeMap[mode ?? KioskMode.PENDING];
		return <Badge color={modeInfo.color} size='sm' variant='filled'>{modeInfo.label}</Badge>;
	};

	const handleToggleKiosk = (kiosk: Kiosk) => {
		setSelectedKiosks((prev) => {
			const exists = prev.find((k) => k.id === kiosk.id);
			if (exists) {
				return prev.filter((k) => k.id !== kiosk.id);
			}
			return [...prev, kiosk];
		});
	};

	const handleConfirm = () => {
		onSelectKiosks(selectedKiosks);
		setSelectedKiosks([]);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedKiosks([]);
		setSearchQuery('');
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('nikki.vendingMachine.events.selectKiosks.title')}
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('nikki.vendingMachine.events.selectKiosks.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Selected Count */}
				{selectedKiosks.length > 0 && (
					<Text size='sm' c='blue' fw={500}>
						{translate('nikki.vendingMachine.events.selectKiosks.selectedCount', { count: selectedKiosks.length })}
					</Text>
				)}

				{/* Kiosks Table */}
				<ScrollArea h={400}>
					{filteredKiosks.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.vendingMachine.events.selectKiosks.noKiosks')}
						</Text>
					) : (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th style={{ width: 50 }}></Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.code')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.name')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.address')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.status')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.kiosk.fields.mode')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{filteredKiosks.map((kiosk) => {
									const isSelected = selectedKiosks.some((k) => k.id === kiosk.id);
									return (
										<Table.Tr
											key={kiosk.id}
											style={{
												cursor: 'pointer',
												backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
											}}
											onClick={() => handleToggleKiosk(kiosk)}
										>
											<Table.Td>
												<input
													type='checkbox'
													checked={isSelected}
													onChange={() => handleToggleKiosk(kiosk)}
													onClick={(e) => e.stopPropagation()}
												/>
											</Table.Td>
											<Table.Td>
												<Text size='sm' fw={500}>{kiosk.code}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<IconDeviceDesktop size={16} />
													<Text size='sm'>{kiosk.name}</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<IconMapPin size={14} />
													<Text size='sm' lineClamp={1} style={{ maxWidth: 200 }}>
														{kiosk.locationAddress}
													</Text>
												</Group>
											</Table.Td>
											<Table.Td>{getStatusBadge(kiosk.status)}</Table.Td>
											<Table.Td>{getModeBadge(kiosk.mode)}</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					)}
				</ScrollArea>

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedKiosks.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
