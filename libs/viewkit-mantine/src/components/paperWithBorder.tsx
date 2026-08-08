import { Paper } from '@mantine/core';
import React from 'react';


/**
 * The bordered card every block in this kit sits on. Shared by the generic
 * `collapsible_section` and by the resource form's own sections, so it lives here rather
 * than in any one of them.
 */
export function PaperWithBorder({ children, props }: { children: React.ReactNode, props: any }): React.ReactNode {
	return (
		<Paper withBorder className='p-4' {...props}>
			{children}
		</Paper>
	);
}
