import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Feed from './pages/Feed';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForumList from './pages/forums/ForumList';
import ForumDetail from './pages/forums/ForumDetail';
import CreatePost from './pages/posts/CreatePost';
import PostDetail from './pages/posts/PostDetail';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/forums" element={<ForumList />} />
        <Route path="/forums/:forumId" element={<ForumDetail />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="/profile/:username" element={<Profile />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/feed" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/feed" /> : <Register />}
          />
        </Route>

        {/* Protected routes */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
