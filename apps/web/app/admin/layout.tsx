import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionMetaStr = cookieStore.get('flockiq_session_meta')?.value;
  
  let customer = null;
  if (sessionMetaStr) {
    try {
      const meta = JSON.parse(sessionMetaStr);
      customer = meta.customer;
    } catch (e) {
      console.error('Failed to parse session meta', e);
    }
  }

  // Removed development backdoor to enforce strict RBAC

  if (!customer) {
    redirect('/login');
  }

  // Enforce RBAC at layout level
  if (customer.role !== 'admin' && customer.role !== 'agent') {
    redirect('/dashboard/403?required=sales_agent');
  }

  return (
    <div className="flex h-screen bg-[#F5F7F9] overflow-hidden font-sans">
      <AdminSidebar customer={customer} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
