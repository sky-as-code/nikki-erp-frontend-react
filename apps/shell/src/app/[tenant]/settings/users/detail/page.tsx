'use client';

import DetailPage from '@app/[tenant]/DetailPage';
import {
	Button, ButtonProps, Group, MantineStyleProps, NativeSelect, Popover, Stack, Text,
} from '@mantine/core';
import {
	IconChevronLeft, IconChevronLeftPipe, IconChevronRight, IconChevronRightPipe,
	IconFilter, IconLayoutDashboard, IconList, IconRefresh, IconStar, IconSettings,
	IconDots,
	IconBriefcase,
	IconDeviceFloppy,
	IconFolders,
} from '@tabler/icons-react';
import clsx from 'classnames';
import React, { DOMAttributes, useEffect } from 'react';

import { PageLayout } from '../../../PageLayout';

import { useUIState } from '@/common/context/UIProviders';


export const UserDetailPage: React.FC = () => {
	return (
		<DetailPage
			component={UserDetailInner}
		/>
	);
};

export default UserDetailPage;


// type UserDetailPageProps = {
// 	id?: string,
// 	isSplit?: boolean,
// };

const UserDetailInner: React.FC<{
	id?: string,
	isSplit?: boolean,
}> = React.memo(({ id, isSplit }) => {
	const { backgroundColor } = useUIState();
	return (
		<PageLayout
			isSplitBig={isSplit}
			toolbar={<ContentHeader
				backgroundColor={backgroundColor}
				id={id}
			/>}
		>
			User detail
		</PageLayout>
	);
});

type ContentHeaderProps = {
	backgroundColor: MantineStyleProps['bg'];
	id?: string,
};

const ContentHeader: React.FC<ContentHeaderProps> = ({ backgroundColor, id }) => {

	return (
		<>
			<Group gap='xs' justify='flex-start' mt='xs' bg={backgroundColor}>
				<Text component='span' fw='normal' fz='md' c='gray'>User</Text>
				<Text component='span' fw='bold' fz='h3'>{id ? id : 'Rein Chau'}</Text>
				<IconStar />
			</Group>
			<Group gap='xs' justify='space-between' mt='xs' mb='xs' bg={backgroundColor}>
				<Group gap='xs' justify='flex-start'>
					<ToolbarButton leftSection={<IconDeviceFloppy />}>Save</ToolbarButton>
					<ToolbarButton leftSection={<IconFolders />}>Clone</ToolbarButton>
					<ToolbarButton
						onClick={ctxVal.refetch}
						leftSection={
							<IconRefresh
								className={clsx(
									'transition-transform',
									{'animate-spin': ctxVal.isFetching},
								)}
							/>
						}
						disabled={ctxVal.isFetching}
					>
						Refresh
					</ToolbarButton>
					<ToolbarButton leftSection={<IconBriefcase />}>Archive</ToolbarButton>
					<ToolbarButton><IconDots /></ToolbarButton>
				</Group>
				<Group gap='xs' justify='flex-end'>
					<TableActions ctxVal={ctxVal} />
				</Group>
			</Group>
		</>
	);
};

type ToolbarButtonProps = ButtonProps & DOMAttributes<HTMLButtonElement> & {
	isActive?: boolean;
};
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ children, isActive, ...rest }) => {
	return (
		<Button size='compact-md' variant={isActive ? 'filled' : 'subtle'} fw='normal' {...rest}>
			{children}
		</Button>
	);
};

const TableActions: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
	const {
		totalRows,
		pagination: {pageIndex, pageSize},
	} = ctxVal;
	const lastPage = Math.floor(totalRows / pageSize);
	const start = pageIndex * pageSize + 1;
	const end = Math.min(
		(pageIndex + 1) * pageSize,
		totalRows,
	);

	return (
		<Button.Group>
			<ToolbarButton><IconFilter /></ToolbarButton>
			<ToolbarButton
				disabled={pageIndex === 0}
				onClick={ctxVal.firstPage}
			><IconChevronLeftPipe /></ToolbarButton>
			<ToolbarButton
				disabled={pageIndex === 0}
				onClick={ctxVal.prevPage}
			><IconChevronLeft /></ToolbarButton>
			<Button.GroupSection size='compact-md' variant='subtle'>
				{start}-{end} of {ctxVal.totalRows}
			</Button.GroupSection>
			<ToolbarButton
				disabled={pageIndex === lastPage}
				onClick={ctxVal.nextPage}
			><IconChevronRight /></ToolbarButton>
			<ToolbarButton
				disabled={pageIndex === lastPage}
				onClick={ctxVal.lastPage}
			><IconChevronRightPipe /></ToolbarButton>
			<TableSettings ctxVal={ctxVal} />
		</Button.Group>
	);
};

const TableSettings: React.FC<{ ctxVal: TableContextType }> = ({ ctxVal }) => {
	return (
		<Popover position='bottom' withArrow shadow='md'>
			<Popover.Target>
				<ToolbarButton><IconSettings /></ToolbarButton>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack gap='sm'>
					<Group justify='space-between' align='center'>
						<Text size='md'>Rows per page</Text>
						<NativeSelect
							defaultValue={ctxVal.pagination.pageSize}
							onChange={(e) => ctxVal.setPagination({
								...ctxVal.pagination,
								pageSize: Number(e.target.value),
							})}
							data={['50', '100', '200', '500']}
							fz='md'
							style={{ width: '70px' }}
						/>
					</Group>
					<Group justify='space-between' align='center'>
						<Text size='md'>View mode</Text>
						<Button.Group>
							<ToolbarButton isActive><IconList /></ToolbarButton>
							<ToolbarButton><IconLayoutDashboard /></ToolbarButton>
						</Button.Group>
					</Group>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
};
