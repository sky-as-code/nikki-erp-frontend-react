export type EnvVars = {
	/**
	 * Base URL for all API calls made by the microfrontend (MFE) Shell.
	 * While some MFE Modules may have their own API URLs, some may reuse this API URL.
	 */
	BASE_API_URL: string,

	/**
	 * Sub-path of the domain, under which the Next.js application is deployed.
	 * This var must have the same value with `basePath` in next.config.js
	 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
	 */
	ROOT_PATH: string,

	/**
	 * For multitenant SaaS, this is the main domain name, excluding the subdomain parts where this application is deployed.
	 * Eg: If application is deployed at sub.example.com, then root domain is example.com
	 *
	 * For application with dedicated domain name, this is the same as the domain name.
	 * Eg: If application is deployed at example.com, then root domain is example.com
	 */
	ROOT_DOMAIN: string,
}
