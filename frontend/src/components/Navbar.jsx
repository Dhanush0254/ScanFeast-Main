import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hide navbar on specific routes
    if (['/', '/register', '/payment'].includes(location.pathname)) return null;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 w-full bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="ScanFeast Logo" className="h-10 w-10 object-contain" />
                        <span className="text-2xl font-black text-orange-600 tracking-tight">SCANFEAST</span>
                        {role === 'ADMIN' && <span className="hidden sm:inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold ml-2">MANAGER MODE</span>}
                        {role === 'KITCHEN' && <span className="hidden sm:inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold ml-2">KITCHEN MODE</span>}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {!role && (
                            <>
                                <Link to="/home" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    🏠 Home
                                </Link>
                                <Link to="/cart" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    🛒 Cart
                                </Link>
                                <Link to="/orders" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    📋 My Orders
                                </Link>
                                <Link to="/faq" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    ❓ FAQ
                                </Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition">
                                    Logout
                                </button>
                            </>
                        )}
                        {role === 'ADMIN' && (
                            <>
                                <Link to="/admin" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    Dashboard
                                </Link>
                                <Link to="/admin/items" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    Items
                                </Link>
                                <Link to="/admin/faq" className="font-medium text-gray-600 hover:text-orange-600 transition">
                                    FAQ
                                </Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-black text-white rounded font-bold text-sm hover:bg-gray-800 transition">
                                    LOGOUT
                                </button>
                            </>
                        )}
                        {role === 'KITCHEN' && (
                            <button onClick={handleLogout} className="px-4 py-2 bg-black text-white rounded font-bold text-sm hover:bg-gray-800 transition">
                                LOGOUT
                            </button>
                        )}
                        {role === 'SERVER' && (
                            <button onClick={handleLogout} className="px-4 py-2 bg-cyan-600 text-white rounded font-bold text-sm hover:bg-cyan-700 transition">
                                LOGOUT
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger Button - High Contrast - Visible for ALL roles */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-orange-600 hover:text-orange-700 focus:outline-none p-2 bg-orange-50 rounded-lg"
                            aria-label="Open Menu"
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t-2 border-orange-100 shadow-2xl absolute w-full left-0 z-50">
                    <div className="px-4 pt-4 pb-6 space-y-2 sm:px-3">

                        {/* Mobile Role Badges */}
                        <div className="px-3 py-2">
                            {role === 'ADMIN' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">MANAGER MODE</span>}
                            {role === 'KITCHEN' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">KITCHEN MODE</span>}
                        </div>

                        {!role && (
                            <>
                                <Link
                                    to="/home"
                                    onClick={closeMenu}
                                    className="block px-4 py-3 rounded-xl text-lg font-bold text-gray-800 hover:text-white hover:bg-orange-500 transition"
                                >
                                    🏠 Home
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={closeMenu}
                                    className="block px-4 py-3 rounded-xl text-lg font-bold text-gray-800 hover:text-white hover:bg-orange-500 transition"
                                >
                                    🛒 Cart
                                </Link>
                                <Link
                                    to="/orders"
                                    onClick={closeMenu}
                                    className="block px-4 py-3 rounded-xl text-lg font-bold text-gray-800 hover:text-white hover:bg-orange-500 transition"
                                >
                                    📋 My Orders
                                </Link>

                                <Link
                                    to="/faq"
                                    onClick={closeMenu}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                                >
                                    ❓ FAQ
                                </Link>
                                <div className="pt-2">
                                    <button
                                        onClick={() => { closeMenu(); handleLogout(); }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-lg font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                        {role === 'ADMIN' && (
                            <>
                                <Link
                                    to="/admin"
                                    onClick={closeMenu}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/items"
                                    onClick={closeMenu}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                                >
                                    Items
                                </Link>
                                <Link
                                    to="/admin/faq"
                                    onClick={closeMenu}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50"
                                >
                                    FAQ
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); closeMenu(); }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                        {role === 'KITCHEN' && (
                            <button
                                onClick={() => { handleLogout(); closeMenu(); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        )}
                        {role === 'SERVER' && (
                            <button
                                onClick={() => { handleLogout(); closeMenu(); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;