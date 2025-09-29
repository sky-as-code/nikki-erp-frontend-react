import { Suspense, useEffect, useState } from 'react'

import { LoadingSpinner } from '@/common/components/loading'
import { ShellProviders } from '@/common/context/ShellProviders'
import { loadEnvVars } from '@/common/envVars'
import { initRequestMaker } from '@/common/request'
import { EnvVars } from '@/common/types/envVars'

export const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [envVars, setEnvVars] = useState<EnvVars | null>(null)

	useEffect(() => {
		loadEnvVars().then((envVarsRes) => {
			if (envVarsRes) {
				setEnvVars(envVarsRes)
				initRequestMaker({ baseUrl: envVarsRes.BASE_API_URL })
			}
		})
	}, [])

	if (!envVars) return null

	return (
		// <html lang='en-US' {...mantineHtmlProps}>
		// 	<head>
		// 		<ColorSchemeScript defaultColorScheme='light' />
		// 		<meta
		// 			name='viewport'
		// 			content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
		// 		/>
		// 	</head>
		// <body className={'overflow-hidden'}>
		<ShellProviders envVars={envVars}>
			<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
		</ShellProviders>
		// </body>
		// </html>
	)
}