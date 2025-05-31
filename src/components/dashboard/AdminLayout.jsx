// components/dashboard/AdminLayout.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navbars/Sidebar"; 
import { Menu as MenuIcon, X} from "lucide-react";

const AdminLayout = ({ children, role }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    
    if (role !== "admin") {
      console.log("[AdminLayout] Role is not admin, redirecting to /");
      router.push("/");
    }
  }, [role, router]);

  
  if (role !== "admin") {
    return <div className="min-h-screen flex justify-center items-center bg-background text-white">Проверка на достъп...</div>; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile Header with Toggle Button - Using Option 1 (Explicit Centering) from previous suggestion */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 flex items-center px-4 z-30 shadow-md">
        {/* Hamburger/Close Button - on the left */}
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center"> {/* Wrapper to ensure consistent size */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="text-gray-300 hover:text-white p-2 rounded-md"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />} {/* X is now defined */}
            </button>
        </div>

        {/* Title - centered */}
        <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-white truncate">Admin Panel</h1>
        </div>

        {/* Right Spacer (to balance the hamburger button for centering the title) */}
        <div className="w-10 flex-shrink-0"></div>
      </header>

      <div className="flex flex-1 pt-16 lg:pt-0">
        <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <main className={`flex-1 w-full lg:ml-64 p-4 sm:p-6 transition-all duration-300 ease-in-out
                         ${isMobileMenuOpen && 'lg:blur-none blur-sm pointer-events-none lg:pointer-events-auto'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;