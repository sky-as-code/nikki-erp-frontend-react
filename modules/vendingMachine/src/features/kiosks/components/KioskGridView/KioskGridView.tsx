/* eslint-disable max-lines-per-function */
import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { TablePaginationProps } from '@nikkierp/ui/components';
import { IconMapPin, IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { KioskConnectionStatus } from '@/components/KioskConnectionStatus';
import { KioskModeStatusBadge } from '@/components/KioskModeStatusBadge';
import { KioskWarning } from '@/components/KioskWarning';
import { TableAction } from '@/components/Table';

import { Kiosk, ConnectionStatus } from '../../types';
import { getKioskTableActions, KioskTableActions } from '../KioskTable';


export interface KioskGridViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	actions?: KioskTableActions;
	pagination?: TablePaginationProps;
}

export const KioskGridView: React.FC<KioskGridViewProps> = ({ kiosks, isLoading = false, actions = {}}) => {
	const { t: translate } = useTranslation();
	const { view: onPreview, ...cardActions } = actions;

	const getWarningSeverity = (kiosk: Kiosk): 'low' | 'medium' | 'high' | 'critical' | null => {
		const hasWarnings = kiosk.warnings && kiosk.warnings.length > 0;
		const isDisconnected = !kiosk.isArchived
			&& kiosk.connections?.some((connection) => connection.status === ConnectionStatus.DISCONNECTED);

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

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (kiosks.length === 0) {
		return <Text c='dimmed'>{translate('nikki.vendingMachine.kiosk.messages.no_kiosks')}</Text>;
	}

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
						onClick={() => onPreview?.(kiosk)}
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
								<TableAction
									actions={getKioskTableActions( kiosk, cardActions ?? {}, translate)}
									overflowMenuLabel={translate('nikki.general.actions.title')}
								/>
							</Group>

							<Group gap='xs'>
								<IconMapPin size={14} />
								<Text size='xs' c='dimmed' lineClamp={2} style={{ flex: 1 }}>
									{kiosk.locationAddress || translate('nikki.general.messages.no_address')}
								</Text>
							</Group>

							<Group gap='xs' wrap='nowrap'>
								<ArchivedStatusBadge isArchived={!!kiosk.isArchived} />
								<KioskModeStatusBadge mode={kiosk.mode} />
								<KioskWarning warnings={kiosk.warnings ?? []} />
								<KioskConnectionStatus connections={kiosk.connections} />
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

