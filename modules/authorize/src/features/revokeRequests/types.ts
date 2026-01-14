import { ReceiverType, TargetType } from '../grantRequests';


export interface RevokeRequest {
	id: string;
	etag?: string;
	requestorId?: string;
	requestor?: { id: string; name?: string };
	receiverType: ReceiverType;
	receiverId: string;
	receiver?: { id: string; name?: string };
	targetType: TargetType;
	targetRef: string;
	target?: { id: string; name?: string };
	targetId?: string;
	attachmentUrl?: string;
	comment?: string;
	createdAt: string;
}

// RevokeRequestState moved to revokeRequestSlice.ts