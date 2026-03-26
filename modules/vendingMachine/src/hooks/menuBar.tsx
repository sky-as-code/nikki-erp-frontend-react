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
					label: translate('nikki.vendingMachine.menu.kiosk_settings'),
					link: '/kiosk-settings',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_models'),
					link: '/kiosk-models',
				},
				{
					label: translate('nikki.vendingMachine.menu.kiosk_devices'),
					link: '/kiosk-devices',
				},
				{
					label: translate('nikki.vendingMachine.menu.settings'),
					link: '/settings',
				},
			],
		},
		{
			label: translate('nikki.vendingMachine.menu.appearance'),
			items: [
				{
					label: translate('nikki.vendingMachine.menu.presentation'),
					link: '/slideshows/playlists',
					items: [
						{
							label: translate('nikki.vendingMachine.menu.playlists'),
							link: '/slideshows/playlists',
						},
						{
							label: translate('nikki.vendingMachine.menu.gallery'),
							link: '/slideshows/gallery',
						},
					],
				},
				{
					label: translate('nikki.vendingMachine.menu.themes'),
					link: '/themes',
				},
				{
					label: translate('nikki.vendingMachine.menu.miniGame'),
					link: '/games',
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
					label: translate('nikki.vendingMachine.menu.business_report'),
					link: '/reports/business-overview',
					items: [
						{
							label: translate('nikki.vendingMachine.menu.business_overview'),
							link: '/reports/business-overview',
						},
						{
							label: translate('nikki.vendingMachine.menu.revenue_report'),
							link: '/reports/revenue',
						},
						{
							label: translate('nikki.vendingMachine.menu.pnl_report'),
							link: '/reports/pnl',
						},
						{
							label: translate('nikki.vendingMachine.menu.refunds_report'),
							link: '/reports/refunds',
						},
						{
							label: translate('nikki.vendingMachine.menu.orders_report'),
							link: '/reports/orders',
						},
					],
				},
				{
					label: translate('nikki.vendingMachine.menu.operations_report'),
					link: '/reports/operations-overview',
					items: [
						{
							label: translate('nikki.vendingMachine.menu.operations_overview'),
							link: '/reports/operations-overview',
						},
						{
							label: translate('nikki.vendingMachine.menu.inventory_report'),
							link: '/reports/inventory',
						},
					],
				},
			],
		},
	];
}