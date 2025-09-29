import { useMantineColorScheme } from '@mantine/core'
import { useEffect } from 'react'

import { CTASection } from '@/modules/core/components/landing/CTASection'
import { FAQSection } from '@/modules/core/components/landing/FAQSection'
import { Features } from '@/modules/core/components/landing/FeaturesSection'
import { Footer } from '@/modules/core/components/landing/Footer'
import { Header } from '@/modules/core/components/landing/Header'
import { HeroSection } from '@/modules/core/components/landing/HeroSection'
import { LandingContainer } from '@/modules/core/components/landing/LandingContainer'
import { PricingSection } from '@/modules/core/components/landing/PricingSection'
import { SocialProofSection } from '@/modules/core/components/landing/SocialProofSection'

export function LandingPage() {
	const { setColorScheme } = useMantineColorScheme()

	useEffect(() => {
		setColorScheme('light')
	}, [])

	const headerLinks = [
		{
			link: '/about',
			label: 'Home',
		},
		{
			link: '/learn',
			label: 'Features',
		},
		{
			link: '/pricing',
			label: 'Pricing',
		},
	]

	return (
		<LandingContainer>
			<Header links={headerLinks} />
			<HeroSection />
			<SocialProofSection />
			<Features />
			<PricingSection />
			<FAQSection />
			<CTASection />
			<Footer />
		</LandingContainer>
	)
}