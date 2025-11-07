import React from 'react';

import { IAuthService } from '../auth';


type AuthContextType = {
	service: IAuthService;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

export type AuthProviderProps = React.PropsWithChildren & {
	service: IAuthService;
};

export function AuthProvider({ children, service }: AuthProviderProps) {
	return (
		<AuthContext.Provider value={{ service }}>
			{children}
		</AuthContext.Provider>
	);
}
