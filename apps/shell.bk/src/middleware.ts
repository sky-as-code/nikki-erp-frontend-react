// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	let subdomain = ''
	const hostname = request.headers.get('host') || ''
	const currentHost = hostname.split(':')[0] // remove port if in dev
	if (currentHost === 'localhost') {
		subdomain = currentHost
	}
	else {
		const hostParts = currentHost.split('.')
		if (hostParts.length > 1) {
			subdomain = hostParts[0]
		}
	}

	// Check if subdomain is valid: starts with an alpha character.
	// Therefore an IPv4 address won't be valid.
	const isValidSubdomain = /^[a-zA-Z][a-zA-Z0-9-]*$/.test(subdomain)

	const response = NextResponse.next()

	// Pass it via request headers or cookies
	response.headers.set('x-nikki-subdomain', subdomain)

	return response
}

// Apply to all routes
export const config = {
	matcher: ['/:path*'],
}
