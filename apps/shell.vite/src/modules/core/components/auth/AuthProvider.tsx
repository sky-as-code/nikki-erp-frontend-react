import { createContext, useContext, useState } from 'react';

import { getAuthData, setAuthData, clearAuthData, type AuthData } from '@/modules/core/helpers';



type AuthContextType = {
	isAuthenticated: boolean; user: AuthData['user'] | null;
	login: (authData: AuthData) => void; logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	} return context;
};

export type AuthProviderProps = React.PropsWithChildren & {
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const authData = getAuthData();
	const [isAuthenticated, setIsAuthenticated] = useState(Boolean(authData));
	const [user, setUser] = useState<AuthData['user'] | null>(authData?.user ?? null);

	const login = (authData: AuthData) => {
		setAuthData(authData);
		setIsAuthenticated(true);
		setUser(authData.user);
	};

	const logout = () => {
		clearAuthData();
		setIsAuthenticated(false);
		setUser(null);
	};


	return (
		<AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
