// This code is supposed to run on server-side. However these config will be sent to client-side,
// so DO NOT put sensitive information here.

// We don't want to use NEXT_PUBLIC_ variables so that devops on backend
// will not lock in Next-specific env vars.

import { cleanEnv, url } from 'envalid'
import type { AppConfig } from '@/types/config'

const config = Object.freeze<AppConfig>(cleanEnv(process.env, {
	// General
	// apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
	// featureFlag: process.env.NEXT_PUBLIC_FEATURE_FLAG === "true",

	//
	// Modules - Each module can be deployed as a separate microservice.
	//

	CORE_MOD_URL: url(),
}));

export default config;
