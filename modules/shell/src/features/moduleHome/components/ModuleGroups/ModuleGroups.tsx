import { Center, Stack, Text, Title } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconAlertTriangle, IconBoxOff } from '@tabler/icons-react';
import { FC, ReactNode } from 'react';

import type { ModuleGroup } from '../../moduleHomeModel';


type ModuleGroupsProps = {
	groups: ModuleGroup[],
	renderGroup: (group: ModuleGroup) => ReactNode,
};

/** One section per group; the single "No grouping" group has no label and so no header. */
export const ModuleGroups: FC<ModuleGroupsProps> = ({ groups, renderGroup }) => {
	if (groups.length === 0) {
		return <ModuleEmptyState />;
	}
	return (
		<Stack gap='lg'>
			{groups.map((group) => (
				<Stack key={group.key} gap='xs' component='section'>
					{group.label && <Title order={5} c='dimmed'>{group.label}</Title>}
					{renderGroup(group)}
				</Stack>
			))}
		</Stack>
	);
};

const ModuleEmptyState: FC = () => {
	const translate = useTranslate('common');
	return (
		<Center h='100%' p='xl'>
			<Stack align='center' gap='md'>
				<IconBoxOff size={64} stroke={1.5} color='var(--mantine-color-dimmed)' />
				<Text c='dimmed' size='lg' fw={500}>{translate('module.empty')}</Text>
				<Text c='dimmed' size='sm' ta='center'>{translate('module.emptyHint')}</Text>
			</Stack>
		</Center>
	);
};

export const ModuleLoadErrorState: FC = () => {
	const translate = useTranslate('common');
	return (
		<Center h='100%' p='xl'>
			<Stack align='center' gap='md'>
				<IconAlertTriangle size={64} stroke={1.5} color='var(--mantine-color-error)' />
				<Text c='dimmed' size='lg' fw={500}>{translate('error.error_occurred')}</Text>
			</Stack>
		</Center>
	);
};
