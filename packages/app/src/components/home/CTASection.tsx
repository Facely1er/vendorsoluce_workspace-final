import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { User, Target, ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="bg-gradient-to-r from-vendorsoluce-green to-vendorsoluce-light-green text-white py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center pt-4">
        <h2 className="text-3xl font-bold mb-6">
          {t('home.cta.title')}
        </h2>
        <p className="text-xl mb-4 text-gray-100">
          {t('home.cta.description')}
        </p>
        {!isAuthenticated && (
          <p className="text-base mb-8 text-gray-200">
            14-day free trial • No credit card required • Full Professional tier access
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/signin?redirect=/dashboard">
                <Button variant="secondary" size="lg" className="bg-white text-vendorsoluce-green hover:bg-gray-100 w-full sm:w-auto flex items-center justify-center">
                  <User className="h-5 w-5 mr-2" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/supply-chain-assessment">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto flex items-center justify-center">
                  <Target className="h-5 w-5 mr-2" />
                  Start Assessment
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/supply-chain-assessment">
              <Button variant="secondary" size="lg" className="bg-white text-vendorsoluce-green hover:bg-gray-100 w-full sm:w-auto flex items-center justify-center">
                <Target className="h-5 w-5 mr-2" />
                {t('home.hero.cta1')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;