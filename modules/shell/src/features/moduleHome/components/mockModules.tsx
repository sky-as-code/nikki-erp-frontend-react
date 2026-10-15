import accountingIcon from '@nikkierp/ui/assets/moduleIcons/accounting.svg';
import assetsIcon from '@nikkierp/ui/assets/moduleIcons/assets.svg';
import chatIcon from '@nikkierp/ui/assets/moduleIcons/chat.svg';
import contactsIcon from '@nikkierp/ui/assets/moduleIcons/contacts.svg';
import crmIcon from '@nikkierp/ui/assets/moduleIcons/crm.svg';
import customersIcon from '@nikkierp/ui/assets/moduleIcons/customers.svg';
import documentsIcon from '@nikkierp/ui/assets/moduleIcons/documents.svg';
import driveIcon from '@nikkierp/ui/assets/moduleIcons/drive.svg';
import helpdeskIcon from '@nikkierp/ui/assets/moduleIcons/helpdesk.svg';
import hrmIcon from '@nikkierp/ui/assets/moduleIcons/hrm.svg';
import iamIcon from '@nikkierp/ui/assets/moduleIcons/iam.svg';
import incidentManagementIcon from '@nikkierp/ui/assets/moduleIcons/incident-management.svg';
import inventoryIcon from '@nikkierp/ui/assets/moduleIcons/inventory.svg';
import itApplicationsIcon from '@nikkierp/ui/assets/moduleIcons/it-applications.svg';
import itDeploymentsIcon from '@nikkierp/ui/assets/moduleIcons/it-deployments.svg';
import itSecretsIcon from '@nikkierp/ui/assets/moduleIcons/it-secrets.svg';
import manufactureIcon from '@nikkierp/ui/assets/moduleIcons/manufacture.svg';
import parkingLotIcon from '@nikkierp/ui/assets/moduleIcons/parkinglot.svg';
import projectManagementIcon from '@nikkierp/ui/assets/moduleIcons/project-management.svg';
import purchaseIcon from '@nikkierp/ui/assets/moduleIcons/purchase.svg';
import qrCodeIcon from '@nikkierp/ui/assets/moduleIcons/qr-code.svg';
import riskManagementIcon from '@nikkierp/ui/assets/moduleIcons/risk-management.svg';
import salesIcon from '@nikkierp/ui/assets/moduleIcons/sales.svg';
import settingsIcon from '@nikkierp/ui/assets/moduleIcons/settings.svg';
import vendingMachineIcon from '@nikkierp/ui/assets/moduleIcons/vendingmachine.svg';


export const mockModules = [
	{
		key: 'favouritesAndRecentlyUsed',
		label: 'Favourites and Recently Used',
		modules: [
			{
				name: 'Accounting',
				slug: 'accounting',
				category: 'Accounting',
				icon: accountingIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: true,
				lastUsed: '2025-01-01',
			},
			{
				name: 'IAM',
				slug: 'iam',
				category: 'IAM',
				icon: iamIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Drive',
				slug: 'drive',
				category: 'Drive',
				icon: driveIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Inventory',
				slug: 'inventory',
				category: 'Inventory',
				icon: inventoryIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Sales',
				slug: 'sales',
				category: 'Sales',
				icon: salesIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Purchase',
				slug: 'purchase',
				category: 'Purchase',
				icon: purchaseIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Vending Machine',
				slug: 'vendingmachine',
				category: 'Vending Machine',
				icon: vendingMachineIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Parking Lot',
				slug: 'parkinglot',
				category: 'Parking Lot',
				icon: parkingLotIcon,
				isDisabled: false,
				isOrphaned: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'coreBusiness',
		label: 'Core Business Operations (4)',
		modules: [
			{
				name: 'HR Management',
				slug: 'hr_management',
				category: 'coreBusiness',
				icon: hrmIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Asset Management',
				slug: 'asset_management',
				category: 'coreBusiness',
				icon: assetsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Manufacture',
				slug: 'manufacture',
				category: 'coreBusiness',
				icon: manufactureIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Project Management',
				slug: 'project_management',
				category: 'coreBusiness',
				icon: projectManagementIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'customerRelations',
		label: 'Customer Relations (4)',
		modules: [
			{
				name: 'CRM',
				slug: 'crm',
				category: 'customerRelations',
				icon: crmIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Customers',
				slug: 'customers',
				category: 'customerRelations',
				icon: customersIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Contacts',
				slug: 'contacts',
				category: 'customerRelations',
				icon: contactsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Helpdesk',
				slug: 'helpdesk',
				category: 'customerRelations',
				icon: helpdeskIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'communication',
		label: 'Communication (2)',
		modules: [
			{
				name: 'Chat',
				slug: 'chat',
				category: 'communication',
				icon: chatIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				// No `icon`: there is no email icon in the set. `ModuleCard` substitutes
				// `generic.svg` when the field is absent, so the card still renders in the
				// house style rather than dropping to the plain Tabler placeholder.
				name: 'Email',
				slug: 'email',
				category: 'communication',
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'identityAndAccessManagement',
		label: 'Identity & Access Management (1)',
		modules: [
			{
				name: 'Identity',
				slug: 'identity',
				category: 'identityAndAccessManagement',
				icon: iamIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'infomationTechnology',
		label: 'Information Technology (7)',
		modules: [
			{
				name: 'IT Applications',
				slug: 'it_applications',
				category: 'infomationTechnology',
				icon: itApplicationsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'IT Secrets',
				slug: 'it_secrets',
				category: 'infomationTechnology',
				icon: itSecretsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'IT Deployments',
				slug: 'it_deployments',
				category: 'infomationTechnology',
				icon: itDeploymentsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Incident Management',
				slug: 'incident_management',
				category: 'infomationTechnology',
				icon: incidentManagementIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Risk Management',
				slug: 'risk_management',
				category: 'infomationTechnology',
				icon: riskManagementIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Vending Machine',
				slug: 'vendingmachine',
				category: 'infomationTechnology',
				icon: vendingMachineIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Parking Lot',
				slug: 'parkinglot',
				category: 'infomationTechnology',
				icon: parkingLotIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				// The settings page is reached from here rather than the main menu (D11), which is
				// what lets the module contribute no menu items of its own.
				name: 'Settings',
				slug: 'settings',
				category: 'infomationTechnology',
				icon: settingsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'inventoryAndLogistics',
		label: 'Inventory & Logistics (3)',
		modules: [
			{
				name: 'Inventory',
				slug: 'inventory',
				category: 'inventoryAndLogistics',
				icon: inventoryIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Purchase',
				slug: 'purchase',
				category: 'inventoryAndLogistics',
				icon: purchaseIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'QR Code',
				slug: 'qr_code',
				category: 'inventoryAndLogistics',
				icon: qrCodeIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
	{
		key: 'financialManagement',
		label: 'Financial Management (2)',
		modules: [
			{
				name: 'Accounting',
				slug: 'accounting',
				category: 'financialManagement',
				icon: accountingIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
			{
				name: 'Documents',
				slug: 'documents',
				category: 'financialManagement',
				icon: documentsIcon,
				isDisabled: false,
				isFavourite: false,
				lastUsed: '2025-01-01',
			},
		],
	},
];
