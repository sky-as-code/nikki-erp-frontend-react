import {
	IconHierarchy2, IconShieldCog, IconUserCog, IconWorldCog,
} from '@tabler/icons-react';

import type { NavItem } from '@/types/navItem';


export default <NavItem[]>[{
	label: 'Organizations',
	icon: IconHierarchy2,
	links: [
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
	links: [
		{
			label: 'Users',
			link: '/users',
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
	links: [
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
}];
