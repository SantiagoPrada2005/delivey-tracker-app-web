'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { ProfileForm } from '@/components/auth/profile-form';

export default function PerfilPage() {
  return (
    <DashboardLayout 
      currentPage="Perfil"
      breadcrumbItems={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Mi Perfil", href: "/perfil" }
      ]}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>
          <ProfileForm />
        </div>
      </main>
    </DashboardLayout>
  );
}