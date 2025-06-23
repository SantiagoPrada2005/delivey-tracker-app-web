"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Constantes mejoradas con mejor tipado
const SIDEBAR_COOKIE_NAME = "sidebar_state" as const
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días
const SIDEBAR_WIDTH = "var(--sidebar-width-desktop)" as const
const SIDEBAR_WIDTH_MOBILE = "var(--sidebar-width-mobile)" as const
const SIDEBAR_WIDTH_ICON = "var(--sidebar-width-icon)" as const
const SIDEBAR_KEYBOARD_SHORTCUT = "b" as const

// Tipos mejorados
type SidebarState = "expanded" | "collapsed"
type SidebarVariant = "sidebar" | "floating" | "inset"
type SidebarCollapsible = "offcanvas" | "icon" | "none"
type SidebarSide = "left" | "right"
type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl"

// Interfaz mejorada del contexto
interface SidebarContextProps {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean | ((prev: boolean) => boolean)) => void
  isMobile: boolean
  toggleSidebar: () => void
  variant?: SidebarVariant
  side?: SidebarSide
  collapsible?: SidebarCollapsible
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

/**
 * Hook para acceder al contexto del sidebar con mejor manejo de errores
 */
function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error(
      "useSidebar must be used within a SidebarProvider. " +
      "Wrap a parent component in <SidebarProvider> for this hook to work."
    )
  }

  return context
}

// Props mejoradas del SidebarProvider
interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: SidebarVariant
  side?: SidebarSide
  collapsible?: SidebarCollapsible
  storageKey?: string
  breakpoint?: BreakpointKey
}

/**
 * Provider mejorado del sidebar con mejor manejo de estado y performance
 */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  variant = "sidebar",
  side = "left",
  collapsible = "offcanvas",
  storageKey = SIDEBAR_COOKIE_NAME,
  breakpoint = "md",
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile(breakpoint as Parameters<typeof useIsMobile>[0])
  const [openMobile, setOpenMobile] = React.useState(false)

  // Estado interno del sidebar con inicialización desde cookies
  const [_open, _setOpen] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen
    
    try {
      const stored = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${storageKey}=`))
        ?.split("=")[1]
      return stored ? stored === "true" : defaultOpen
    } catch {
      return defaultOpen
    }
  })

  const open = openProp ?? _open
  
  // Función optimizada para cambiar el estado
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // Guardar estado en cookie de forma segura
      if (typeof window !== "undefined") {
        try {
          document.cookie = `${storageKey}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`
        } catch (error) {
          console.warn("Failed to save sidebar state to cookie:", error)
        }
      }
    },
    [setOpenProp, open, storageKey]
  )

  // Toggle optimizado del sidebar
  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen((prev) => !prev)
    }
  }, [isMobile, setOpen])

  // Atajo de teclado mejorado
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // Cerrar sidebar móvil cuando se cambia a desktop
  React.useEffect(() => {
    if (!isMobile && openMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, openMobile])

  const state: SidebarState = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      variant,
      side,
      collapsible,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, variant, side, collapsible]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// Props mejoradas del componente Sidebar
interface SidebarProps extends React.ComponentProps<"div"> {
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  staticOnDesktop?: boolean
  transitionDuration?: number
}

/**
 * Componente Sidebar principal con mejoras de performance y accesibilidad
 */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  staticOnDesktop = true,
  transitionDuration = 300,
  className,
  children,
  ...props
}: SidebarProps) {
  const { 
    isMobile, 
    state, 
    openMobile, 
    setOpenMobile,
    variant: contextVariant,
    side: contextSide,
    collapsible: contextCollapsible
  } = useSidebar()

  // Usar valores del contexto si están disponibles
  const finalVariant = contextVariant ?? variant
  const finalSide = contextSide ?? side
  const finalCollapsible = contextCollapsible ?? collapsible

  // Memoizar las variables CSS para evitar recálculos
  const cssVariables = React.useMemo(() => ({
    "--sidebar-width": SIDEBAR_WIDTH,
    "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    "--sidebar-transition-duration": `${transitionDuration}ms`,
  }), [transitionDuration])

  // Sidebar estático (sin colapso)
  if (finalCollapsible === "none" || (staticOnDesktop && !isMobile)) {
    return (
      <div
        data-slot="sidebar"
        data-sidebar="sidebar"
        data-state="expanded"
        data-variant={finalVariant}
        data-side={finalSide}
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col border-r border-sidebar-border",
          className
        )}
        style={cssVariables as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }

  // Sidebar móvil
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          data-state={openMobile ? "expanded" : "collapsed"}
          data-variant={finalVariant}
          data-side={finalSide}
          className={cn(
            "bg-sidebar text-sidebar-foreground w-[var(--sidebar-width-mobile)] p-0 [&>button]:hidden",
            "transition-transform duration-300 ease-in-out",
            "z-[var(--z-modal)] border-r border-sidebar-border",
            className
          )}
          style={{
            ...cssVariables,
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties}
          side={finalSide}
          {...props}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
            <SheetDescription>
              Menú de navegación principal de la aplicación
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col overflow-hidden">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Sidebar de escritorio
  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={staticOnDesktop ? "expanded" : state}
      data-collapsible={staticOnDesktop ? "" : (state === "collapsed" ? finalCollapsible : "")}
      data-variant={finalVariant}
      data-side={finalSide}
      data-slot="sidebar"
      style={cssVariables as React.CSSProperties}
    >
      {/* Gap del sidebar en desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-[var(--sidebar-width-desktop)] bg-transparent transition-[width] ease-in-out",
          !staticOnDesktop && "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          finalVariant === "floating" || finalVariant === "inset"
            ? !staticOnDesktop && "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4))]"
            : !staticOnDesktop && "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
        )}
        style={{
          transitionDuration: "var(--sidebar-transition-duration)",
        }}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-[var(--z-sidebar)] hidden h-svh w-[var(--sidebar-width-desktop)] transition-[left,right,width] ease-in-out md:flex",
          finalSide === "left"
            ? staticOnDesktop 
              ? "left-0" 
              : "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width-desktop)*-1)]"
            : staticOnDesktop 
              ? "right-0" 
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width-desktop)*-1)]",
          finalVariant === "floating" || finalVariant === "inset"
            ? staticOnDesktop 
              ? "p-2" 
              : "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4)+2px)]"
            : staticOnDesktop 
              ? "group-data-[side=left]:border-r group-data-[side=right]:border-l border-sidebar-border" 
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l border-sidebar-border",
          className
        )}
        style={{
          transitionDuration: "var(--sidebar-transition-duration)",
        }}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "bg-sidebar text-sidebar-foreground flex h-full w-full flex-col overflow-hidden",
            finalVariant === "floating" && "border-sidebar-border rounded-lg border shadow-sm",
            finalVariant === "inset" && "border-sidebar-border rounded-lg border shadow-sm"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {
  hideOnDesktop?: boolean
}

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarTriggerProps
>(({ className, onClick, hideOnDesktop = true, ...props }, ref) => {
  const { toggleSidebar, isMobile, state } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      data-state={state}
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        hideOnDesktop && "md:hidden",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (isMobile || !hideOnDesktop) {
          toggleSidebar()
        }
      }}
      {...props}
    >
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">Alternar menú de navegación</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

type SidebarRailProps = React.ComponentProps<"button">

const SidebarRail = React.forwardRef<
  React.ElementRef<"button">,
  SidebarRailProps
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state, side } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      data-state={state}
      data-side={side}
      aria-label="Alternar menú de navegación"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Alternar menú de navegación"
      className={cn(
        "absolute inset-y-0 z-[var(--z-sidebar-rail)] hidden w-4 -translate-x-1/2 transition-all ease-in-out sm:flex",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:transition-colors",
        "hover:after:bg-sidebar-border focus-visible:after:bg-sidebar-border",
        "data-[side=left]:cursor-w-resize data-[side=right]:cursor-e-resize",
        "data-[side=left][data-state=collapsed]:cursor-e-resize data-[side=right][data-state=collapsed]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar/50 group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "group-data-[side=left][data-collapsible=offcanvas]:-right-2",
        "group-data-[side=right][data-collapsible=offcanvas]:-left-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

type SidebarInsetProps = React.ComponentProps<"main">

const SidebarInset = React.forwardRef<
  React.ElementRef<"main">,
  SidebarInsetProps
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col min-h-0",
        "transition-all duration-300 ease-in-out",
        // Variante inset
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0",
        "md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        // Variante floating
        "md:peer-data-[variant=floating]:m-2 md:peer-data-[variant=floating]:ml-0",
        "md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

type SidebarInputProps = React.ComponentProps<typeof Input>

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  SidebarInputProps
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "bg-background border-sidebar-border h-8 w-full shadow-none transition-colors",
        "focus-visible:ring-sidebar-ring placeholder:text-sidebar-foreground/50",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

type SidebarHeaderProps = React.ComponentProps<"div">

const SidebarHeader = React.forwardRef<
  React.ElementRef<"div">,
  SidebarHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2 border-b border-sidebar-border",
        "group-data-[collapsible=icon]:p-2",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

type SidebarFooterProps = React.ComponentProps<"div">

const SidebarFooter = React.forwardRef<
  React.ElementRef<"div">,
  SidebarFooterProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn(
        "flex flex-col gap-2 p-2 border-t border-sidebar-border mt-auto",
        "group-data-[collapsible=icon]:p-2",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

type SidebarSeparatorProps = React.ComponentProps<typeof Separator>

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  SidebarSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "bg-sidebar-border mx-2 w-auto transition-colors",
        className
      )}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

type SidebarContentProps = React.ComponentProps<"div">

const SidebarContent = React.forwardRef<
  React.ElementRef<"div">,
  SidebarContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto transition-all ease-in-out",
        "group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:gap-1",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

type SidebarGroupProps = React.ComponentProps<"div">

const SidebarGroup = React.forwardRef<
  React.ElementRef<"div">,
  SidebarGroupProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-2",
        "group-data-[collapsible=icon]:p-2",
        className
      )}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {
  asChild?: boolean
}

const SidebarGroupLabel = React.forwardRef<
  React.ElementRef<"div">,
  SidebarGroupLabelProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-none transition-[margin,opacity,height] ease-in-out focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

interface SidebarGroupActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

const SidebarGroupAction = React.forwardRef<
  React.ElementRef<"button">,
  SidebarGroupActionProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-none transition-all ease-in-out focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Aumenta el área de toque del botón en móvil
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

type SidebarGroupContentProps = React.ComponentProps<"div">

const SidebarGroupContent = React.forwardRef<
  React.ElementRef<"div">,
  SidebarGroupContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn(
        "w-full text-sm transition-all ease-in-out",
        "group-data-[collapsible=icon]:opacity-0",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

type SidebarMenuProps = React.ComponentProps<"ul">

const SidebarMenu = React.forwardRef<
  React.ElementRef<"ul">,
  SidebarMenuProps
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(
        "flex w-full min-w-0 flex-col gap-1 transition-all ease-in-out",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenu.displayName = "SidebarMenu"

type SidebarMenuItemProps = React.ComponentProps<"li">

const SidebarMenuItem = React.forwardRef<
  React.ElementRef<"li">,
  SidebarMenuItemProps
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding,opacity,background-color,color] ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>span]:hidden",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background border border-sidebar-border shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:border-sidebar-accent",
        ghost: "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        destructive: "text-destructive hover:bg-destructive hover:text-destructive-foreground",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SidebarMenuButtonProps extends React.ComponentProps<"button">, VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
}

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<"button">,
  SidebarMenuButtonProps
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      data-variant={variant}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        className="z-[var(--z-tooltip)]"
        {...tooltip}
      />
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

interface SidebarMenuActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  showOnHover?: boolean
}

const SidebarMenuAction = React.forwardRef<
  React.ElementRef<"button">,
  SidebarMenuActionProps
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-none transition-all ease-in-out focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Aumenta el área de toque del botón en móvil
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

type SidebarMenuBadgeProps = React.ComponentProps<"div">

const SidebarMenuBadge = React.forwardRef<
  React.ElementRef<"div">,
  SidebarMenuBadgeProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none transition-colors ease-in-out",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

interface SidebarMenuSkeletonProps extends React.ComponentProps<"div"> {
  showIcon?: boolean
}

const SidebarMenuSkeleton = React.forwardRef<
  React.ElementRef<"div">,
  SidebarMenuSkeletonProps
>(({ className, showIcon = false, ...props }, ref) => {
  // Ancho aleatorio entre 50 y 90%
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-2 transition-all ease-in-out",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="bg-sidebar-accent-foreground/20 size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="bg-sidebar-accent-foreground/20 h-4 max-w-[--skeleton-width] flex-1 rounded-md"
        data-sidebar="menu-skeleton-text"
        style={{
          "--skeleton-width": width,
        } as React.CSSProperties}
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

type SidebarMenuSubProps = React.ComponentProps<"ul">

const SidebarMenuSub = React.forwardRef<
  React.ElementRef<"ul">,
  SidebarMenuSubProps
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5 transition-all ease-in-out",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenuSub.displayName = "SidebarMenuSub"

type SidebarMenuSubItemProps = React.ComponentProps<"li">

const SidebarMenuSubItem = React.forwardRef<
  React.ElementRef<"li">,
  SidebarMenuSubItemProps
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative transition-all ease-in-out", className)}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

interface SidebarMenuSubButtonProps extends React.ComponentProps<"a"> {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}

const SidebarMenuSubButton = React.forwardRef<
  React.ElementRef<"a">,
  SidebarMenuSubButtonProps
>(({ asChild = false, size = "md", isActive = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-none transition-all ease-in-out focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      style={{
        transitionDuration: "var(--sidebar-transition-duration)",
      }}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
