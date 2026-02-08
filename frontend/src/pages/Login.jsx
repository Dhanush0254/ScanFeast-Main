import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import logo from '../assets/logo.png'; // Please ensure logo.png is in src/assets/

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('username', username);
      localStorage.setItem('userId', res.data.id || username);

      if (res.data.role === 'ADMIN') navigate('/admin');
      else if (res.data.role === 'KITCHEN') navigate('/kitchen');
      else if (res.data.role === 'SERVER') navigate('/server');
      else toast.error("Unknown Role");
    } catch (err) {
      toast.error("Invalid Login");
    }
  };

  const handleSkip = () => {
    navigate('/table-selection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-6 z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">

          {/* Logo Section */}
          <div className="text-center mb-8">
            <img src={logo} alt="ScanFeast Logo" className="w-32 h-32 mx-auto mb-4 drop-shadow-xl" />


            <h1 className="text-4xl font-black text-white tracking-tight mb-2">ScanFeast</h1>
            <p className="text-gray-300 font-medium">Restaurant Automation</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 transition duration-200">
              LOG IN
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400 bg-gray-900/50 rounded">OR</span>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="w-full bg-gray-800/80 border border-gray-600 text-white py-4 rounded-xl font-bold hover:bg-gray-700 transition flex justify-center items-center gap-2 group"
          >
            <span className="text-2xl group-hover:scale-110 transition">📱</span>
            <span>Customer Scan Entry</span>
          </button>

          <p className="text-center mt-8 text-gray-400 text-sm">
            New Staff? <Link to="/register" className="text-orange-400 hover:text-orange-300 font-bold underline decoration-2 underline-offset-4">Register Here</Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 ScanFeast. All rights reserved.
        </p>
      </div>
    </div>
  );
};
export default Login;