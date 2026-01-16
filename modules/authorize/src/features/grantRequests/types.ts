
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
	// org?: Org | null;
	orgDisplayName?: string;
	createdAt: string;
	approver?: { id: string; name?: string } | null;
	requestor?: { id: string; name?: string };
	requestorId?: string;
	receiver?: { id: string; name?: string };
	receiverId?: string;
	target?: { id: string; name?: string };
	targetId?: string;
	etag?: string;
	receiverType?: ReceiverType;
	grantResponses?: Array<{ id: string; responderName: string; isApproved: boolean }>;
}
