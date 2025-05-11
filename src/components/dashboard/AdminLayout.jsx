// components/dashboard/AdminLayout.jsx
import Sidebar from "@/components/navbars/Sidebar";

const AdminLayout = ({ children }) => {

  const headerHeightClass = 'h-16';

  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="flex flex-1"> 
        <Sidebar />
        <main className={`ml-64 w-full p-6 pt-[calc(4rem+1.5rem)] lg:pt-[calc(4rem+1.5rem)]`}> 
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;