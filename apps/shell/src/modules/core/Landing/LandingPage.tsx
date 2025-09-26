import { useMantineColorScheme } from '@mantine/core';
import { useEffect } from 'react';

import { Footer } from '@/modules/core/Footer';
import { CTASection } from '@/modules/core/Landing/CTASection';
import { FAQSection } from '@/modules/core/Landing/FAQSection';
import { Features } from '@/modules/core/Landing/FeaturesSection';
import { Header } from '@/modules/core/Landing/Header';
import { HeroSection } from '@/modules/core/Landing/HeroSection';
import { LandingContainer } from '@/modules/core/Landing/LandingContainer';
import { PricingSection } from '@/modules/core/Landing/PricingSection';
import { SocialProofSection } from '@/modules/core/Landing/SocialProofSection';

export function LandingPage() {
	const { setColorScheme } = useMantineColorScheme();

	useEffect(() => {
		setColorScheme('light');
	}, []);

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
	];

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
	);
}