import { Box } from '@mantine/core';
import clsx from 'clsx';
import { useRef, useState } from 'react';


import classes from './ContentContainer.module.css';


export function ContentContainer({ children }: { children: React.ReactNode }) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isHoveringScrollbar, setIsHoveringScrollbar] = useState(false);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!contentRef.current) return;

		const rect = contentRef.current.getBoundingClientRect();
		const scrollbarWidth = 10; // Scrollbar width
		const threshold = scrollbarWidth + 3; // Add tolerance for easier hover

		// Check if mouse is near the right edge (where scrollbar is)
		const isNearRightEdge = e.clientX >= rect.right - threshold;

		setIsHoveringScrollbar(isNearRightEdge);
	};

	const handleMouseLeave = () => {
		setIsHoveringScrollbar(false);
	};


	return (
		<Box
			ref={contentRef}
			className={clsx(
				classes.contentContainer,
				isHoveringScrollbar && classes.scrollbarHovered,
			)}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{children}
		</Box>
	);
}

