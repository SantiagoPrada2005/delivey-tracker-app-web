import { DashboardLayout } from '@/components/dashboard-layout';

// Importar los componentes del dashboard
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { OrderChart } from "@/components/dashboard/order-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";


export default function Dashboard() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" }
  ];

  return (
    <DashboardLayout currentPage="Dashboard" breadcrumbItems={breadcrumbItems}>
      {/* Header responsive - stack en móvil */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Última actualización: Hoy, 10:30 AM</span>
        </div>
      </div>
        
      {/* Métricas con indicadores de tendencia - responsive grid */}
      <div className="mb-6">
        <MetricsCards />
      </div>

      {/* Gráficos - layout mejorado para móvil */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7 mb-6">
        {/* Gráfico de pedidos por mes - full width en móvil */}
        <div className="lg:col-span-4">
          <OrderChart />
        </div>
        
        {/* Gráfico de distribución de estados */}
        <div className="lg:col-span-3">
          <StatusChart />
        </div>
      </div>

      {/* Gráfico de ingresos - spacing mejorado */}
      <div className="mb-6">
        <RevenueChart />
      </div>

      {/* Sección inferior: Actividad reciente */}
      <RecentActivity />
    </DashboardLayout>
  );
}