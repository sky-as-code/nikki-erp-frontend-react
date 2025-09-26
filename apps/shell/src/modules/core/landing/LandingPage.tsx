import { useMantineColorScheme } from '@mantine/core'
import { useEffect } from 'react'

import { Footer } from '@/common/components/Footer'
import { CTASection } from '@/modules/core/landing/CTASection'
import { FAQSection } from '@/modules/core/landing/FAQSection'
import { Features } from '@/modules/core/landing/FeaturesSection'
import { Header } from '@/modules/core/landing/Header'
import { HeroSection } from '@/modules/core/landing/HeroSection'
import { LandingContainer } from '@/modules/core/landing/LandingContainer'
import { PricingSection } from '@/modules/core/landing/PricingSection'
import { SocialProofSection } from '@/modules/core/landing/SocialProofSection'

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