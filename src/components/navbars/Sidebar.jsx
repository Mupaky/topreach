// app/components/navbars/Sidebar.jsx (Assuming this is the correct path)
"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { Home, ListChecks, Users, FileText, Settings, Package, ShoppingCart, DollarSign, UserPlus, X } from "lucide-react"; // Example icons

const navLinks = [
    // { href: "/admin/dashboard", label: "Табло", icon: Home }, // Uncomment if you have a dashboard
    { href: "/admin/formulas", label: "Формули", icon: ListChecks },
    { href: "/admin/formula-orders", label: "Поръчки по Формули", icon: ShoppingCart },
    { href: "/admin/packages", label: "Шаблони Пакети Точки", icon: Package },
    { href: "/admin/points-orders", label: "Поръчки Пакети Точки", icon: FileText },
    // { href: "/admin/investments", label: "Инвестиционни", icon: DollarSign }, // Uncomment if used
    { href: "/admin/manage-users/list", label: "Потребители", icon: Users },
];
const isActiveLink = (pathname, href) => {
  if (pathname === href) {
      return true;
  }
  if (href !== "/admin" && pathname.startsWith(href)) { 
      return true;
  }

  if (href === "/admin/dashboard" && pathname === "/admin") {
       return true;
  }
  return false;
};


export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  // Function to close the mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    if (isOpen) { // Only try to close if it's open (mobile view)
      setIsOpen(false);
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <nav className={isMobile ? "mt-6" : "mt-10"}> {/* Different top margin for mobile if needed */}
      <ul>
        {navLinks.map((link) => {
          const isActive = isActiveLink(pathname, link.href);
          return (
            <li key={link.href} className="mb-1.5"> {/* Slightly more space between items */}
              <Link
                href={link.href}
                onClick={handleLinkClick} // Close sidebar on link click in mobile
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium
                  transition-colors duration-150 ease-in-out group
                  ${isActive
                    ? "bg-accent text-white shadow-md" // Active state styling
                    : "text-gray-300 hover:bg-gray-700/80 hover:text-white" // Default and hover
                  }
                `}
              >
                {link.icon && <link.icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />}
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* --- Desktop Sidebar (Visible on lg screens and up) --- */}
      <aside
        className={`
          hidden lg:flex lg:flex-col w-64 bg-gray-800 text-white
          fixed top-0 left-0 h-full z-20 
          border-r border-gray-700 shadow-lg
          overflow-y-auto p-4 pt-6 
        `}
      >
        <div className="mb-8 text-center">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-white hover:text-accentLighter transition-colors">
            Admin Panel
          </Link>
        </div>
        {renderNavLinks()}
      </aside>

      {/* --- Mobile Off-canvas Menu (Overlay and Sidebar) --- */}
      {/* Overlay - visible when mobile menu is open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)} // Click on backdrop to close
          aria-hidden="true"
        ></div>
      )}

      {/* Actual Mobile Sidebar - slides in from the left */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full bg-gray-800 text-white 
          w-64 transform transition-transform duration-300 ease-in-out 
          z-40 shadow-2xl border-r border-gray-700
          overflow-y-auto p-4 pt-6 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 id="mobile-menu-title" className="text-xl font-bold text-white">
            Admin Menu
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        {renderNavLinks(true)} {/* Pass true to indicate it's for mobile, if needed for styling */}
      </aside>
    </>
  );
};