import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <Navbar />

            {/* 
                Mobile: Full width, padding for fixed navbar
                Desktop: Centered with max-width constraint
            */}
            <main className="w-full pt-20 pb-8 px-4 md:px-6 lg:px-8">
                <div className="w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;