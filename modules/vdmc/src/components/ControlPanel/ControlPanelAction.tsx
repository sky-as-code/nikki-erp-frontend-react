import { Button, ButtonProps, Group } from '@mantine/core';
import React, { ButtonHTMLAttributes } from 'react';




export interface ControlPanelActionProps {
	actions?: (ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps & { label: string })[];
}

export const ControlPanelAction: React.FC<ControlPanelActionProps> = ({ actions = [] }) => {
	return (
		<Group gap='md' wrap='wrap' align='flex-end'>
			{actions.map((action, index) => (
				<Button key={index}
					fz='sm' fw={500} size='sm'
					{...action}
				>
					{action.label}
				</Button>
			))}
		</Group>
	);
};
