import { ReceiverType, TargetType } from '../grant_requests';
import { RoleSuite } from '../role_suites';
import { Role } from '../roles';


interface RevokeRequest {
	id: string;
	requestorId: string;
	requestorName: string;
	receiverType: ReceiverType;
	receiverId: string;
	receiverName: string;
	targetType: TargetType;
	targetRef: string;
	attachmentUrl?: string;
	comment?: string;
	createdAt: string;
	updatedAt: string;
	// Relations
	target?: Role | RoleSuite;
	targetName?: string;
}

export type { RevokeRequest };