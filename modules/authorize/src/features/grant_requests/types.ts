import { RoleSuite } from '../role_suites';
import { Role } from '../roles';



export enum TargetType {
	ROLE = 'role',
	SUITE = 'suite',
}

export enum ReceiverType {
	USER = 'user',
	GROUP = 'group',
}

export enum RequestStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected',
	CANCELLED = 'cancelled',
}

export interface GrantRequest {
	id: string;
	attachmentUrl?: string;
	comment?: string;
	approvalId?: string;
	requestorId: string;
	receiverId: string;
	targetType: string;
	targetRef: string;
	responseId?: string | null;
	status: 'pending' | 'approved' | 'rejected' | 'cancelled';
	orgId?: string | null;
	createdAt: string;
	updatedAt?: string;
	cancelledAt?: string;
	deletedAt?: string;
	approver?: { id: string; name?: string } | null;
	requestor?: { id: string; name?: string };
	receiver?: { id: string; name?: string };
	target?: { id: string; name?: string };
	etag?: string;
	receiverType?: string;
	grantResponses?: Array<{ id: string; responderName: string; isApproved: boolean }>;
}

export interface GrantRequestState {
	items: GrantRequest[];
	isLoadingList: boolean;
	errorList: string | null;
	detail?: GrantRequest;
	isLoadingDetail: boolean;
	errorDetail: string | null;
}
