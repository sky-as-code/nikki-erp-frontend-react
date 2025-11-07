import { createContext, useContext } from 'react';


export type ClientConfigContextType = {
	envVars: Record<string, unknown>;
};

const ClientConfigContext = createContext<ClientConfigContextType | null>(null);

const useConfig = (): ClientConfigContextType => {
	const context = useContext(ClientConfigContext);
	if (!context) throw new Error('useConfig must be used within ConfigProvider');
	return context;
};

export function useEnvVars<T>(): T {
	const context = useConfig();
	return context.envVars as T;
}

export type ClientConfigProviderProps = React.PropsWithChildren & {
	envVars: Record<string, unknown>;
};

export function ClientConfigProvider(props: ClientConfigProviderProps): React.ReactNode {
	return (
		<ClientConfigContext.Provider value={{
			envVars: props.envVars,
		}}>
			{props.children}
		</ClientConfigContext.Provider>
	);
};
