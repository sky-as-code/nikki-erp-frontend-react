import { head } from '@/common/request'

export async function extractAndValidateSubdomain(hostname: string): Promise<string | null> {
	// Handle localhost specially
	if (hostname === 'localhost') {
		return null
	}

	// Extract subdomain (everything before first dot)
	const parts = hostname.split('.')
	if (parts.length <= 1) {
		return null
	}

	const subdomain = parts[0]

	// Validate subdomain contains at least one alpha character
	if (!subdomain || !/[a-zA-Z]/.test(subdomain)) {
		return null
	}

	try {
		// Validate subdomain exists in backend
		await head(`/core/subdomains/${subdomain}`)
		return subdomain
	}
	catch {
		return null
	}
}