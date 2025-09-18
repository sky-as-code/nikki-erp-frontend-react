// import { SimpleTable } from '@components/Table/SimpleTable';

// import { Footer } from '@/components/Footer/Footer';
// import { CTASection } from '@/components/Landing/CTASection';
// import { FAQSection } from '@/components/Landing/FAQSection';
// import { Features } from '@/components/Landing/FeaturesSection';
// import { Header } from '@/components/Landing/Header';
// import { HeroSection } from '@/components/Landing/HeroSection';
// import { LandingContainer } from '@/components/Landing/LandingContainer';
// import { PricingSection } from '@/components/Landing/PricingSection';
// import { SocialProofSection } from '@/components/Landing/SocialProofSection';
// import { DataTable } from '@/components/Table/DataTable';
import { AuthGuard } from '@/modules/authenticate/components/AuthGuard';

export default function Page() {
	return (
		<AuthGuard>
			<h1>Welcome to NikkiERP</h1>
		</AuthGuard>
		// <LandingContainer>
		// 	<Header
		// 		links={[
		// 			{
		// 				link: '/about',
		// 				label: 'Home',
		// 			},
		// 			{
		// 				link: '/learn',
		// 				label: 'Features',
		// 			},
		// 			{
		// 				link: '/pricing',
		// 				label: 'Pricing',
		// 			},
		// 		]}
		// 	/>
		// 	<HeroSection />
		// 	<SocialProofSection />
		// 	<Features />
		// 	<PricingSection />
		// 	<FAQSection />
		// 	<CTASection />
		// 	<Footer />
		// </LandingContainer>
	);
}