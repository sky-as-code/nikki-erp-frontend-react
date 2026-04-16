import { Badge, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { KioskWarning as KioskWarningModel } from '@/features/kiosks';


const severityColors = {
	low: 'yellow',
	medium: 'orange',
	high: 'red',
	critical: 'red',
} as const;

const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };

export type KioskWarningProps = {
	warnings?: KioskWarningModel[] | null;
	/**
	 * When there are no warnings: `undefined` shows `'--'` (table cells).
	 * Pass `null` to render nothing (e.g. grid chips row).
	 */
	emptyContent?: React.ReactNode;
	/** Table column uses Stack wrapper for vertical alignment; grid often omits it. */
	wrapWithStack?: boolean;
};

export const KioskWarning: React.FC<KioskWarningProps> = ({
	warnings,
	emptyContent,
	wrapWithStack = true,
}) => {
	const { t: translate } = useTranslation();
	const list = warnings ?? [];

	if (list.length === 0) {
		return emptyContent !== undefined ? emptyContent : '--';
	}

	const warningCount = list.length;
	const highestSeverity = list.reduce((highest, warning) => {
		return severityOrder[warning.severity] > severityOrder[highest.severity] ? warning : highest;
	}, list[0]);

	const tooltipContent = (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{translate('nikki.vendingMachine.kiosk.warnings.title')} ({warningCount})
			</Text>
			{list.slice(0, 5).map((warning) => (
				<Group key={warning.id} gap='xs' align='flex-start'>
					<IconAlertTriangle
						size={16}
						color={`var(--mantine-color-${severityColors[warning.severity]}-6)`}
					/>
					<Stack gap={2}>
						<Text size='xs' fw={500}>{warning.type}</Text>
						<Text size='xs' c='dimmed'>{warning.message}</Text>
					</Stack>
				</Group>
			))}
			{list.length > 5 && (
				<Text size='xs' c='dimmed' ta='center'>
					{translate('nikki.vendingMachine.kiosk.warnings.more', { count: list.length - 5 })}
				</Text>
			)}
		</Stack>
	);

	const trigger = (
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
					size='xs' variant='filled'
					pos='absolute' top={-6} right={-8}
					h={14} w={14} p={0} fz={10}
				>
					{warningCount}
				</Badge>
			</Box>
		</Tooltip>
	);

	if (wrapWithStack) {
		return (
			<Stack align='start' justify='center'>
				{trigger}
			</Stack>
		);
	}

	return trigger;
};
