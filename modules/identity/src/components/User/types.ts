export interface UserInGroup {
	id: string;
	email: string;
	displayName?: string;
	avatarUrl?: string;
	status?: string;
}

export interface AvailableUser {
	id: string;
	email: string;
	displayName?: string;
	avatarUrl?: string;
}

export interface ListUserProps {
	users: UserInGroup[];
	availableUsers: AvailableUser[];
	isLoading?: boolean;
	onAddUsers: (userIds: string[]) => Promise<void>;
	onRemoveUsers: (userIds: string[]) => Promise<void>;
	title?: string;
	emptyMessage?: string;
}
