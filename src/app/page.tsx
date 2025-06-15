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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">DeliveryTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <UserAuthNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Plataforma de Gestión de Entregas
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Gestiona tus entregas con
            <span className="text-primary block">inteligencia y eficiencia</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            DeliveryTracker es la solución completa para administrar pedidos, repartidores y clientes. 
            Optimiza tus operaciones de entrega con análisis en tiempo real y herramientas avanzadas.
          </p>
          
          {/* Mostrar diferentes CTAs según el estado de autenticación */}
          {loading ? (
            <div className="flex justify-center">
              <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pedidos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Gestionar Pedidos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Comenzar Prueba Gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Demo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Características que impulsan tu negocio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para optimizar cada aspecto de tu operación de entregas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Tiempo de actividad</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Entregas procesadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Soporte técnico</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15min</div>
              <div className="text-muted-foreground">Tiempo de configuración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tecnología de vanguardia
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Construido con las mejores herramientas y frameworks para garantizar rendimiento y escalabilidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¡Bienvenido de vuelta!
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Continúa gestionando tus entregas de manera eficiente con todas las herramientas disponibles
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Ver Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pedidos/nuevo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Crear Nuevo Pedido
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para optimizar tus entregas?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Únete a cientos de empresas que ya confían en DeliveryTracker para gestionar sus operaciones de entrega
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Comenzar Prueba Gratuita
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Contactar Ventas
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-bold">DeliveryTracker</span>
              </div>
              <p className="text-muted-foreground">
                La plataforma más avanzada para gestión de entregas y logística.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Características</Link></li>
                <li><Link href="#" className="hover:text-foreground">Precios</Link></li>
                <li><Link href="#" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Acerca de</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Carreras</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Documentación</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contacto</Link></li>
                <li><Link href="#" className="hover:text-foreground">Estado</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © 2024 DeliveryTracker. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Privacidad
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
