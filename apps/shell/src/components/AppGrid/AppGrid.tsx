import { SimpleGrid, Paper, Text, Stack, ThemeIcon, Box } from '@mantine/core';
import {
	IconMessages, IconCalendarEvent, IconChecklist, IconCalendar,
	IconClock, IconBook, IconUsers, IconBuildingStore, IconChartBar,
	IconLayoutDashboard, IconRefresh, IconKey, IconCalculator,
	IconFiles, IconCheckbox, IconClock24, IconChartPie, IconFirstAidKit,
	IconWorld, IconLibrary, IconHeart, IconMailShare,
	IconBrandCampaignmonitor, IconChartDots, IconFlame, IconForms,
	IconCreditCard, IconBox, IconBuildingFactory, IconCertificate,
	IconBarcode, IconTool, IconHammer, IconUserCircle, IconUserSquare,
	IconReceipt2, IconStars, IconCoins, IconSearch, IconArrowBack,
	IconClockPause,
} from '@tabler/icons-react';
import { FC } from 'react';

interface AppItem {
	icon: typeof IconMessages;
	label: string;
	color: string;
}

const apps: AppItem[] = [
	{ icon: IconMessages, label: 'Discuss', color: 'orange' },
	{ icon: IconCalendarEvent, label: 'Meeting Rooms', color: 'teal' },
	{ icon: IconChecklist, label: 'To-do', color: 'blue' },
	{ icon: IconCalendar, label: 'Calendar', color: 'orange' },
	{ icon: IconClock, label: 'Appointments', color: 'teal' },
	{ icon: IconLibrary, label: 'Knowledge', color: 'teal' },
	{ icon: IconUsers, label: 'Contacts', color: 'teal' },
	{ icon: IconBuildingStore, label: 'CRM', color: 'cyan' },
	{ icon: IconChartBar, label: 'Sales', color: 'red' },
	{ icon: IconLayoutDashboard, label: 'Dashboards', color: 'blue' },
	{ icon: IconRefresh, label: 'Subscriptions', color: 'green' },
	{ icon: IconKey, label: 'Rental', color: 'violet' },
	{ icon: IconCalculator, label: 'Accounting', color: 'orange' },
	{ icon: IconFiles, label: 'Documents', color: 'blue' },
	{ icon: IconCheckbox, label: 'Project', color: 'teal' },
	{ icon: IconClock24, label: 'Timesheets', color: 'indigo' },
	{ icon: IconChartPie, label: 'Planning', color: 'orange' },
	{ icon: IconFirstAidKit, label: 'Helpdesk', color: 'teal' },
	{ icon: IconWorld, label: 'Website', color: 'cyan' },
	{ icon: IconBook, label: 'eLearning', color: 'blue' },
	{ icon: IconHeart, label: 'Social Marketing', color: 'red' },
	{ icon: IconMailShare, label: 'Marketing Automation', color: 'blue' },
	{ icon: IconBrandCampaignmonitor, label: 'Email Marketing', color: 'indigo' },
	{ icon: IconChartDots, label: 'SMS Marketing', color: 'cyan' },
	{ icon: IconFlame, label: 'Events', color: 'orange' },
	{ icon: IconForms, label: 'Surveys', color: 'blue' },
	{ icon: IconCreditCard, label: 'Purchase', color: 'teal' },
	{ icon: IconBox, label: 'Inventory', color: 'orange' },
	{ icon: IconBuildingFactory, label: 'Manufacturing', color: 'cyan' },
	{ icon: IconCertificate, label: 'Quality', color: 'violet' },
	{ icon: IconBarcode, label: 'Barcode', color: 'grape' },
	{ icon: IconTool, label: 'Maintenance', color: 'blue' },
	{ icon: IconHammer, label: 'Repairs', color: 'teal' },
	{ icon: IconUserCircle, label: 'PLM', color: 'indigo' },
	{ icon: IconUserSquare, label: 'Employees', color: 'violet' },
	{ icon: IconReceipt2, label: 'Payroll', color: 'grape' },
	{ icon: IconStars, label: 'Appraisals', color: 'orange' },
	{ icon: IconCoins, label: 'Attendances', color: 'yellow' },
	{ icon: IconSearch, label: 'Recruitment', color: 'teal' },
	{ icon: IconArrowBack, label: 'Referrals', color: 'pink' },
	{ icon: IconClockPause, label: 'Time Off', color: 'orange' },
	{ icon: IconReceipt2, label: 'Expenses', color: 'blue' },
];

export const AppGrid: FC = () => {
	return (
		<SimpleGrid
			cols={{ base: 2, sm: 4, md: 6 }}
			spacing={{ base: 'xl', sm: 40 }}
			verticalSpacing={{ base: 'xl', sm: 40 }}
		>
			{apps.map((app, index) => (
				<Box
					key={index}
					className='min-w-[100px]'
				>
					<Paper
						p='md'
						radius='md'
						withBorder
						className='cursor-pointer h-full hover:-translate-y-[5px] transition-transform duration-200 ease-in-out'
					>
						<Stack
							align='center'
							justify='center'
							gap='sm'
							h='100%'
						>
							<ThemeIcon
								size={70}
								radius='md'
								variant='light'
								color={app.color}
							>
								<app.icon size={50} />
							</ThemeIcon>
							<Text size='sm' ta='center' lineClamp={1} className='break-all'>
								{app.label}
							</Text>
						</Stack>
					</Paper>
				</Box>
			))}
		</SimpleGrid>
	);
};







