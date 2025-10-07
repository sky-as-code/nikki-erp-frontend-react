/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	reactStrictMode: false,
	experimental: {
		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
	},
}

export default nextConfig
