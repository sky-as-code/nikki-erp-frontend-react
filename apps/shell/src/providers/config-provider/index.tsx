"use client";

import React, { createContext, useContext } from "react";

import type { AppConfig } from '@/types/config'

const ConfigContext = createContext<AppConfig | undefined>(undefined);

export const useConfig = () => {
	const context = useContext(ConfigContext);
	if (!context) throw new Error("useConfig must be used within ConfigProvider");
	return context;
};

export const ConfigProvider = ({
	children,
	config,
}: {
	children: React.ReactNode;
	config: AppConfig;
}) => {
	return (
	<ConfigContext.Provider value={config}>
		{children}
	</ConfigContext.Provider>
	);
};
