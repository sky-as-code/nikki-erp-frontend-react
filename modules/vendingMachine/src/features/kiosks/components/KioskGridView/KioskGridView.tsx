/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip, Box } from '@mantine/core';
import { IconEdit, IconTrash, IconMapPin, IconDeviceDesktop, IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk, KioskMode, KioskStatus, KioskWarning, ConnectionStatus } from '../../types';


export interface KioskGridViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	onViewDetail: (kioskId: string) => void;
	onEdit?: (kioskId: string) => void;
	onDelete?: (kioskId: string) => void;
}

export const KioskGridView: React.FC<KioskGridViewProps> = ({
	kiosks,
	isLoading = false,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const getStatusBadge = (status: KioskStatus) => {
		const statusMap = {
			[KioskStatus.ACTIVATED]: { color: 'green', label: translate('nikki.vendingMachine.kiosk.status.activated') },
			[KioskStatus.DISABLED]: { color: 'gray', label: translate('nikki.vendingMachine.kiosk.status.disabled') },
			[KioskStatus.DELETED]: { color: 'red', label: translate('nikki.vendingMachine.kiosk.status.deleted') },
		};
		const statusInfo = statusMap[status];
		return <Badge color={statusInfo.color} size='sm'>{statusInfo.label}</Badge>;
	};

	const getModeBadge = (mode: KioskMode) => {
		const modeMap = {
			[KioskMode.PENDING]: { color: 'yellow', label: translate('nikki.vendingMachine.kiosk.mode.pending') },
			[KioskMode.SELLING]: { color: 'blue', label: translate('nikki.vendingMachine.kiosk.mode.selling') },
			[KioskMode.ADSONLY]: { color: 'purple', label: translate('nikki.vendingMachine.kiosk.mode.adsOnly') },
		};
		const modeInfo = modeMap[mode];
		return <Badge color={modeInfo.color} size='sm' variant='light'>{modeInfo.label}</Badge>;
	};

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (kiosks.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kiosk.messages.no_kiosks')}</Text>;
	}

	const getWarningIcon = (warnings: KioskWarning[] | undefined) => {
		if (!warnings || warnings.length === 0) return null;

		const warningCount = warnings.length;
		const severityColors = {
			low: 'yellow',
			medium: 'orange',
			high: 'red',
			critical: 'red',
		};

		const highestSeverity = warnings.reduce((highest, warning) => {
			const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
			return severityOrder[warning.severity] > severityOrder[highest.severity] ? warning : highest;
		}, warnings[0]);

		const tooltipContent = (
			<Stack gap='xs' style={{ maxWidth: 300 }}>
				<Text size='sm' fw={500}>
					{translate('nikki.vendingMachine.kiosk.warnings.title')} ({warningCount})
				</Text>
				{warnings.slice(0, 5).map((warning) => (
					<Group key={warning.id} gap='xs' align='flex-start'>
						<IconAlertTriangle size={16} color={`var(--mantine-color-${severityColors[warning.severity]}-6)`} />
						<Stack gap={2}>
							<Text size='xs' fw={500}>{warning.type}</Text>
							<Text size='xs' c='dimmed'>{warning.message}</Text>
						</Stack>
					</Group>
				))}
				{warnings.length > 5 && (
					<Text size='xs' c='dimmed' ta='center'>
						{translate('nikki.vendingMachine.kiosk.warnings.more', { count: warnings.length - 5 })}
					</Text>
				)}
			</Stack>
		);

		return (
			<Tooltip label={tooltipContent} withArrow position='top' multiline>
				<Box
					pos='relative'
					style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
					onClick={(e) => e.stopPropagation()}
				>
					<IconAlertTriangle
						size={22}
						color={`var(--mantine-color-${severityColors[highestSeverity.severity]}-6)`}
					/>
					<Badge
						color={severityColors[highestSeverity.severity]}
						size='xs'
						variant='filled'
						pos='absolute'
						top={-6}
						right={-10}
						h={16}
						w={16}
						p={0}
						fz={10}
					>
						{warningCount}
					</Badge>
				</Box>
			</Tooltip>
		);
	};

	const getWarningSeverity = (kiosk: Kiosk): 'low' | 'medium' | 'high' | 'critical' | null => {
		const hasWarnings = kiosk.warnings && kiosk.warnings.length > 0;
		const isDisconnected = kiosk.isActive && kiosk.connectionStatus === ConnectionStatus.DISCONNECTED;

		if (!hasWarnings && !isDisconnected) return null;

		if (hasWarnings && kiosk.warnings) {
			const highestSeverity = kiosk.warnings.reduce((highest, warning) => {
				const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
				return severityOrder[warning.severity] > severityOrder[highest.severity] ? warning : highest;
			}, kiosk.warnings[0]);
			return highestSeverity.severity;
		}

		// Disconnected is treated as medium severity
		return 'medium';
	};

	const getWarningStyle = (severity: 'low' | 'medium' | 'high' | 'critical' | null) => {
		if (!severity) return null;

		const severityStyles = {
			low: {
				borderColor: 'var(--mantine-color-yellow-3)',
				boxShadow: '0 2px 8px rgba(250, 176, 5, 0.15), 0 1px 2px rgba(0, 0, 0, 0.05)',
			},
			medium: {
				borderColor: 'var(--mantine-color-orange-3)',
				boxShadow: '0 2px 8px rgba(255, 119, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)',
			},
			high: {
				borderColor: 'var(--mantine-color-red-3)',
				boxShadow: '0 2px 8px rgba(224, 49, 49, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)',
			},
			critical: {
				borderColor: 'var(--mantine-color-red-4)',
				boxShadow: '0 3px 10px rgba(224, 49, 49, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1)',
			},
		};

		return severityStyles[severity];
	};

	return (
		<SimpleGrid
			cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
			spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
		>
			{kiosks.map((kiosk) => {
				const warningSeverity = getWarningSeverity(kiosk);
				const warningStyle = getWarningStyle(warningSeverity);
				return (
					<Card
						key={kiosk.id}
						shadow={warningSeverity ? 'md' : 'sm'}
						padding='lg'
						radius='md'
						withBorder
						style={{
							cursor: 'pointer',
							borderColor: warningStyle?.borderColor,
							borderWidth: warningSeverity ? 2 : undefined,
							boxShadow: warningStyle?.boxShadow,
						}}
						onClick={() => onViewDetail(kiosk.id)}
					>
						<Stack gap='sm'>
							<Group justify='space-between' align='flex-start'>
								<Group gap='xs'>
									<IconDeviceDesktop size={20} />
									<Stack gap={0}>
										<Text fw={600} size='sm'>{kiosk.code}</Text>
										<Text size='xs' c='dimmed'>{kiosk.name}</Text>
									</Stack>
								</Group>
								<Group gap='xs' onClick={(e) => e.stopPropagation()}>
									{onEdit && (
										<Tooltip label={translate('nikki.general.actions.edit')}>
											<ActionIcon variant='subtle' color='gray' size='sm' onClick={() => onEdit(kiosk.id)}>
												<IconEdit size={14} />
											</ActionIcon>
										</Tooltip>
									)}
									{onDelete && (
										<Tooltip label={translate('nikki.general.actions.delete')}>
											<ActionIcon variant='subtle' color='red' size='sm' onClick={() => onDelete(kiosk.id)}>
												<IconTrash size={14} />
											</ActionIcon>
										</Tooltip>
									)}
								</Group>
							</Group>

							<Group gap='xs'>
								<IconMapPin size={14} />
								<Text size='xs' c='dimmed' lineClamp={2} style={{ flex: 1 }}>
									{kiosk.address}
								</Text>
							</Group>

							<Group gap='xs' wrap='nowrap'>
								{getStatusBadge(kiosk.status)}
								{getModeBadge(kiosk.mode)}
								<Badge color={kiosk.isActive ? 'green' : 'red'} size='sm'>
									{kiosk.isActive
										? translate('nikki.general.status.active')
										: translate('nikki.general.status.inactive')}
								</Badge>
								{getWarningIcon(kiosk.warnings)}
							</Group>

							<Text size='xs' c='dimmed'>
								{translate('nikki.vendingMachine.kiosk.fields.createdAt')}: {new Date(kiosk.createdAt).toLocaleDateString()}
							</Text>
						</Stack>
					</Card>
				);
			})}
		</SimpleGrid>
	);
};

