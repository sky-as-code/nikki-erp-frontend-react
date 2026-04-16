import { Badge, MantineColor, StyleProp } from '@mantine/core';


interface StatusBadgeProps {
	children?: React.ReactNode;
	color?: MantineColor;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	miw?: StyleProp<React.CSSProperties['minWidth']>;
	onClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ children, color, size, miw, onClick }) => {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClick) {
			onClick();
			return;
		}
	};
	return (
		<Badge
			miw={miw ?? 60} size={size ?? 'sm'}
			color={color ?? 'var(--mantine-color-gray-3)'}
			style={{ cursor: onClick ? 'pointer' : 'default' }}
			onClick={handleClick}
		>
			{children}
		</Badge>
	);
};