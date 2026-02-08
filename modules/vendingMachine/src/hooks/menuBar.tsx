/* eslint-disable max-lines-per-function */
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
					label: translate('nikki.vendingMachine.menu.revenue_overview'),
					link: '/reports/revenue',
				},
				{
					label: translate('nikki.vendingMachine.menu.revenue_by_kiosk'),
					link: '/reports/revenue-by-kiosk',
				},
				{
					label: translate('nikki.vendingMachine.menu.revenue_by_product'),
					link: '/reports/revenue-by-product',
				},
				{
					label: translate('nikki.vendingMachine.menu.revenue_by_payment_method'),
					link: '/reports/revenue-by-payment-method',
				},
				{
					label: translate('nikki.vendingMachine.menu.refunds_report'),
					link: '/reports/refunds',
				},
				{
					label: translate('nikki.vendingMachine.menu.orders_report'),
					link: '/reports/orders',
				},
				{
					label: translate('nikki.vendingMachine.menu.inventory_report'),
					link: '/reports/inventory',
				},
				{
					label: translate('nikki.vendingMachine.menu.operations_report'),
					link: '/reports/operations',
				},
			],
		},
	];
}