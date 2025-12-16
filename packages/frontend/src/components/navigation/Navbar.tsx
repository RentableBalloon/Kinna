import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, PlusCircle, Bell, User, Settings, LogOut, BookOpen, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-midas-darkGray border-b-2 border-midas-gold/20 sticky top-0 z-50 shadow-metro">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <Crown size={28} className="text-midas-gold group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-2xl font-display font-light text-white tracking-wider">KINNA</span>
              <div className="h-0.5 w-0 group-hover:w-full bg-midas-gold transition-all duration-300"></div>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center space-x-2">
            <Link to="/feed" className="metro-tile-dark px-4 py-2 flex items-center space-x-2 hover:bg-metro-blue transition-colors">
              <Home size={20} />
              <span className="hidden md:inline font-semibold text-sm uppercase">Feed</span>
            </Link>
            <Link to="/explore" className="metro-tile-dark px-4 py-2 flex items-center space-x-2 hover:bg-metro-purple transition-colors">
              <Compass size={20} />
              <span className="hidden md:inline font-semibold text-sm uppercase">Explore</span>
            </Link>
            <Link to="/forums" className="metro-tile-dark px-4 py-2 flex items-center space-x-2 hover:bg-metro-green transition-colors">
              <BookOpen size={20} />
              <span className="hidden md:inline font-semibold text-sm uppercase">Forums</span>
            </Link>
            <Link to="/search" className="metro-tile-dark px-4 py-2 flex items-center space-x-2 hover:bg-metro-orange transition-colors">
              <Search size={20} />
              <span className="hidden md:inline font-semibold text-sm uppercase">Search</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <Link to="/create-post" className="btn-gold flex items-center space-x-2 py-2">
              <PlusCircle size={18} />
              <span className="hidden md:inline">Create</span>
            </Link>

            <button className="relative metro-tile-dark px-3 py-2 hover:bg-midas-gold hover:text-midas-dark transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 bg-metro-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 metro-tile-dark px-3 py-2 hover:border-midas-gold border-2 border-transparent transition-all"
              >
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-8 h-8 object-cover border-2 border-midas-gold"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-midas-gold to-midas-darkGold flex items-center justify-center text-midas-dark font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-midas-mediumGray shadow-metro border-l-4 border-midas-gold">
                  <Link
                    to={`/profile/${user?.username}`}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-midas-lightGray transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={18} className="text-midas-gold" />
                    <span className="font-semibold uppercase text-sm">Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-midas-lightGray transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={18} className="text-midas-gold" />
                    <span className="font-semibold uppercase text-sm">Settings</span>
                  </Link>
                  <div className="h-px bg-midas-lightGray my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-metro-red w-full text-left transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-semibold uppercase text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
