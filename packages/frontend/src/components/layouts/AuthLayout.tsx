import { Outlet } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-midas-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-midas-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-midas-darkGold rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown size={64} className="text-midas-gold" />
          </div>
          <h1 className="text-5xl font-display font-light text-white mb-2 tracking-wider">KINNA</h1>
          <div className="flex items-center justify-center space-x-2 text-midas-lightGold">
            <Sparkles size={16} />
            <p className="uppercase tracking-widest text-sm">Premium Reader Network</p>
            <Sparkles size={16} />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
