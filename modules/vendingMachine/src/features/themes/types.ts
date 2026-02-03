export type ThemeStatus = 'active' | 'inactive';

export type ProductCardStyle = 'default' | 'rounded' | 'minimal' | 'elegant' | 'modern';

export type AppBackground = 'none' | 'snow' | 'fireworks' | 'particles' | 'gradient' | 'custom';

export type FontStyle = 'default' | 'roboto' | 'inter' | 'poppins' | 'montserrat' | 'custom';

export interface Theme {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: ThemeStatus;
	primaryColor: string; // Hex color code
	productCardStyle: ProductCardStyle;
	appBackground: AppBackground;
	fontStyle: FontStyle;
	mascotImage?: string; // URL or path to mascot image
	createdAt: string;
	etag: string;
}
