import { Avatar, Box, Group, Stack, Tabs, Text } from '@mantine/core';
import { IconDeviceDesktop } from '@tabler/icons-react';
import React from 'react';


export type DetailLayoutProps = {
	header?: {
		title: string;
		subtitle?: string;
		avatar?: React.ReactNode;
	};
	sections?: React.ReactNode[];
	tabs?: {
		id: string;
		title: string;
		content: React.ReactNode | (() => React.ReactNode);
	}[];
	activeTab?: string;
	onTabChange?: (value: string) => void;
};

const DetailLayoutHeader: React.FC<{ header?: DetailLayoutProps['header'] }> = ({ header }) => {
	if (!header?.title) return <></>;

	return (
		<Group gap='sm' align='start' mb='xs'>
			<Box>
				<Avatar
					src={typeof header.avatar === 'string' ? header.avatar : undefined}
					size={46}
					radius='md'
				>
					{header.avatar && typeof header.avatar !== 'string'
						? header.avatar
						: <IconDeviceDesktop size={46} />
					}
				</Avatar>
			</Box>
			<Box>
				<Text fw={600} size='lg' lh={1} mb={'xs'}>{header.title}</Text>
				<Text size='sm' c='dimmed'>
					{header.subtitle}
				</Text>
			</Box>
		</Group>
	);
};

const DetailLayoutSections: React.FC<{ sections?: DetailLayoutProps['sections'] }> = ({ sections }) => {
	return (
		<>
			{
				sections?.map((section, index) => (
					<Box key={index}>
						{section}
					</Box>
				))
			}
		</>
	);
};

const DetailLayoutTabs: React.FC<{
	tabs?: DetailLayoutProps['tabs'];
	activeTab?: string;
	onTabChange?: (value: string) => void;
}> = ({ tabs, activeTab, onTabChange }) => {
	const [internalActiveTab, setInternalActiveTab] = React.useState<string>('0');
	const currentActiveTab = activeTab ?? internalActiveTab;

	const handleTabChange = (value: string | null) => {
		const newValue = value ?? '0';
		if (onTabChange) {
			onTabChange(newValue);
		}
		else {
			setInternalActiveTab(newValue);
		}
	};

	if (!tabs?.length) return <></>;

	if (tabs.length === 1) {
		const content = typeof tabs[0].content === 'function' ? tabs[0].content() : tabs[0].content;
		return (
			<Box>
				<Text fw={500} size='md' lh={1} mb={'xs'}>{tabs[0].title}</Text>
				{content}
			</Box>
		);
	}

	return (
		<Box>
			<Tabs value={currentActiveTab} onChange={handleTabChange}>
				<Tabs.List>
					{tabs.map((tab) => (
						<Tabs.Tab key={tab.id} value={tab.id}>
							{tab.title}
						</Tabs.Tab>
					))}
				</Tabs.List>

				{tabs.map((tab) => {
					// Only render content for active tab
					if (tab.id !== currentActiveTab) {
						return (
							<Tabs.Panel key={tab.id} value={tab.id} py='md'>
								{null}
							</Tabs.Panel>
						);
					}

					const content = typeof tab.content === 'function' ? tab.content() : tab.content;
					return (
						<Tabs.Panel key={tab.id} value={tab.id} py='md'>
							{content}
						</Tabs.Panel>
					);
				})}
			</Tabs>
		</Box>
	);
};


export const DetailLayout: React.FC<DetailLayoutProps> = ({ header, sections, tabs, activeTab, onTabChange }) => {
	return (
		<Stack gap='sm'>
			<DetailLayoutHeader header={header} />
			<DetailLayoutSections sections={sections} />
			<DetailLayoutTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
		</Stack>
	);
};