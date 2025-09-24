'use client';

import {
	Button, ButtonProps, CloseButton, Group, Text,
} from '@mantine/core';
import {
	IconBriefcase,
	IconDeviceFloppy, IconDots, IconFolders, IconRefresh, IconStar,
} from '@tabler/icons-react';
import clsx from 'clsx';
// import { usePathname, useRouter } from 'next/navigation';
import { DOMAttributes, useEffect, useState } from 'react';

import { useModuleLayout } from './ModuleLayout';
import { PageLayout } from './PageLayout';

import { useTenantUrl } from '@/common/context/TenantUrlProvider';
import { useRouter, useRouterState } from '@tanstack/react-router';



export type DetailPageProps = {
	component: React.FC<DetailComponentProps>,
	pageSlug: string,
};

export type DetailComponentProps = {
	id: string,
	isSplit: boolean,
};

export const DetailPage: React.FC<DetailPageProps> = ({ component: Component, ...props }) => {
	const { getModulePath } = useTenantUrl();
	const router = useRouter();
	const routerState = useRouterState();
	const pathName = routerState.location.pathname;
	
	// const pathName = usePathname();
	const [id, setId] = useState('');
	const listingPath = `${getModulePath()}/${props.pageSlug}/`;
	const split = useModuleLayout();

	useEffect(() => {
		if (!split.is0_10 && !split.is1_9 && !split.is3_7) {
			split.setSplitMode('0_10');
		}
	}, []);
	useEffect(() => {
		const id = pathName.replace(listingPath, '');
		setId(id);
	}, [pathName]);

	if (!id) return null;

	const onCloseSplit = () => {
		router.navigate({
			to: listingPath,
		});
	};
	return (
		<PageLayout
			isSplitBig={split.is3_7 || split.is1_9}
			toolbar={<ContentHeader
				id={id}
				isSplit={split.is3_7 || split.is1_9}
				onCloseSplit={onCloseSplit}
			/>}
		>
			<Component
				id={id}
				isSplit={true}
			/>
		</PageLayout>
	);
};

export default DetailPage;


type ContentHeaderProps = {
	id?: string,
	isSplit: boolean,
	onCloseSplit: () => void,
};

const ContentHeader: React.FC<ContentHeaderProps> = ({ id, ...props }) => {

	return (
		<>
			<Group gap={0} justify='space-between' mt='xs'>
				<Group gap='xs' justify='flex-start'>
					<Text component='span' fw='normal' fz='md' c='gray'>User</Text>
					<Text component='span' fw='bold' fz='h3'>{id ? id : 'Rein Chau'}</Text>
					<IconStar />
				</Group>
				{props.isSplit && <CloseButton
					size='lg'
					onClick={props.onCloseSplit}
				/>}
			</Group>
			<Group gap='xs' justify='space-between' mt='xs' mb='xs'>
				<Group gap='xs' justify='flex-start'>
					<ToolbarButton leftSection={<IconDeviceFloppy />}>Save</ToolbarButton>
					<ToolbarButton leftSection={<IconFolders />}>Clone</ToolbarButton>
					<ToolbarButton
						onClick={() => {}}
						leftSection={
							<IconRefresh
								className={clsx(
									'transition-transform',
									{'animate-spin': false},
								)}
							/>
						}
						disabled={false}
					>
						Refresh
					</ToolbarButton>
					<ToolbarButton leftSection={<IconBriefcase />}>Archive</ToolbarButton>
					<ToolbarButton><IconDots /></ToolbarButton>
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
