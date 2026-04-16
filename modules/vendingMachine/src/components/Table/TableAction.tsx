import { ActionIcon, Group, Menu, Tooltip, type ActionIconProps } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import React from 'react';


export type TableActionItem = {
	key: string;
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
	color?: ActionIconProps['color'];
};

export type TableActionProps = {
	actions: TableActionItem[];
	/** Tooltip and aria-label for the overflow menu trigger (shown when there is more than one action). */
	overflowMenuLabel?: string;
};

export const TableAction: React.FC<TableActionProps> = ({
	actions,
	overflowMenuLabel = 'More actions',
}) => {
	if (actions.length === 0) return null;
	if (actions.length <= 2) {
		return (
			<Group gap={4} justify='flex-end' onClick={(e) => e.stopPropagation()}>
				{actions.map((action) => (
					<Tooltip label={action.label}>
						<ActionIcon variant='subtle' color={action.color} onClick={action.onClick}>
							{action.icon}
						</ActionIcon>
					</Tooltip>
				))}
			</Group>
		);
	}

	const [first, ...rest] = actions;
	return (
		<Group gap={4} justify='flex-end' wrap='nowrap' onClick={(e) => e.stopPropagation()}>
			<Tooltip label={first.label}>
				<ActionIcon variant='subtle' color={first.color} onClick={first.onClick}>
					{first.icon}
				</ActionIcon>
			</Tooltip>
			<Menu position='bottom-end' withinPortal trigger='click'>
				<Menu.Target>
					<Tooltip label={overflowMenuLabel}>
						<ActionIcon aria-label={overflowMenuLabel} variant='subtle'>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Tooltip>
				</Menu.Target>
				<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
					{rest.map((action) => (
						<Menu.Item
							key={action.key}
							leftSection={action.icon}
							color={action.color}
							onClick={action.onClick}
						>
							{action.label}
						</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
};
