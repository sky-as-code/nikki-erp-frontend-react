import { SimpleGrid, Paper, Text, Stack, ThemeIcon, Box } from '@mantine/core'
import {
	IconCalendarEvent, IconChecklist, IconCalendar,
	IconClock, IconBook, IconUsers, IconBuildingStore, IconChartBar,
	IconLayoutDashboard, IconRefresh, IconKey, IconCalculator,
	IconFiles, IconCheckbox, IconClock24, IconChartPie, IconFirstAidKit,
	IconWorld, IconLibrary, IconHeart, IconMailShare,
	IconBrandCampaignmonitor, IconChartDots, IconFlame, IconForms,
	IconCreditCard, IconBox, IconBuildingFactory, IconCertificate,
	IconBarcode, IconTool, IconHammer, IconUserCircle, IconUserSquare,
	IconReceipt2, IconStars, IconCoins, IconSearch, IconArrowBack,
	IconClockPause, IconCircleDottedLetterN, IconSettings,
	IconDeviceImacCog,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { FC } from 'react'

import { useTenantUrl } from '@/modules/core/context/TenantUrlProvider'
import { NikkiModule } from '@/modules/core/types'


const apps: NikkiModule[] = [
	{ label: 'Discuss', slug: 'discuss' },
	{ icon: IconSettings, label: 'Settings', slug: 'settings' },
	{ icon: IconCalendarEvent, label: 'Meeting Rooms', slug: 'meeting-rooms', color: 'teal' },
	{ icon: IconChecklist, label: 'To-do', slug: 'todo', color: 'blue' },
	{ icon: IconCalendar, label: 'Calendar', slug: 'calendar', color: 'orange' },
	{ icon: IconClock, label: 'Appointments', slug: 'appointments', color: 'teal' },
	{ icon: IconLibrary, label: 'Knowledge', slug: 'knowledge', color: 'teal' },
	{ icon: IconUsers, label: 'Contacts', slug: 'contacts', color: 'teal' },
	{ icon: IconBuildingStore, label: 'CRM', slug: 'crm', color: 'cyan' },
	{ icon: IconChartBar, label: 'Sales', slug: 'sales', color: 'red' },
	{ icon: IconLayoutDashboard, label: 'Dashboards', slug: 'dashboards', color: 'blue' },
	{ icon: IconRefresh, label: 'Subscriptions', slug: 'subscriptions', color: 'green' },
	{ icon: IconKey, label: 'Rental', slug: 'rental', color: 'violet' },
	{ icon: IconCalculator, label: 'Accounting', slug: 'accounting', color: 'orange' },
	{ icon: IconFiles, label: 'Documents', slug: 'documents', color: 'blue' },
	{ icon: IconCheckbox, label: 'Project', slug: 'project', color: 'teal' },
	{ icon: IconClock24, label: 'Timesheets', slug: 'timesheets', color: 'indigo' },
	{ icon: IconChartPie, label: 'Planning', slug: 'planning', color: 'orange' },
	{ icon: IconFirstAidKit, label: 'Helpdesk', slug: 'helpdesk', color: 'teal' },
	{ icon: IconWorld, label: 'Website', slug: 'website', color: 'cyan' },
	{ icon: IconBook, label: 'eLearning', slug: 'elearning', color: 'blue' },
	{ icon: IconHeart, label: 'Social Marketing', slug: 'social-marketing', color: 'red' },
	{ icon: IconMailShare, label: 'Marketing Automation', slug: 'marketing-automation', color: 'blue' },
	{ icon: IconBrandCampaignmonitor, label: 'Email Marketing', slug: 'email-marketing', color: 'indigo' },
	{ icon: IconChartDots, label: 'SMS Marketing', slug: 'sms-marketing', color: 'cyan' },
	{ icon: IconFlame, label: 'Events', slug: 'events', color: 'orange' },
	{ icon: IconForms, label: 'Surveys', slug: 'surveys', color: 'blue' },
	{ icon: IconCreditCard, label: 'Purchase', slug: 'purchase', color: 'teal' },
	{ icon: IconBox, label: 'Inventory', slug: 'inventory', color: 'orange' },
	{ icon: IconBuildingFactory, label: 'Manufacturing', slug: 'manufacturing', color: 'cyan' },
	{ icon: IconCertificate, label: 'Quality', slug: 'quality', color: 'violet' },
	{ icon: IconBarcode, label: 'Barcode', slug: 'barcode', color: 'grape' },
	{ icon: IconTool, label: 'Maintenance', slug: 'maintenance', color: 'blue' },
	{ icon: IconHammer, label: 'Repairs', slug: 'repairs', color: 'teal' },
	{ icon: IconUserCircle, label: 'PLM', slug: 'plm', color: 'indigo' },
	{ icon: IconUserSquare, label: 'Employees', slug: 'employees', color: 'violet' },
	{ icon: IconReceipt2, label: 'Payroll', slug: 'payroll', color: 'grape' },
	{ icon: IconStars, label: 'Appraisals', slug: 'appraisals', color: 'orange' },
	{ icon: IconCoins, label: 'Attendances', slug: 'attendances', color: 'yellow' },
	{ icon: IconSearch, label: 'Recruitment', slug: 'recruitment', color: 'teal' },
	{ icon: IconArrowBack, label: 'Referrals', slug: 'referrals', color: 'pink' },
	{ icon: IconClockPause, label: 'Time Off', slug: 'time-off', color: 'orange' },
	{ icon: IconReceipt2, label: 'Expenses', slug: 'expenses', color: 'blue' },
	{ icon: IconDeviceImacCog, label: 'Vending Machine', slug: 'vending-machine', color: 'teal' },
]

export const AppGrid: FC = () => {
	const { orgSlug: org } = useTenantUrl()

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
						component={Link}
						href={`/${org}/${app.slug}`}
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
								color={app.color ?? 'teal'}
							>
								{app.icon ? <app.icon size={50} /> : <IconCircleDottedLetterN size={50} />}
							</ThemeIcon>
							<Text size='sm' ta='center' lineClamp={1} className='break-all'>
								{app.label}
							</Text>
						</Stack>
					</Paper>
				</Box>
			))}
		</SimpleGrid>
	)
}


