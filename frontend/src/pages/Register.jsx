import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const Register = () => {
  const [formData, setData] = useState({ username: '', password: '', role: 'SERVER' });
  const navigate = useNavigate();

  const handleReg = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      toast.success("Registration Successful! You can now login.");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || "Error registering");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full z-10 p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Join the Team</h2>
            <p className="text-gray-300">Create your staff account below</p>
          </div>

          <form onSubmit={handleReg} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.username}
                onChange={e => setData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.password}
                onChange={e => setData({ ...formData, password: e.target.value })}
              />
            </div>
            {/* Role selection removed as per user request. Defaulting to SERVER. */}
            <input type="hidden" value={formData.role} />

            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition duration-200 mt-4">
              CREATE ACCOUNT
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            Already registered? <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold underline decoration-2 underline-offset-4">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;