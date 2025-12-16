import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface PostForm {
  title: string;
  content: string;
  forum_id?: string;
  media?: FileList;
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostForm>();
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const onSubmit = async (data: PostForm) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      if (data.forum_id) formData.append('forum_id', data.forum_id);
      
      if (data.media) {
        Array.from(data.media).forEach(file => {
          formData.append('media', file);
        });
      }

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created successfully!');
      navigate('/feed');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-light text-white mb-2">Create Post</h1>
        <div className="h-1 w-24 bg-midas-gold"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bi-card space-y-6">
        <div>
          <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
            Title (Optional)
          </label>
          <input
            {...register('title')}
            type="text"
            className="input"
            placeholder="GIVE YOUR POST A TITLE..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
            Content *
          </label>
          <textarea
            {...register('content', { required: 'Content is required' })}
            className="input min-h-[200px] resize-none"
            placeholder="WHAT'S ON YOUR MIND? SHARE YOUR THOUGHTS ABOUT A BOOK, CHARACTER, OR THEORY..."
          />
          {errors.content && (
            <p className="text-metro-red text-sm mt-2">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-midas-lightGold mb-3 uppercase tracking-wide">
            Add Images (Optional)
          </label>
          <label className="metro-tile-dark inline-flex items-center space-x-3 cursor-pointer hover:bg-midas-gold hover:text-midas-dark transition-all px-6 py-3">
            <Upload size={20} />
            <span className="font-semibold uppercase text-sm">Choose Images</span>
            <input
              {...register('media')}
              type="file"
              accept="image/*"
              multiple
              max={5}
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              {previews.map((preview, idx) => (
                <img key={idx} src={preview} alt="" className="w-full h-40 object-cover hover:scale-105 transition-transform" />
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold flex-1"
          >
            {isSubmitting ? 'POSTING...' : 'PUBLISH POST'}
          </button>
        </div>
      </form>
    </div>
  );
}
