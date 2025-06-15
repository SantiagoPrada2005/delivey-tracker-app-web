'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAuthNav } from "@/components/user-auth-nav";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { 
  Package, 
  Users, 
  Shield, 
  MapPin, 
  BarChart3, 
  Star,
  ArrowRight,
  Truck,
  Globe
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 xs:h-16">
            <div className="flex items-center min-w-0 max-w-[60%] xs:max-w-none">
              <Package className="h-5 w-5 xs:h-6 xs:w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <span className="ml-1 xs:ml-2 text-sm xs:text-lg sm:text-xl font-bold truncate">DeliveryTracker</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              <UserAuthNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-3 xs:mb-4 text-xs px-2 py-1">
            🚀 Plataforma de Gestión de Entregas
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 xs:mb-6 leading-tight px-2">
            Gestiona tus entregas con
            <span className="text-primary block mt-1 xs:mt-0">inteligencia y eficiencia</span>
          </h1>
          <p className="text-base xs:text-lg sm:text-xl text-muted-foreground mb-6 xs:mb-8 max-w-3xl mx-auto px-2 xs:px-4 leading-relaxed">
            DeliveryTracker es la solución completa para administrar pedidos, repartidores y clientes. 
            Optimiza tus operaciones de entrega con análisis en tiempo real y herramientas avanzadas.
          </p>
          
          {/* Mostrar diferentes CTAs según el estado de autenticación */}
          {loading ? (
            <div className="flex justify-center px-4">
              <div className="h-10 xs:h-11 w-full max-w-xs xs:max-w-sm bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center px-4 max-w-md xs:max-w-none mx-auto">
              <Link href="/dashboard" className="w-full xs:w-auto">
                <Button size="lg" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                </Button>
              </Link>
              <Link href="/pedidos" className="w-full xs:w-auto">
                <Button variant="outline" size="lg" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                  Gestionar Pedidos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center px-4 max-w-md xs:max-w-none mx-auto">
              <Link href="/auth/register" className="w-full xs:w-auto">
                <Button size="lg" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                  Comenzar Prueba Gratuita
                  <ArrowRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                Ver Demo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 xs:py-16 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 px-2">
              Características que impulsan tu negocio
            </h2>
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2 xs:px-4 leading-relaxed">
              Herramientas poderosas diseñadas para optimizar cada aspecto de tu operación de entregas
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dashboard Inteligente</CardTitle>
                <CardDescription>
                  Visualiza métricas clave, tendencias y KPIs en tiempo real con gráficos interactivos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestión de Repartidores</CardTitle>
                <CardDescription>
                  Administra tu equipo de entrega, asigna rutas y monitorea el rendimiento individual
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Control de Pedidos</CardTitle>
                <CardDescription>
                  Rastrea pedidos desde la creación hasta la entrega con actualizaciones automáticas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Base de Clientes</CardTitle>
                <CardDescription>
                  Mantén un registro completo de clientes con historial de pedidos y preferencias
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Seguimiento GPS</CardTitle>
                <CardDescription>
                  Monitorea entregas en tiempo real con geolocalización precisa y rutas optimizadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Seguridad Avanzada</CardTitle>
                <CardDescription>
                  Protección de datos con autenticación Firebase y control de acceso por organizaciones
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 xs:py-12 sm:py-16 lg:py-20 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-6 sm:gap-8 text-center">
            <div className="p-2 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-2">99.9%</div>
              <div className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-tight">Tiempo de actividad</div>
            </div>
            <div className="p-2 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-2">50K+</div>
              <div className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-tight">Entregas procesadas</div>
            </div>
            <div className="p-2 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-2">24/7</div>
              <div className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-tight">Soporte técnico</div>
            </div>
            <div className="p-2 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-2">15min</div>
              <div className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-tight">Tiempo de configuración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-12 xs:py-16 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 px-2">
              Tecnología de vanguardia
            </h2>
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2 xs:px-4 leading-relaxed">
              Construido con las mejores herramientas y frameworks para garantizar rendimiento y escalabilidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Next.js 15</CardTitle>
                <CardDescription>
                  Framework React de última generación con App Router y optimizaciones avanzadas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Firebase Auth</CardTitle>
                <CardDescription>
                  Autenticación segura y escalable con soporte para múltiples proveedores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Drizzle ORM</CardTitle>
                <CardDescription>
                  ORM moderno y type-safe para gestión eficiente de base de datos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 xs:py-16 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 xs:mb-12 sm:mb-16">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 px-2">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  &ldquo;DeliveryTracker transformó completamente nuestra operación. Ahora podemos manejar 3x más pedidos con la misma eficiencia.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">María González</div>
                    <div className="text-sm text-muted-foreground">CEO, FastDelivery</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  &ldquo;La interfaz es intuitiva y las métricas en tiempo real nos ayudan a tomar decisiones más inteligentes cada día.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Carlos Ruiz</div>
                    <div className="text-sm text-muted-foreground">Gerente, LogiExpress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription>
                  &ldquo;El soporte técnico es excepcional y la plataforma nunca nos ha fallado. Altamente recomendado.&rdquo;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Ana Martínez</div>
                    <div className="text-sm text-muted-foreground">Fundadora, QuickSend</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 xs:py-16 sm:py-20 px-2 xs:px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 px-2">
                ¡Bienvenido de vuelta!
              </h2>
              <p className="text-sm xs:text-base sm:text-lg lg:text-xl mb-6 xs:mb-8 opacity-90 px-2 xs:px-4 leading-relaxed">
                Continúa gestionando tus entregas de manera eficiente con todas las herramientas disponibles
              </p>
              <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center px-4 max-w-md xs:max-w-none mx-auto">
                <Link href="/dashboard" className="w-full xs:w-auto">
                  <Button size="lg" variant="secondary" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                    Ver Dashboard
                    <ArrowRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </Link>
                <Link href="/pedidos/nuevo" className="w-full xs:w-auto">
                  <Button size="lg" variant="outline" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Crear Nuevo Pedido
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-3 xs:mb-4 px-2">
                ¿Listo para optimizar tus entregas?
              </h2>
              <p className="text-sm xs:text-base sm:text-lg lg:text-xl mb-6 xs:mb-8 opacity-90 px-2 xs:px-4 leading-relaxed">
                Únete a cientos de empresas que ya confían en DeliveryTracker para gestionar sus operaciones de entrega
              </p>
              <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center px-4 max-w-md xs:max-w-none mx-auto">
                <Link href="/auth/register" className="w-full xs:w-auto">
                  <Button size="lg" variant="secondary" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base">
                    Comenzar Prueba Gratuita
                    <ArrowRight className="ml-2 h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full xs:w-auto min-w-[140px] text-sm xs:text-base border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Contactar Ventas
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 xs:py-8 sm:py-12 px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 xs:gap-6 sm:gap-8">
            <div className="xs:col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center mb-3 xs:mb-4">
                <Package className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="ml-2 text-sm xs:text-base sm:text-lg font-bold">DeliveryTracker</span>
              </div>
              <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
                La plataforma más avanzada para gestión de entregas y logística.
              </p>
            </div>
            <div>
              <h3 className="text-xs xs:text-sm sm:text-base font-semibold mb-2 xs:mb-3 sm:mb-4">Producto</h3>
              <ul className="space-y-1 xs:space-y-2 text-xs xs:text-sm sm:text-base text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Características</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs xs:text-sm sm:text-base font-semibold mb-2 xs:mb-3 sm:mb-4">Empresa</h3>
              <ul className="space-y-1 xs:space-y-2 text-xs xs:text-sm sm:text-base text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Carreras</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs xs:text-sm sm:text-base font-semibold mb-2 xs:mb-3 sm:mb-4">Soporte</h3>
              <ul className="space-y-1 xs:space-y-2 text-xs xs:text-sm sm:text-base text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentación</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Estado</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-4 xs:my-6 sm:my-8" />
          <div className="flex flex-col xs:flex-row justify-between items-center space-y-3 xs:space-y-0">
            <p className="text-xs text-muted-foreground text-center xs:text-left order-2 xs:order-1">
              © 2024 DeliveryTracker. Todos los derechos reservados.
            </p>
            <div className="flex space-x-3 xs:space-x-4 order-1 xs:order-2">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
