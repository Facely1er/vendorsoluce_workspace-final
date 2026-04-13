import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, CheckCircle, Zap, Eye, Shield, User } from 'lucide-react';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import TextCarousel from '../common/TextCarousel';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isDemoMode, enterDemoMode } = useAuth();
  
  // Define rotating texts for the carousel
  const carouselTexts = [
    t('home.hero.carousel.text1'),
    t('home.hero.carousel.text2'),
    t('home.hero.carousel.text3'),
    t('home.hero.carousel.text4'),
    t('home.hero.carousel.text5')
  ];
  
  return (
    <section className="hero-section relative text-white pt-4 md:pt-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 hero-background"></div>
      
      {/* Dynamic Theme Overlay */}
      <div className="absolute inset-0 z-10 hero-overlay"></div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="relative">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up animate-delay-100">
              {t('home.hero.title_line1')} <br />
              {t('home.hero.title_line2')}
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-gray-100 mb-4 max-w-4xl mx-auto opacity-0 animate-fade-in-up animate-delay-300">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="text-base md:text-lg text-gray-100 mb-1 max-w-4xl mx-auto opacity-0 animate-fade-in-up animate-delay-500">
              <div className="h-14 md:h-16 lg:h-20 flex items-center justify-center">
                <TextCarousel 
                  texts={carouselTexts}
                  interval={4000}
                  className="w-full h-full flex items-center justify-center"
                  textClassName="text-center leading-relaxed whitespace-pre-line"
                />
              </div>
            </div>
            
            {/* Trial Message */}
            {!isAuthenticated && (
              <div className="mb-2 opacity-0 animate-fade-in-up animate-delay-600">
                <p className="text-sm md:text-base text-gray-100">
                  <span className="font-semibold">14-day free trial</span> - No credit card required
                </p>
              </div>
            )}
            
            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4 opacity-0 animate-fade-in-up animate-delay-700">
              {!isAuthenticated ? (
                <>
                  {isDemoMode && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => enterDemoMode()}
                      className="bg-amber-400 text-amber-950 hover:bg-amber-300 hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center w-full sm:w-auto"
                    >
                      Try Demo
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/vendors')}
                    className="bg-white text-vendorsoluce-green hover:bg-gray-100 hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center w-full sm:w-auto"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Open workspace
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/supply-chain-assessment')}
                    className="border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Start Assessment
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/supply-chain-assessment')}
                  className="bg-white text-vendorsoluce-green hover:bg-gray-100 hover:scale-105 transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                >
                  <Target className="h-5 w-5 mr-2" />
                  {t('home.hero.cta1')}
                </Button>
              )}
            </div>
            
            {/* Secondary Quick Links */}
            {!isAuthenticated && (
              <div className="flex flex-wrap justify-center gap-3 mb-6 opacity-0 animate-fade-in-up animate-delay-800">
                <Link to="/vendors" className="text-sm text-gray-200 hover:text-white underline transition-colors">
                  Try Free Tools
                </Link>
                <span className="text-gray-400">•</span>
                <Link to="/how-it-works" className="text-sm text-gray-200 hover:text-white underline transition-colors">
                  How It Works
                </Link>
              </div>
            )}
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto pb-4 md:pb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 opacity-0 animate-fade-in-up animate-delay-900 hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-yellow-300" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{t('home.hero.benefits.section1.title')}</h3>
                <div className="text-gray-100 text-sm space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section1.benefit1')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section1.benefit2')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section1.benefit3')}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 opacity-0 animate-fade-in-up animate-delay-1100 hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-center justify-center mb-3">
                  <Eye className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{t('home.hero.benefits.section2.title')}</h3>
                <div className="text-gray-100 text-sm space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section2.benefit1')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section2.benefit2')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section2.benefit3')}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 opacity-0 animate-fade-in-up animate-delay-1300 hover:bg-white/15 hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-green-300" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{t('home.hero.benefits.section3.title')}</h3>
                <div className="text-gray-100 text-sm space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section3.benefit1')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section3.benefit2')}</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>{t('home.hero.benefits.section3.benefit3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;