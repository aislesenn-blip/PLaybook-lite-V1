import HeroSection from '../components/Landing/HeroSection';
import FeatureCards from '../components/Landing/FeatureCards';
import Testimonials from '../components/Landing/Testimonials';
import Footer from '../components/Landing/Footer';

const Home = () => {
  return (
    <div className="bg-canvas">
      <HeroSection />
      <FeatureCards />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
