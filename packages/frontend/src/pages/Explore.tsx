// Similar to Feed but fetches from /posts/explore
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  username: string;
  name: string;
  profile_picture?: string;
  forum_name?: string;
  media?: Array<{ media_url: string; media_type: string }>;
}

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplore();
  }, []);

  const fetchExplore = async () => {
    try {
      const response = await api.get('/posts/explore');
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-12 w-12 border-4 border-midas-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-midas-lightGold mt-4 uppercase tracking-wide">Discovering amazing content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-light text-white mb-2">Explore</h1>
        <div className="h-1 w-24 bg-midas-gold mb-4"></div>
        <p className="text-midas-lightGold uppercase tracking-wide text-sm">Discover trending posts from the community</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map(post => (
          <div key={post.id} className="metro-tile-dark hover:shadow-gold transition-all">
            <div className="flex items-center mb-4">
              {post.profile_picture ? (
                <img src={post.profile_picture} alt={post.name} className="w-12 h-12 object-cover border-2 border-midas-gold mr-3" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-midas-gold to-midas-darkGold flex items-center justify-center text-midas-dark font-bold mr-3">
                  {post.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{post.name}</p>
                <p className="text-sm text-midas-lightGold">@{post.username}</p>
              </div>
            </div>
            {post.title && <h3 className="text-xl font-semibold mb-3 text-white">{post.title}</h3>}
            <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
            <div className="flex items-center space-x-6 text-gray-400 pt-4 border-t border-midas-lightGray">
              <button className="flex items-center space-x-2 hover:text-metro-red transition-colors">
                <Heart size={20} />
                <span className="font-semibold">{post.like_count}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-metro-blue transition-colors">
                <MessageCircle size={20} />
                <span className="font-semibold">{post.comment_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
