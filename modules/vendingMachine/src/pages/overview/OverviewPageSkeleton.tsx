import { Box, Group, Skeleton, Stack } from '@mantine/core';
import React from 'react';


export function OverviewPageSkeleton(): React.ReactNode {
	return (
		<Stack gap='md' pt='sm'>
			{/* Stats & Map area */}
			<Box pos='relative' h='max-content' mih={800}>
				<Box
					pos='absolute'
					top={0}
					left={0}
					right={0}
					bottom={0}
					p={3}
					display={{ base: 'none', lg: 'block' }}
				>
					<Skeleton height='100%' radius='sm' />
				</Box>
				<Stack
					gap='md'
					w={{ base: '100%', lg: '50%' }}
					miw={{ base: '100%', lg: 800 }}
					p={{ base: 0, lg: 'md' }}
				>
					<Group gap='md' wrap='wrap'>
						<Skeleton height={80} radius='md' style={{ flex: 1, minWidth: 120 }} />
						<Skeleton height={80} radius='md' style={{ flex: 1, minWidth: 120 }} />
						<Skeleton height={80} radius='md' style={{ flex: 1, minWidth: 120 }} />
					</Group>
					<Skeleton height={200} radius='md' />
					<Skeleton height={120} radius='md' />
				</Stack>
			</Box>

			{/* Chart area */}
			<Skeleton height={300} radius='md' />

			{/* Alert sections */}
			<Skeleton height={100} radius='md' />
			<Skeleton height={100} radius='md' />
			<Skeleton height={100} radius='md' />

			{/* Mobile map */}
			<Box
				display={{ base: 'block', lg: 'none' }}
				h='400px'
				w='100%'
				p='xs'
			>
				<Skeleton height='100%' radius='md' />
			</Box>

			{/* Footer */}
			<Skeleton height={100} radius='md' />
		</Stack>
	);
}
