import { MenuBarItem } from '@nikkierp/ui/appState';
import { useTranslation } from 'react-i18next';


export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();
	return [
		{
			label: translate('nikki.vendingMachine.menu.overview'),
			link: '/overview',
		},
		{
			label: translate('nikki.vendingMachine.menu.kiosks'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.kiosks'),
					link: '/kiosks',
				},
				{
					label: translate('nikki.vendingMachine.menu.ads'),
					link: '/ads',
				},
				{
					label: translate('nikki.vendingMachine.menu.events'),
					link: '/events',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_settings'),
					link: '/kiosk-settings',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_template'),
					link: '/kiosk-template',
				},
			],
		},
		{
			label: translate('nikki.vendingMachine.menu.reports'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.revenue'),
					link: '/reports/revenue',
				},
				{
					label: translate('nikki.vendingMachine.menu.inventory'),
					link: '/reports/inventory-warning',
				},
			],
		},

	];
}