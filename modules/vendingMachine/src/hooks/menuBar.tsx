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
			label: translate('nikki.vendingMachine.menu.kiosk'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.kiosk_management'),
					link: '/kiosks',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_template'),
					link: '/kiosk-template',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_devices'),
					link: '/kiosk-devices',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_settings'),
					link: '/kiosk-settings',
				},
			],
		},
		{
			label: translate('nikki.vendingMachine.menu.appearance'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.presentation'),
					link: '/ads',
				},
				{
					label: translate('nikki.vendingMachine.menu.themes'),
					link: '/themes',
				},
				{
					label: translate('nikki.vendingMachine.menu.miniGame'),
					link: '/mini-game',
				},
				{
					label: translate('nikki.vendingMachine.menu.events'),
					link: '/events',
				},
			],
		},
		{
			label: translate('nikki.vendingMachine.menu.payment'),
			link: '/payment',
		},
		{
			label: translate('nikki.vendingMachine.menu.reports'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.revenue_report'),
					link: '/reports/revenue',
				},
				{
					label: translate('nikki.vendingMachine.menu.operations_report'),
					link: '/reports/operations',
				},
			],
		},
	];
}