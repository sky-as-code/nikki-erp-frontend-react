import { Button, ButtonProps, Group } from '@mantine/core';
import React, { ButtonHTMLAttributes } from 'react';




export interface ControlPanelActionProps {
	actions?: (ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps & { label: string } | null)[];
}

export const ControlPanelAction: React.FC<ControlPanelActionProps> = ({ actions = [] }) => {
	return (
		<Group gap='sm' wrap='wrap' align='flex-end'>
			{actions.map((action, index) => (
				action && (
					<Button key={index}
						fz='sm' fw={500} size='sm'
						{...action}
					>
						{action.label}
					</Button>
				)
			))}
		</Group>
	);
};
