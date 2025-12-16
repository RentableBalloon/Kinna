import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Check, X, Upload, ChevronDown, ChevronRight } from 'lucide-react';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  age: number;
  gender: string;
  profile_picture?: FileList;
}

interface PreferenceNode {
  id: string;
  name: string;
  type: 'genre' | 'subgenre' | 'author' | 'series' | 'book';
  children?: PreferenceNode[];
}

const PREFERENCE_DATA: PreferenceNode[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    type: 'genre',
    children: [
      {
        id: 'high-fantasy',
        name: 'High Fantasy',
        type: 'subgenre',
        children: [
          {
            id: 'jrr-tolkien',
            name: 'J.R.R. Tolkien',
            type: 'author',
            children: [
              { id: 'lotr', name: 'The Lord of the Rings', type: 'series' },
              { id: 'hobbit', name: 'The Hobbit', type: 'book' },
              { id: 'silmarillion', name: 'The Silmarillion', type: 'book' }
            ]
          },
          {
            id: 'brandon-sanderson',
            name: 'Brandon Sanderson',
            type: 'author',
            children: [
              { id: 'mistborn', name: 'Mistborn', type: 'series' },
              { id: 'stormlight', name: 'The Stormlight Archive', type: 'series' },
              { id: 'warbreaker', name: 'Warbreaker', type: 'book' }
            ]
          }
        ]
      },
      {
        id: 'romantasy',
        name: 'Romantasy',
        type: 'subgenre',
        children: [
          {
            id: 'sarah-j-maas',
            name: 'Sarah J. Maas',
            type: 'author',
            children: [
              { id: 'acotar', name: 'A Court of Thorns and Roses', type: 'series' },
              { id: 'tog', name: 'Throne of Glass', type: 'series' },
              { id: 'cc', name: 'Crescent City', type: 'series' }
            ]
          },
          {
            id: 'rebecca-yarros',
            name: 'Rebecca Yarros',
            type: 'author',
            children: [
              { id: 'fourth-wing', name: 'The Empyrean (Fourth Wing)', type: 'series' },
              { id: 'flight-furies', name: 'The Flight & Glory Series', type: 'series' }
            ]
          },
          {
            id: 'jennifer-l-armentrout',
            name: 'Jennifer L. Armentrout',
            type: 'author',
            children: [
              { id: 'fbaa', name: 'From Blood and Ash', type: 'series' },
              { id: 'covenant', name: 'Covenant Series', type: 'series' }
            ]
          }
        ]
      },
      {
        id: 'urban-fantasy',
        name: 'Urban Fantasy',
        type: 'subgenre',
        children: [
          {
            id: 'rick-riordan',
            name: 'Rick Riordan',
            type: 'author',
            children: [
              { id: 'pjo', name: 'Percy Jackson & the Olympians', type: 'series' },
              { id: 'hoo', name: 'Heroes of Olympus', type: 'series' },
              { id: 'kane-chronicles', name: 'The Kane Chronicles', type: 'series' },
              { id: 'magnus-chase', name: 'Magnus Chase', type: 'series' }
            ]
          },
          {
            id: 'cassandra-clare',
            name: 'Cassandra Clare',
            type: 'author',
            children: [
              { id: 'tmi', name: 'The Mortal Instruments', type: 'series' },
              { id: 'tid', name: 'The Infernal Devices', type: 'series' }
            ]
          }
        ]
      },
      {
        id: 'epic-fantasy',
        name: 'Epic Fantasy',
        type: 'subgenre',
        children: [
          {
            id: 'george-rr-martin',
            name: 'George R.R. Martin',
            type: 'author',
            children: [
              { id: 'asoiaf', name: 'A Song of Ice and Fire', type: 'series' }
            ]
          },
          {
            id: 'robert-jordan',
            name: 'Robert Jordan',
            type: 'author',
            children: [
              { id: 'wot', name: 'The Wheel of Time', type: 'series' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'scifi',
    name: 'Science Fiction',
    type: 'genre',
    children: [
      {
        id: 'hard-scifi',
        name: 'Hard Sci-Fi',
        type: 'subgenre',
        children: [
          {
            id: 'andy-weir',
            name: 'Andy Weir',
            type: 'author',
            children: [
              { id: 'martian', name: 'The Martian', type: 'book' },
              { id: 'project-hail-mary', name: 'Project Hail Mary', type: 'book' }
            ]
          },
          {
            id: 'neal-stephenson',
            name: 'Neal Stephenson',
            type: 'author',
            children: [
              { id: 'snow-crash', name: 'Snow Crash', type: 'book' },
              { id: 'cryptonomicon', name: 'Cryptonomicon', type: 'book' },
              { id: 'seveneves', name: 'Seveneves', type: 'book' }
            ]
          }
        ]
      },
      {
        id: 'space-opera',
        name: 'Space Opera',
        type: 'subgenre',
        children: [
          {
            id: 'james-sa-corey',
            name: 'James S.A. Corey',
            type: 'author',
            children: [
              { id: 'expanse', name: 'The Expanse', type: 'series' }
            ]
          },
          {
            id: 'becky-chambers',
            name: 'Becky Chambers',
            type: 'author',
            children: [
              { id: 'wayfarers', name: 'Wayfarers', type: 'series' }
            ]
          }
        ]
      },
      {
        id: 'dystopian',
        name: 'Dystopian',
        type: 'subgenre',
        children: [
          {
            id: 'suzanne-collins',
            name: 'Suzanne Collins',
            type: 'author',
            children: [
              { id: 'hunger-games', name: 'The Hunger Games', type: 'series' }
            ]
          },
          {
            id: 'margaret-atwood',
            name: 'Margaret Atwood',
            type: 'author',
            children: [
              { id: 'handmaids-tale', name: "The Handmaid's Tale", type: 'book' },
              { id: 'oryx-crake', name: 'Oryx and Crake', type: 'book' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mystery-thriller',
    name: 'Mystery & Thriller',
    type: 'genre',
    children: [
      {
        id: 'detective',
        name: 'Detective/Crime',
        type: 'subgenre',
        children: [
          {
            id: 'agatha-christie',
            name: 'Agatha Christie',
            type: 'author',
            children: [
              { id: 'poirot', name: 'Hercule Poirot Series', type: 'series' },
              { id: 'marple', name: 'Miss Marple Series', type: 'series' }
            ]
          },
          {
            id: 'arthur-conan-doyle',
            name: 'Arthur Conan Doyle',
            type: 'author',
            children: [
              { id: 'sherlock', name: 'Sherlock Holmes', type: 'series' }
            ]
          }
        ]
      },
      {
        id: 'psychological-thriller',
        name: 'Psychological Thriller',
        type: 'subgenre',
        children: [
          {
            id: 'gillian-flynn',
            name: 'Gillian Flynn',
            type: 'author',
            children: [
              { id: 'gone-girl', name: 'Gone Girl', type: 'book' },
              { id: 'sharp-objects', name: 'Sharp Objects', type: 'book' }
            ]
          },
          {
            id: 'paula-hawkins',
            name: 'Paula Hawkins',
            type: 'author',
            children: [
              { id: 'girl-on-train', name: 'The Girl on the Train', type: 'book' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'romance',
    name: 'Romance',
    type: 'genre',
    children: [
      {
        id: 'contemporary-romance',
        name: 'Contemporary Romance',
        type: 'subgenre',
        children: [
          {
            id: 'colleen-hoover',
            name: 'Colleen Hoover',
            type: 'author',
            children: [
              { id: 'it-ends-with-us', name: 'It Ends With Us', type: 'book' },
              { id: 'verity', name: 'Verity', type: 'book' },
              { id: 'ugly-love', name: 'Ugly Love', type: 'book' }
            ]
          },
          {
            id: 'emily-henry',
            name: 'Emily Henry',
            type: 'author',
            children: [
              { id: 'beach-read', name: 'Beach Read', type: 'book' },
              { id: 'book-lovers', name: 'Book Lovers', type: 'book' }
            ]
          }
        ]
      },
      {
        id: 'historical-romance',
        name: 'Historical Romance',
        type: 'subgenre',
        children: [
          {
            id: 'julia-quinn',
            name: 'Julia Quinn',
            type: 'author',
            children: [
              { id: 'bridgerton', name: 'Bridgerton Series', type: 'series' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'horror',
    name: 'Horror',
    type: 'genre',
    children: [
      {
        id: 'stephen-king',
        name: 'Stephen King',
        type: 'author',
        children: [
          { id: 'it', name: 'It', type: 'book' },
          { id: 'the-shining', name: 'The Shining', type: 'book' },
          { id: 'pet-sematary', name: 'Pet Sematary', type: 'book' },
          { id: 'dark-tower', name: 'The Dark Tower', type: 'series' }
        ]
      }
    ]
  },
  {
    id: 'literary-fiction',
    name: 'Literary Fiction',
    type: 'genre',
    children: [
      {
        id: 'classics',
        name: 'Classics',
        type: 'subgenre',
        children: [
          {
            id: 'jane-austen',
            name: 'Jane Austen',
            type: 'author',
            children: [
              { id: 'pride-prejudice', name: 'Pride and Prejudice', type: 'book' },
              { id: 'sense-sensibility', name: 'Sense and Sensibility', type: 'book' }
            ]
          },
          {
            id: 'f-scott-fitzgerald',
            name: 'F. Scott Fitzgerald',
            type: 'author',
            children: [
              { id: 'great-gatsby', name: 'The Great Gatsby', type: 'book' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ya',
    name: 'Young Adult',
    type: 'genre',
    children: [
      {
        id: 'jk-rowling',
        name: 'J.K. Rowling',
        type: 'author',
        children: [
          { id: 'harry-potter', name: 'Harry Potter', type: 'series' }
        ]
      },
      {
        id: 'john-green',
        name: 'John Green',
        type: 'author',
        children: [
          { id: 'tfios', name: 'The Fault in Our Stars', type: 'book' },
          { id: 'looking-alaska', name: 'Looking for Alaska', type: 'book' }
        ]
      }
    ]
  }
];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const username = watch('username');
  const password = watch('password');

  useEffect(() => {
    if (username && username.length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const response = await api.get(`/auth/check-username/${username}`);
          setUsernameAvailable(response.data.available);
        } catch (error) {
          setUsernameAvailable(null);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);

  const onSubmit = async (data: RegisterForm) => {
    if (selectedPreferences.size < 5) {
      toast.error('Please select at least 5 preferences (genres, authors, series, or books)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('age', data.age.toString());
      formData.append('gender', data.gender);

      if (data.profile_picture && data.profile_picture[0]) {
        formData.append('profile_picture', data.profile_picture[0]);
      }

      const preferences = Array.from(selectedPreferences).map(prefId => {
        const node = findNodeById(PREFERENCE_DATA, prefId);
        return node ? { type: node.type, value: node.name } : null;
      }).filter(Boolean);
      
      formData.append('preferences', JSON.stringify(preferences));

      const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAuth(response.data.user, response.data.token);
      toast.success('Welcome to Kinna!');
      navigate('/feed');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  const findNodeById = (nodes: PreferenceNode[], id: string): PreferenceNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePreference = (id: string) => {
    const newSelected = new Set(selectedPreferences);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPreferences(newSelected);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderPreferenceNode = (node: PreferenceNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPreferences.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const getNodeColor = () => {
      switch (node.type) {
        case 'genre': return 'from-midas-gold to-midas-darkGold';
        case 'subgenre': return 'from-metro-purple to-metro-blue';
        case 'author': return 'from-metro-green to-metro-blue';
        case 'series': return 'from-metro-orange to-metro-red';
        case 'book': return 'from-midas-darkGold to-midas-bronze';
        default: return 'from-midas-mediumGray to-midas-lightGray';
      }
    };

    return (
      <div key={node.id} className="mb-2" style={{ marginLeft: `${depth * 1.5}rem` }}>
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpanded(node.id)}
              className="text-midas-gold hover:text-midas-lightGold transition-colors"
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => togglePreference(node.id)}
            className={`px-4 py-2 font-semibold text-sm uppercase tracking-wide transition-all flex items-center gap-2 ${
              isSelected
                ? `bg-gradient-to-br ${getNodeColor()} text-midas-dark`
                : 'bg-midas-mediumGray text-gray-400 hover:bg-midas-lightGray hover:text-white'
            } ${!hasChildren && depth > 0 ? 'ml-8' : ''}`}
          >
            {isSelected && <Check size={16} />}
            <span>{node.name}</span>
            <span className="text-xs opacity-70">({node.type})</span>
          </button>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-2 ml-4 border-l-2 border-midas-gold/20 pl-2">
            {node.children!.map(child => renderPreferenceNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bi-card max-h-[85vh] overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-light text-white mb-2">Join Kinna</h2>
        <p className="text-midas-lightGold text-sm uppercase tracking-wide">Step {step} of 2</p>
      </div>

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
              Username *
            </label>
            <div className="relative">
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'At least 3 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores' }
                })}
                type="text"
                className="input pr-12"
                placeholder="YOUR_USERNAME"
              />
              {usernameAvailable !== null && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check size={22} className="text-metro-green" />
                  ) : (
                    <X size={22} className="text-metro-red" />
                  )}
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-metro-red text-sm mt-2">{errors.username.message}</p>
            )}
            {usernameAvailable === false && (
              <p className="text-metro-red text-sm mt-2">Username already taken</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="input"
              placeholder="JOHN DOE"
            />
            {errors.name && (
              <p className="text-metro-red text-sm mt-2">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
                Age *
              </label>
              <input
                {...register('age', {
                  required: 'Age is required',
                  min: { value: 13, message: 'Must be at least 13 years old' }
                })}
                type="number"
                className="input"
                placeholder="18"
              />
              {errors.age && (
                <p className="text-metro-red text-sm mt-2">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
                Gender
              </label>
              <select {...register('gender')} className="input bg-midas-darkGray">
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
              Email *
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
              })}
              type="email"
              className="input"
              placeholder="YOU@EXAMPLE.COM"
            />
            {errors.email && (
              <p className="text-metro-red text-sm mt-2">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
              Password *
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' }
                })}
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-midas-gold hover:text-midas-lightGold transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-metro-red text-sm mt-2">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
              Confirm Password *
            </label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match'
              })}
              type="password"
              className="input"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-metro-red text-sm mt-2">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn-gold w-full mt-6">
            Next: Profile & Preferences
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-3 uppercase tracking-wide">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center space-x-4">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-24 h-24 object-cover border-2 border-midas-gold" />
              ) : (
                <div className="w-24 h-24 bg-midas-mediumGray border-2 border-midas-gold flex items-center justify-center">
                  <Upload size={28} className="text-midas-gold" />
                </div>
              )}
              <label className="metro-tile-dark px-6 py-3 cursor-pointer hover:bg-midas-gold hover:text-midas-dark transition-all">
                <span className="font-semibold uppercase text-sm">Choose Image</span>
                <input
                  {...register('profile_picture')}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-midas-lightGold mb-3 uppercase tracking-wide">
              Reading Preferences (Select at least 5) *
            </label>
            <p className="text-gray-400 text-xs mb-4">
              Click genres to expand subgenres and authors. Click authors to see their series and books.
              Select any combination of genres, subgenres, authors, series, or specific books.
            </p>
            
            <div className="bg-midas-darkGray p-4 max-h-96 overflow-y-auto border border-midas-gold/20">
              {PREFERENCE_DATA.map(node => renderPreferenceNode(node, 0))}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-sm font-semibold ${
                selectedPreferences.size >= 5 ? 'text-metro-green' : 'text-metro-orange'
              }`}>
                Selected: {selectedPreferences.size} {selectedPreferences.size >= 5 ? '✓' : `(${5 - selectedPreferences.size} more needed)`}
              </p>
              {selectedPreferences.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPreferences(new Set())}
                  className="text-metro-red text-xs uppercase tracking-wide hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || usernameAvailable === false}
              className="btn-gold flex-1"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-midas-gold hover:text-midas-lightGold font-semibold uppercase tracking-wide transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
