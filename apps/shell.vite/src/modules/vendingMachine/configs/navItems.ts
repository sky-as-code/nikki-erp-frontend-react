import { IconHierarchy2, IconWorldCog } from '@tabler/icons-react';

import type { NavItem } from '@nikkierp/ui/types';


export default <NavItem[]>[{
	label: 'Kiosks',
	icon: IconHierarchy2,
	link: '/kiosks',
},
{
	label: 'Ads',
	icon: IconHierarchy2,
	link: '/ads',
},
{
	label: 'Events',
	icon: IconWorldCog,
	link: '/events',
}];
