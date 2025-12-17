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
	targetType: TargetType;
	targetRef: string;
	responseId?: string | null;
	status: RequestStatus;
	orgId?: string | null;
	createdAt: string;
	approver?: { id: string; name: string } | null;
	requestor?: { id: string; name: string };
	receiver?: { id: string; name: string };
	target?: { id: string; name: string };
	etag?: string;
	receiverType?: ReceiverType;
	grantResponses?: Array<{ id: string; responderName: string; isApproved: boolean }>;
}

export interface GrantRequestState {
	grantRequests: GrantRequest[];
	isLoadingList: boolean;
	errorList: string | null;
	grantRequestDetail?: GrantRequest;
	isLoadingDetail: boolean;
	errorDetail: string | null;
}
