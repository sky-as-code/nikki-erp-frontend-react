import { Role } from '../roles';
import { RoleSuite } from '../role_suites';


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


interface GrantRequest {
	id: string;
	requestorId: string;
	requestorName: string;
	receiverType: ReceiverType;
	receiverId: string;
	receiverName: string;
	targetType: TargetType;
	targetRef: string;
	status: RequestStatus;
	attachmentUrl?: string;
	comment?: string;
	approvalId?: string;
	responseId?: string;
	createdAt: string;
	updatedAt: string;
	// Relations
	target?: Role | RoleSuite;
	targetName?: string;
	responses?: GrantResponse[];
	responsesCount?: number;
}

interface GrantResponse {
	id: string;
	requestId: string;
	responderId: string;
	responderName: string;
	isApproved: boolean;
	reason?: string;
	createdAt: string;
	updatedAt: string;
	// Relations
	request?: GrantRequest;
}

export type { GrantRequest, GrantResponse };
