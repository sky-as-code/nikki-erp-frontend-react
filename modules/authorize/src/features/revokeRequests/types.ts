import { ReceiverType, TargetType } from '../grantRequests';
import { Role } from '../roles';
import { RoleSuite } from '../roleSuite';


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