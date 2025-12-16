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

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post?.is_liked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
          : p
      ));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-12 w-12 border-4 border-midas-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-midas-lightGold mt-4 uppercase tracking-wide">Loading your feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-light text-white mb-2">Your Feed</h1>
        <div className="h-1 w-24 bg-midas-gold"></div>
      </div>
      
      {posts.length === 0 ? (
        <div className="bi-card text-center py-16">
          <p className="text-gray-400 text-lg mb-4">Your feed is empty!</p>
          <p className="text-gray-500">Follow users or join forums to see posts here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bi-card hover:border-midas-gold transition-all">
              {/* Post Header */}
              <div className="flex items-center mb-6">
                {post.profile_picture ? (
                  <img
                    src={post.profile_picture}
                    alt={post.name}
                    className="w-12 h-12 object-cover border-2 border-midas-gold mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-midas-gold to-midas-darkGold flex items-center justify-center text-midas-dark font-bold mr-4">
                    {post.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white text-lg">{post.name}</p>
                  <p className="text-sm text-midas-lightGold">
                    @{post.username} {post.forum_name && `• in ${post.forum_name}`}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              {post.title && <h3 className="text-2xl font-semibold mb-3 text-white">{post.title}</h3>}
              <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {post.media.map((media, idx) => (
                    <img
                      key={idx}
                      src={media.media_url}
                      alt=""
                      className="w-full h-64 object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center space-x-8 pt-6 border-t border-midas-lightGray">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 font-semibold uppercase text-sm tracking-wide transition-all ${
                    post.is_liked ? 'text-metro-red' : 'text-gray-400 hover:text-metro-red'
                  }`}
                >
                  <Heart size={22} fill={post.is_liked ? 'currentColor' : 'none'} />
                  <span>{post.like_count}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-metro-blue font-semibold uppercase text-sm tracking-wide transition-colors">
                  <MessageCircle size={22} />
                  <span>{post.comment_count}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-metro-green font-semibold uppercase text-sm tracking-wide transition-colors">
                  <Share2 size={22} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
