import HeroSection from "@/components/home/HeroSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import BestSellerSlider from "@/components/home/BestSellerSlider";
import NewestSection from "@/components/home/NewestSection";
import AllServicesSection from "@/components/home/AllServicesSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Services */}
      <FeaturedSection />
      
      {/* Best Sellers */}
      <BestSellerSlider />
      
      {/* Newest Services */}
      <NewestSection />
      
      {/* All Services */}
      <AllServicesSection />
    </div>
  );
}
