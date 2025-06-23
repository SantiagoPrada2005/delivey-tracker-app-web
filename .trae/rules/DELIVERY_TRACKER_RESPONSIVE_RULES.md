# 🎨 Reglas de Diseño Responsive - DeliveryTracker

> **Sistema de Diseño Responsive Empresarial**  
> Autor: Santiago Prada  
> Stack: Next.js 15 + Tailwind CSS + Shadcn UI + Radix UI  
> Versión: 2.0 - Arquitectura de 3 Capas Responsive

## 📖 Índice

1. [🏗️ Arquitectura Responsive](#️-arquitectura-responsive)
2. [📱 Sistema de Breakpoints](#-sistema-de-breakpoints)
3. [🎨 Design Tokens Fluidos](#-design-tokens-fluidos)
4. [🧩 Componentes Adaptativos](#-componentes-adaptativos)
5. [📊 Layouts Responsivos](#-layouts-responsivos)
6. [🎯 Patrones de Implementación](#-patrones-de-implementación)
7. [⚡ Optimización de Performance](#-optimización-de-performance)
8. [♿ Accesibilidad Responsive](#-accesibilidad-responsive)
9. [🔧 Herramientas y Configuración](#-herramientas-y-configuración)
10. [📋 Checklist de Desarrollo](#-checklist-de-desarrollo)

## 🏗️ Arquitectura Responsive

### Stack de 3 Capas

```yaml
Capa 1 - Primitivos (Radix UI):
  - Comportamientos accesibles
  - Navegación por teclado
  - Estados de focus management
  - Screen reader compatibility
  - ARIA completo

Capa 2 - Componentes (Shadcn UI):
  - Sistema de componentes pre-diseñados
  - Variantes consistentes (size, variant, color)
  - Theming automático con CSS variables
  - TypeScript definitions
  - Composición flexible

Capa 3 - Utilidades (Tailwind CSS):
  - Framework de utilidades atómicas
  - JIT (Just-In-Time) compilation
  - Responsive modifiers (sm:, md:, lg:, etc.)
  - Dark mode support nativo
  - Custom utility classes
```

### Principios de Diseño

```typescript
// ✅ CORRECTO: Mobile-First Approach
const DESIGN_PRINCIPLES = {
  mobileFirst: true,           // Estilos base para móviles
  progressiveEnhancement: true, // Mejoras progresivas
  touchOptimized: true,        // Interfaces táctiles (44px mínimo)
  performanceBudget: true,     // Límites estrictos de recursos
  contentFirst: true,          // El contenido define breakpoints
  accessibilityFirst: true     // WCAG 2.1 AA desde el inicio
};
```

## 📱 Sistema de Breakpoints

### Breakpoints Híbridos

```css
/* ✅ CORRECTO: Variables CSS para breakpoints */
:root {
  /* Breakpoints base de Tailwind CSS */
  --breakpoint-xs: 475px;   /* Móviles pequeños (extensión custom) */
  --breakpoint-sm: 640px;   /* Móviles grandes */
  --breakpoint-md: 768px;   /* Tablets portrait */
  --breakpoint-lg: 1024px;  /* Tablets landscape / Laptops pequeños */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Pantallas grandes */
  
  /* Breakpoints semánticos adicionales */
  --breakpoint-mobile-max: 767px;
  --breakpoint-tablet-min: 768px;
  --breakpoint-tablet-max: 1023px;
  --breakpoint-desktop-min: 1024px;
}
```

### Hook de Detección de Dispositivos

```typescript
// ✅ CORRECTO: Hook useIsMobile optimizado
// src/hooks/use-mobile.ts
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useIsMobile(breakpoint: Breakpoint = 'md'): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);
  
  return isMobile;
}

// ✅ CORRECTO: Uso en componentes
const MyComponent = () => {
  const isMobile = useIsMobile('md');
  
  return (
    <div className={cn(
      "flex gap-4",
      isMobile ? "flex-col" : "flex-row"
    )}>
      {/* Contenido adaptativo */}
    </div>
  );
};
```

## 🎨 Design Tokens Fluidos

### Espaciado Fluido

```css
/* ✅ CORRECTO: Espaciado fluido con clamp() */
:root {
  --spacing-xs: clamp(0.25rem, 0.5vw, 0.375rem);
  --spacing-sm: clamp(0.5rem, 1vw, 0.75rem);
  --spacing-md: clamp(1rem, 2vw, 1.5rem);
  --spacing-lg: clamp(1.5rem, 3vw, 2.25rem);
  --spacing-xl: clamp(2rem, 4vw, 3rem);
  --spacing-2xl: clamp(3rem, 6vw, 4.5rem);
}

/* ✅ CORRECTO: Aplicación en componentes */
.container-responsive {
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}
```

### Tipografía Fluida

```css
/* ✅ CORRECTO: Tipografía fluida responsive */
:root {
  --text-xs: clamp(0.75rem, 0.8vw, 0.875rem);
  --text-sm: clamp(0.875rem, 1vw, 1rem);
  --text-base: clamp(1rem, 1.2vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1.4vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.6vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 2vw, 2rem);
  --text-3xl: clamp(1.875rem, 2.5vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 3vw, 3rem);
}

/* ✅ CORRECTO: Clases de utilidad personalizadas */
.text-fluid-sm { font-size: var(--text-sm); }
.text-fluid-base { font-size: var(--text-base); }
.text-fluid-lg { font-size: var(--text-lg); }
.text-fluid-xl { font-size: var(--text-xl); }
```

### Variables Responsive

```css
/* ✅ CORRECTO: Variables adaptativas */
:root {
  /* Radios adaptativos */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-mobile: clamp(0.5rem, 1vw, 0.625rem);
  
  /* Sombras responsivas */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-mobile: 0 2px 8px 0 rgb(0 0 0 / 0.08);
  
  /* Sidebar responsive */
  --sidebar-width-desktop: 16rem;
  --sidebar-width-mobile: 18rem;
}
```

## 🧩 Componentes Adaptativos

### MetricsCards Component

```typescript
// ✅ CORRECTO: Componente de métricas responsive
// src/components/dashboard/metrics-cards.tsx
interface MetricsCardsProps {
  metrics: {
    totalPedidos: number;
    pedidosPendientes: number;
    pedidosEntregados: number;
    totalVentas: number;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const isMobile = useIsMobile('sm');
  
  return (
    <div className={cn(
      "grid gap-3 sm:gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Pedidos
            </p>
            <p className="text-xl sm:text-2xl font-bold">
              {metrics.totalPedidos}
            </p>
          </div>
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      </Card>
      {/* Más cards... */}
    </div>
  );
}
```

### Filtros Responsivos

```typescript
// ✅ CORRECTO: Filtros de pedidos adaptativos
// src/components/pedidos/pedido-filters.tsx
export function PedidoFilters() {
  return (
    <div className={cn(
      "flex gap-3",
      "flex-col sm:flex-row",
      "px-1 sm:px-0" // Padding adaptativo
    )}>
      <Input
        placeholder="Buscar pedidos..."
        className="w-full sm:w-[200px]" // Ancho fijo en desktop
      />
      
      <Select>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="entregado">Entregado</SelectItem>
        </SelectContent>
      </Select>
      
      <Button className="w-full sm:w-auto">
        <Filter className="mr-2 h-4 w-4" />
        Filtrar
      </Button>
    </div>
  );
}
```

### Navegación de Usuario

```typescript
// ✅ CORRECTO: UserAuthNav responsive
// src/components/user-auth-nav.tsx
export function UserAuthNav() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile('sm');
  
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        {!isMobile && <Skeleton className="h-4 w-[100px]" />}
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {!isMobile && (
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 📊 Layouts Responsivos

### Dashboard Layout

```typescript
// ✅ CORRECTO: Layout del dashboard responsive
// src/components/dashboard-layout.tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile('md');
  
  // Prevenir scroll del body cuando sidebar está abierto en móvil
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r",
        "transition-transform duration-300 ease-in-out",
        "w-[var(--sidebar-width-mobile)] md:w-[var(--sidebar-width-desktop)]",
        isMobile ? (
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ) : "translate-x-0"
      )}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>
      
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Contenido principal */}
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden",
        !isMobile && "ml-[var(--sidebar-width-desktop)]"
      )}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-4 ml-auto">
            <ThemeSwitcher />
            <UserAuthNav />
          </div>
        </header>
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### Página Principal (Landing)

```typescript
// ✅ CORRECTO: Landing page responsive
// src/app/page.tsx
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center space-y-6">
          <h1 className={cn(
            "font-bold tracking-tight",
            "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
          )}>
            Gestiona tus entregas con
            <span className="text-primary"> DeliveryTracker</span>
          </h1>
          
          <p className={cn(
            "text-muted-foreground max-w-2xl mx-auto",
            "text-base sm:text-lg md:text-xl"
          )}>
            Sistema completo de gestión de pedidos y entregas para tu negocio.
            Controla todo desde un solo lugar.
          </p>
          
          {/* CTAs Responsivos */}
          <div className={cn(
            "flex gap-3 xs:gap-4 justify-center",
            "flex-col xs:flex-row",
            "max-w-md xs:max-w-none mx-auto"
          )}>
            {loading ? (
              <>
                <Skeleton className="h-10 w-full xs:w-40" />
                <Skeleton className="h-10 w-full xs:w-32" />
              </>
            ) : isAuthenticated ? (
              <>
                <Button size="lg" className="w-full xs:w-auto">
                  Ir al Dashboard
                </Button>
                <Button variant="outline" size="lg" className="w-full xs:w-auto">
                  Gestionar Pedidos
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="w-full xs:w-auto">
                  Comenzar Prueba Gratuita
                </Button>
                <Button variant="outline" size="lg" className="w-full xs:w-auto">
                  Ver Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-3">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
```

## 🎯 Patrones de Implementación

### Tablas Responsivas

```typescript
// ✅ CORRECTO: Tabla de pedidos responsive
// src/components/pedidos/pedidos-table.tsx
export function PedidosTable({ pedidos }: { pedidos: Pedido[] }) {
  const isMobile = useIsMobile('md');
  
  if (isMobile) {
    // Vista de cards para móvil
    return (
      <div className="space-y-3">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">#{pedido.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {pedido.cliente.nombre}
                  </p>
                </div>
                <Badge variant={getEstadoVariant(pedido.estado)}>
                  {pedido.estado}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">
                  ${pedido.total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(pedido.createdAt, 'dd/MM/yyyy')}
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Ver
                </Button>
                <Button size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  // Vista de tabla para desktop
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pedidos.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell className="font-medium">#{pedido.id}</TableCell>
              <TableCell>{pedido.cliente.nombre}</TableCell>
              <TableCell>
                <Badge variant={getEstadoVariant(pedido.estado)}>
                  {pedido.estado}
                </Badge>
              </TableCell>
              <TableCell>${pedido.total.toLocaleString()}</TableCell>
              <TableCell>{format(pedido.createdAt, 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline">
                    Ver
                  </Button>
                  <Button size="sm">
                    Editar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Formularios Adaptativos

```typescript
// ✅ CORRECTO: Formulario de pedido responsive
// src/components/pedidos/create-pedido-form.tsx
export function CreatePedidoForm() {
  const isMobile = useIsMobile('md');
  
  return (
    <form className="space-y-6">
      {/* Grid adaptativo */}
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 md:grid-cols-2"
      )}>
        <FormField
          name="clienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id.toString()}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          name="direccionEntrega"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección de Entrega</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ingrese la dirección completa"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Productos - Layout adaptativo */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Productos</h3>
        <div className="space-y-3">
          {productos.map((producto, index) => (
            <div key={index} className={cn(
              "flex gap-3 p-3 border rounded-lg",
              isMobile ? "flex-col" : "flex-row items-center"
            )}>
              <div className="flex-1">
                <p className="font-medium">{producto.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  ${producto.precio.toLocaleString()}
                </p>
              </div>
              
              <div className={cn(
                "flex gap-2",
                isMobile ? "justify-between" : "items-center"
              )}>
                <Label htmlFor={`cantidad-${index}`} className="text-sm">
                  Cantidad:
                </Label>
                <Input
                  id={`cantidad-${index}`}
                  type="number"
                  min="1"
                  className="w-20"
                  defaultValue="1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botones adaptativos */}
      <div className={cn(
        "flex gap-3",
        isMobile ? "flex-col" : "flex-row justify-end"
      )}>
        <Button type="button" variant="outline" className={isMobile ? "w-full" : "w-auto"}>
          Cancelar
        </Button>
        <Button type="submit" className={isMobile ? "w-full" : "w-auto"}>
          Crear Pedido
        </Button>
      </div>
    </form>
  );
}
```

## ⚡ Optimización de Performance

### CSS Optimizado

```css
/* ✅ CORRECTO: Prevención de overflow horizontal */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* ✅ CORRECTO: Optimización de transiciones */
.sidebar-transition {
  will-change: transform;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ✅ CORRECTO: Scroll optimizado para móvil */
@media (max-width: 767px) {
  [data-slot="sidebar-container"] {
    transform: translateX(-100%);
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
}

/* ✅ CORRECTO: Optimización de animaciones */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Lazy Loading de Componentes

```typescript
// ✅ CORRECTO: Lazy loading de componentes pesados
const PedidosChart = lazy(() => import('@/components/charts/pedidos-chart'));
const AnalyticsPanel = lazy(() => import('@/components/analytics/analytics-panel'));

export function Dashboard() {
  const isMobile = useIsMobile('lg');
  
  return (
    <div className="space-y-6">
      {/* Métricas siempre visibles */}
      <MetricsCards />
      
      {/* Componentes pesados con lazy loading */}
      <Suspense fallback={<ChartSkeleton />}>
        {!isMobile && <PedidosChart />}
      </Suspense>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsPanel />
      </Suspense>
    </div>
  );
}
```

## ♿ Accesibilidad Responsive

### Touch Targets

```typescript
// ✅ CORRECTO: Touch targets mínimo 44px
const TOUCH_TARGET_SIZE = {
  minimum: '44px',    // WCAG recomendación
  comfortable: '48px', // Mejor experiencia
  large: '56px'       // Para usuarios con dificultades motoras
};

// ✅ CORRECTO: Botones con touch targets apropiados
export function TouchOptimizedButton({ children, size = 'default', ...props }) {
  return (
    <Button
      className={cn(
        "min-h-[44px] min-w-[44px]", // Touch target mínimo
        size === 'sm' && "min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

### Focus Management

```typescript
// ✅ CORRECTO: Focus management en modales
export function ResponsiveModal({ children, open, onOpenChange }) {
  const isMobile = useIsMobile('sm');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-lg",
        isMobile && "w-[95vw] max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Título del Modal
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        <DialogFooter className={cn(
          "gap-2",
          isMobile && "flex-col-reverse"
        )}>
          <Button variant="outline" className={isMobile ? "w-full" : "w-auto"}>
            Cancelar
          </Button>
          <Button className={isMobile ? "w-full" : "w-auto"}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 🔧 Herramientas y Configuración

### Tailwind Config Extendido

```javascript
// ✅ CORRECTO: tailwind.config.js optimizado
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',      // Breakpoint adicional
        '3xl': '1920px'     // Pantallas muy grandes
      },
      spacing: {
        '18': '4.5rem',     // 72px
        '88': '22rem',      // 352px
        '128': '32rem'      // 512px
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")
  ]
};
```

### PostCSS Config

```javascript
// ✅ CORRECTO: postcss.config.mjs optimizado
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "autoprefixer": {
      grid: "autoplace",
      flexbox: "no-2009"
    },
    "cssnano": {
      preset: ["default", {
        discardComments: { removeAll: true },
        normalizeWhitespace: false
      }]
    }
  }
};

export default config;
```

### Shadcn UI Config

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "gray",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## 📋 Checklist de Desarrollo

### ✅ Antes de Crear un Componente

- [ ] ¿El componente necesita ser responsive?
- [ ] ¿Qué breakpoints son relevantes?
- [ ] ¿Necesita diferentes layouts para móvil/desktop?
- [ ] ¿Los touch targets son de al menos 44px?
- [ ] ¿Es accesible con teclado y screen readers?
- [ ] ¿Maneja estados de carga apropiadamente?
- [ ] ¿Usa el hook `useIsMobile` cuando es necesario?

### ✅ Implementación de Responsive

- [ ] Aplicar mobile-first approach
- [ ] Usar clases responsive de Tailwind (`sm:`, `md:`, `lg:`)
- [ ] Implementar touch targets apropiados
- [ ] Verificar overflow horizontal
- [ ] Optimizar transiciones y animaciones
- [ ] Usar design tokens fluidos cuando sea apropiado
- [ ] Implementar lazy loading para componentes pesados

### ✅ Testing Responsive

- [ ] Probar en dispositivos móviles reales
- [ ] Verificar en diferentes orientaciones
- [ ] Comprobar touch interactions
- [ ] Validar accesibilidad con screen readers
- [ ] Medir performance en dispositivos lentos
- [ ] Verificar que no hay scroll horizontal
- [ ] Comprobar que las animaciones respetan `prefers-reduced-motion`

### ✅ Performance

- [ ] Bundle size < 50KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No hay layout shifts durante la carga
- [ ] Imágenes optimizadas y responsive
- [ ] CSS crítico inlined

---

**Recuerda**: El diseño responsive no es solo sobre breakpoints, es sobre crear experiencias fluidas y accesibles que se adapten naturalmente a cualquier dispositivo y contexto de uso.