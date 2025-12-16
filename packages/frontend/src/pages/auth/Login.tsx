import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  login: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/feed');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="bi-card">
      <h2 className="text-3xl font-display font-light text-center mb-8 text-white">Sign In</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
            Email or Username
          </label>
          <input
            {...register('login', { required: 'This field is required' })}
            type="text"
            className="input"
            placeholder="ENTER YOUR EMAIL OR USERNAME"
          />
          {errors.login && (
            <p className="text-metro-red text-sm mt-2">{errors.login.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-midas-lightGold mb-2 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password', { required: 'Password is required' })}
              type={showPassword ? 'text' : 'password'}
              className="input pr-12"
              placeholder="ENTER YOUR PASSWORD"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold w-full"
        >
          {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-midas-gold hover:text-midas-lightGold font-semibold uppercase tracking-wide transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
