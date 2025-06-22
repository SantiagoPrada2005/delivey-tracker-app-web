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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Última actualización: Hoy, 10:30 AM</span>
        </div>
      </div>
        
      {/* Métricas con indicadores de tendencia */}
      <MetricsCards />

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de pedidos por mes (ocupa 4 columnas) */}
        <OrderChart />
        
        {/* Gráfico de distribución de estados (ocupa 3 columnas) */}
        <div className="md:col-span-2 lg:col-span-3">
          <StatusChart />
        </div>
      </div>

      {/* Gráfico de ingresos */}
      <RevenueChart />

      {/* Sección inferior: Actividad reciente */}
      <RecentActivity />
    </DashboardLayout>
  );
}