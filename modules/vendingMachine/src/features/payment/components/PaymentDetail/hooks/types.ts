import { ModelSchema } from '@nikkierp/ui/model';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';

import type { PaymentUpdateFormData } from '@/features/payment/hooks/usePaymentEdit';
import type { PaymentMethod } from '@/features/payment/types';


export type UsePaymentDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	modelSchema: ModelSchema;
	formId: string;
	formResetNonce: number;
	isEditing: boolean;
	isSubmitting: boolean;
	onFormSubmit: (data: PaymentUpdateFormData) => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
	isOpenArchiveModal: boolean;
	pendingArchive: { payment: PaymentMethod; targetArchived: boolean } | null;
	handleConfirmArchive: () => void;
	handleCloseArchiveModal: () => void;
	paymentForDelete: PaymentMethod | null;
};
