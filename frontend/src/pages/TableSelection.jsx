import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const TableSelection = () => {
    const navigate = useNavigate();

    const selectTable = (tableNo) => {
        // Save table to localStorage
        localStorage.setItem('tableNo', tableNo);

        // Navigate to home
        navigate('/home');
    };

    const tables = [1, 2, 3, 4];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-2xl p-6 z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl">

                    {/* Logo and Title */}
                    <div className="text-center mb-10">
                        <img src={logo} alt="ScanFeast Logo" className="w-24 h-24 mx-auto mb-4 drop-shadow-xl" />
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Select Your Table
                        </h1>
                        <p className="text-gray-300 font-medium text-lg">
                            Choose your table number to continue
                        </p>
                    </div>

                    {/* 2x2 Table Grid */}
                    <div className="grid grid-cols-2 gap-6 md:gap-8 mb-8">
                        {tables.map((tableNo) => (
                            <button
                                key={tableNo}
                                onClick={() => selectTable(tableNo)}
                                className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border-2 border-gray-600 hover:border-orange-500 rounded-2xl p-8 md:p-12 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 active:scale-95"
                            >
                                {/* Table Icon */}
                                <div className="text-6xl md:text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    🪑
                                </div>

                                {/* Table Number */}
                                <div className="text-white">
                                    <p className="text-sm md:text-base font-medium text-gray-400 mb-1">Table</p>
                                    <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                                        {tableNo}
                                    </p>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 rounded-2xl transition-all duration-300"></div>
                            </button>
                        ))}
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-800/60 border border-gray-600 text-white py-4 rounded-xl font-bold hover:bg-gray-700/60 hover:border-gray-500 transition flex justify-center items-center gap-2"
                    >
                        <span>←</span>
                        <span>Back to Login</span>
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    © 2026 ScanFeast. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default TableSelection;
