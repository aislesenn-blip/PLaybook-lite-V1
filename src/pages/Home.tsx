import HeroSection from '../components/Landing/HeroSection';
import FeatureCards from '../components/Landing/FeatureCards';
import Footer from '../components/Landing/Footer';

const Home = () => {
  return (
    <div className="bg-canvas">
      <HeroSection />
      <FeatureCards />
      <Footer />
    </div>
  );
};

export default Home;
