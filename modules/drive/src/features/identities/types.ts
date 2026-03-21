import type { IdentityUserDto } from '@/services/identService';

export type IdentityUser = {
	id: string;
	displayName: string;
	email: string;
	avatarUrl?: string;
};

export function mapDtoToIdentityUser(dto: IdentityUserDto): IdentityUser {
	return {
		id: dto.id,
		displayName: dto.displayName,
		email: dto.email,
		avatarUrl: dto.avatarUrl,
	};
}

