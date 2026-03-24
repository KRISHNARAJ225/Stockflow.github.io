import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '../Service.js/AuthService';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        if (email && password && name && regUsername) {
          await registerUser({ name, username: regUsername, email, phone, password });
          setIsRegistering(false);
          setPassword('');
          setRegUsername('');
          setName('');
          setPhone('');
          setEmail('');
          alert('Account created successfully! Please sign in.');
        }
      } else {
        if (username && password) {
          const user = await loginUser(username, password);
          onLogin(user);
        }
      }
    } catch (err) {
      setError(isRegistering ? 'Registration failed. Please try again.' : 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex overflow-hidden min-h-[600px]">
        {/* Left Side: Illustration */}
        <div className="hidden md:block w-1/2 relative bg-white p-2">
          <div className="w-full h-full rounded-[20px] overflow-hidden relative">
            <img 
              src={isRegistering ? "/register.png" : "/Login.png"}
              alt={isRegistering ? "Register" : "Login"} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side: Login/Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center bg-white">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm border border-gray-100">
                <img src="/icons.svg" alt="Logo" className="w-6 h-6" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div className="w-6 h-6 bg-black rounded-lg hidden items-center justify-center transform rotate-45">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest"></span>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {isRegistering ? "CREATE ACCOUNT" : "WELCOME BACK"}
              </h1>
              <p className="text-gray-400 text-xs font-medium">
                {isRegistering ? "Enter your details to create a new account" : "Enter your email and password to access your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Enter your full name"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Choose a username"
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </>
              )}

              {isRegistering ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border-2 border-gray-200 rounded-md checked:bg-black checked:border-black transition-all"
                      />
                      <div className="absolute hidden peer-checked:block text-white text-[10px] font-bold">✓</div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-xs font-bold text-gray-900 hover:underline transition-colors">Forgot Password</a>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {error && (
                  <p className="text-red-500 text-xs font-medium text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0a0a0a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transform active:scale-[0.98] transition-all shadow-md shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : isRegistering ? 'Create Account' : 'Sign In'}
                </button>
                
                <button
                  type="button"
                  className="w-full bg-white border border-gray-200 py-3.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  {isRegistering ? "Sign up with Google" : "Sign in with Google"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 font-bold">
                {isRegistering ? "Already have an account?" : "Don't have an account?"} 
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)} 
                  className="text-black hover:underline underline-offset-4 ml-1"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
