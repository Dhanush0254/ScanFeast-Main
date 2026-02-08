import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound404 = () => {
    const navigate = useNavigate();
    const hasTable = localStorage.getItem('tableNo');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-2xl p-6 z-10 text-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl">

                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="relative inline-block">
                            {/* Broken Plate SVG Illustration */}
                            <svg
                                className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6"
                                viewBox="0 0 200 200"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Plate Left Half */}
                                <path
                                    d="M30 100 Q30 50, 70 30 Q90 20, 100 20 L100 100 L30 100 Z"
                                    fill="url(#gradient1)"
                                    opacity="0.9"
                                />
                                {/* Plate Right Half */}
                                <path
                                    d="M170 100 Q170 50, 130 30 Q110 20, 100 20 L100 100 L170 100 Z"
                                    fill="url(#gradient2)"
                                    opacity="0.9"
                                    transform="translate(10, 10)"
                                />
                                {/* Crack Lines */}
                                <line x1="100" y1="20" x2="95" y2="100" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
                                <line x1="100" y1="40" x2="105" y2="100" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />

                                {/* Fork (left) */}
                                <g transform="translate(40, 120) rotate(-30)">
                                    <rect x="0" y="0" width="4" height="50" rx="2" fill="#f97316" />
                                    <rect x="-6" y="0" width="3" height="20" rx="1.5" fill="#f97316" />
                                    <rect x="7" y="0" width="3" height="20" rx="1.5" fill="#f97316" />
                                </g>

                                {/* Spoon (right) */}
                                <g transform="translate(155, 120) rotate(30)">
                                    <ellipse cx="2" cy="8" rx="6" ry="8" fill="#f97316" />
                                    <rect x="0" y="15" width="4" height="45" rx="2" fill="#f97316" />
                                </g>

                                {/* Gradients */}
                                <defs>
                                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fed7aa" />
                                        <stop offset="100%" stopColor="#fdba74" />
                                    </linearGradient>
                                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fdba74" />
                                        <stop offset="100%" stopColor="#fb923c" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* 404 Text */}
                    <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
                        404
                    </h1>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist or you don't have access to it.
                        Please check the URL or return to the login page.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1 transition duration-200"
                        >
                            🏠 Back to Login
                        </button>

                        {hasTable && (
                            <button
                                onClick={() => navigate('/home')}
                                className="w-full bg-gray-800/60 border-2 border-gray-600 text-white py-4 px-8 rounded-xl font-bold hover:bg-gray-700/60 hover:border-orange-500 transition duration-200"
                            >
                                🍽️ Go to Menu
                            </button>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <p className="text-gray-500 text-sm">
                            Need help? Contact our staff or try scanning the QR code again.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2026 ScanFeast. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default NotFound404;
