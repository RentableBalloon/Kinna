import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Sparkles, ArrowRight, BarChart3, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-midas-dark">
      {/* Metro Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-midas-gold/20 via-midas-dark to-midas-dark"></div>
        <div className="container mx-auto px-8 py-24 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-midas-gold/10 border border-midas-gold px-4 py-2 mb-6">
                <span className="text-midas-gold font-semibold uppercase tracking-wider text-sm">Midas Studios</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-display font-light mb-6 leading-tight">
                KINNA
              </h1>
              <p className="text-3xl text-midas-lightGold mb-4 font-light">
                Where Readers Connect
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                A premium social platform designed by readers, for readers. 
                Discover, discuss, and connect through the stories you love.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="btn-gold group">
                  Get Started
                  <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link to="/login" className="btn-outline">
                  Sign In
                </Link>
                <Link to="/explore" className="btn-outline">
                  Explore
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="metro-tile-gold h-48 flex flex-col justify-end">
                <BarChart3 size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">10K+</h3>
                <p className="text-sm">Active Readers</p>
              </div>
              <div className="metro-tile-dark h-48 flex flex-col justify-end bg-metro-blue">
                <BookOpen size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">5K+</h3>
                <p className="text-sm">Books Discussed</p>
              </div>
              <div className="metro-tile-dark h-48 flex flex-col justify-end bg-metro-purple">
                <MessageSquare size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">50K+</h3>
                <p className="text-sm">Forum Posts</p>
              </div>
              <div className="metro-tile-dark h-48 flex flex-col justify-end bg-metro-green">
                <Users size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">100+</h3>
                <p className="text-sm">Communities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid - Power BI Style */}
      <div className="container mx-auto px-8 py-20 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-4xl font-display font-light mb-4">Platform Features</h2>
          <div className="h-1 w-24 bg-midas-gold"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bi-card group hover:border-metro-blue transition-all">
            <BookOpen size={40} className="text-midas-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Book Forums</h3>
            <p className="text-gray-400 leading-relaxed">
              Dedicated discussion spaces for every book you love
            </p>
          </div>

          <div className="bi-card group hover:border-metro-green transition-all">
            <Users size={40} className="text-midas-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Communities</h3>
            <p className="text-gray-400 leading-relaxed">
              Build meaningful connections with like-minded readers
            </p>
          </div>

          <div className="bi-card group hover:border-metro-orange transition-all">
            <TrendingUp size={40} className="text-midas-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Trending</h3>
            <p className="text-gray-400 leading-relaxed">
              Stay updated with what the community is reading now
            </p>
          </div>

          <div className="bi-card group hover:border-metro-purple transition-all">
            <Sparkles size={40} className="text-midas-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">AI Recommendations</h3>
            <p className="text-gray-400 leading-relaxed">
              Personalized suggestions based on your reading taste
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section - Metro Style */}
      <div className="container mx-auto px-8 py-20 max-w-7xl">
        <div className="metro-tile-gold p-12 text-center">
          <h2 className="text-4xl font-display font-light mb-4">
            Join The Golden Circle
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether fiction, non-fiction, or poetry—your literary journey starts here
          </p>
          <Link to="/register" className="inline-block bg-midas-dark text-midas-gold px-12 py-4 font-bold uppercase tracking-wide hover:bg-midas-darkGray transition-all transform hover:scale-105">
            Create Account Now
          </Link>
        </div>
      </div>
    </div>
  );
}
