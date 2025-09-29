import { IconHierarchy2, IconShieldCog, IconUserCog, IconWorldCog } from '@tabler/icons-react'

import type { NavItem } from '@/common/types/navItem'


export default <NavItem[]>[{
	label: 'Organizations',
	icon: IconHierarchy2,
	items: [
		{
			label: 'Organizations',
			link: '/organizations',
		},
		{
			label: 'Hierarchy',
			link: '/hierarchy',
		},
	],
},
{
	label: 'Users',
	icon: IconUserCog,
	items: [
		{
			label: 'User List',
			items: [
				{
					label: 'View List',
					link: '/users',
				},
				{
					specialFeture: '$$recent$$',
					specialFetureOpts: 'recentUsers',
				},
			],
		},
		{
			label: 'User Groups',
			link: '/groups',
		},
	],
},
{
	label: 'Permissions',
	icon: IconShieldCog,
	items: [
		{
			label: 'Roles',
			link: '/roles',
		},
	],
},
{
	label: 'System',
	icon: IconWorldCog,
	link: '/system',
}]
