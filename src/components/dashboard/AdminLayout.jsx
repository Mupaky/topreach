// components/dashboard/AdminLayout.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/navbars/Sidebar";

const AdminLayout = ({ children, role }) => {
  const router = useRouter();

  useEffect(() => {
    if (role !== "admin") {
      router.push("/");
    }
  }, [role]);

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