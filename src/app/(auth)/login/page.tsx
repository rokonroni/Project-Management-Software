'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Mail, Lock, User, Briefcase, Code, Sparkles, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer' as 'manager' | 'developer'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading(
      isLogin ? 'Signing you in...' : 'Creating your account...'
    );

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!data.success) {
        toast.error(data.error || 'Something went wrong!', {
          duration: 4000,
          icon: '❌',
        });
        setLoading(false);
      } else {
        toast.success(
          isLogin 
            ? `Welcome back, ${data.user.name}!` 
            : `Account created! Welcome aboard, ${data.user.name}!`,
          {
            duration: 3000,
          }
        );

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;

        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'developer'
        });

        setTimeout(() => {
          const dashboardUrl = data.user.role === 'manager' ? '/manager' : '/developer';
          window.location.href = dashboardUrl;
        }, 1000);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Network error! Please check your connection.', {
        duration: 4000,
        icon: '🔌',
      });
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const handleTabSwitch = (isLoginTab: boolean) => {
    setIsLogin(isLoginTab);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'developer'
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-purple-400/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-blue-400/20 rounded-lg rotate-45 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-pink-400/20 rounded-full animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block text-white space-y-8 animate-slideRight">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-medium">Project Management Software</span>
            </div>
            
            <h1 className="text-6xl font-bold leading-tight">
              Manage Projects
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Streamline your workflow, collaborate with your team, and deliver projects on time with our powerful management platform.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Reliable</h3>
                  <p className="text-sm text-gray-400">Your data is encrypted and protected</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-gray-400">Work together seamlessly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full animate-slideUp">
            <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="flex items-center just gap-3 mb-3 text-center justify-center ">
                  <div>
                      <h2 className="text-2xl font-bold">Welcome</h2>
                      <p className="text-blue-100 text-sm">Let's get you started</p>
                  </div>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="p-8 pb-0">
                <div className="flex gap-2 p-2 bg-gray-100 rounded-2xl">
                  <button
                    onClick={() => handleTabSwitch(true)}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isLogin
                        ? 'bg-white text-gray-900 shadow-lg scale-105'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LogIn size={18} className="inline mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={() => handleTabSwitch(false)}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      !isLogin
                        ? 'bg-white text-gray-900 shadow-lg scale-105'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <UserPlus size={18} className="inline mr-2" />
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {!isLogin && (
                  <div className="space-y-2 animate-slideDown">
                    <label className="block text-sm font-semibold text-white">
                      <User size={16} className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input text-white"
                      placeholder="John Doe"
                      required={!isLogin}
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input text-white"
                    placeholder="mail@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    <Lock size={16} className="inline mr-2" />
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2 animate-slideDown">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Briefcase size={16} className="inline mr-2" />
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'developer' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === 'developer'
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <Code className={`w-6 h-6 mx-auto mb-2 ${
                          formData.role === 'developer' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          formData.role === 'developer' ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          Developer
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'manager' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === 'manager'
                            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <Briefcase className={`w-6 h-6 mx-auto mb-2 ${
                          formData.role === 'manager' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          formData.role === 'manager' ? 'text-purple-900' : 'text-gray-600'
                        }`}>
                          Manager
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary mt-6 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        {isLogin ? <LogIn size={18} className="inline mr-2" /> : <UserPlus size={18} className="inline mr-2" />}
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>

                {isLogin && (
                  <div className="text-center">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Forgot your password?
                    </a>
                  </div>
                )}
              </form>
            </div>

            {/* Mobile Branding */}
            <div className="lg:hidden mt-8 text-center text-white">
              <p className="text-sm text-gray-400">
                © 2025 Project Management System. All rights reserved.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}