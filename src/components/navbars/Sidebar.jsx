// app/components/Sidebar.jsx
import Link from 'next/link';

const Sidebar = () => {
  const headerHeightClass = 'top-20';

  return (
    <aside 
      className={`w-64 h-screen bg-gray-800 text-white fixed ${headerHeightClass} left-0 overflow-y-auto`}
    >
      
      <div className="p-6 text-2xl font-bold">Admin Panel</div>
      <nav className="mt-6">
        <ul>
          <li>
            <Link href="/admin/formulas" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Формули
            </Link>
          </li>
          <li>
            <Link href="/admin/formula-orders" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Поръчки
            </Link>
          </li>
          <li>
            <Link href="/admin/packages" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Пакети с точки
            </Link>
          </li>
          <li>
            <Link href="/admin/points-orders" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Пакети точки потребители
            </Link>
          </li>
          <li>
            <Link href="/admin/investments" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Инвестиционни
            </Link>
          </li>
          <li>
            <Link href="/admin/manage-users/create" className="block py-2.5 px-6 hover:bg-gray-700 rounded-md transition-colors duration-150">
              Потребители
            </Link>
          </li>
          {/* Add more navigation items here */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
