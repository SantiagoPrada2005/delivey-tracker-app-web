import * as React from "react"

// Breakpoints consistentes con Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook mejorado para detectar dispositivos móviles con mejor manejo de SSR
 * y breakpoints flexibles basados en Tailwind CSS
 */
export function useIsMobile(breakpoint: Breakpoint = 'md'): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    const breakpointValue = BREAKPOINTS[breakpoint]
    const mediaQuery = `(max-width: ${breakpointValue - 1}px)`
    const mql = window.matchMedia(mediaQuery)
    
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < breakpointValue)
    }
    
    // Configuración inicial
    updateIsMobile()
    
    // Listener para cambios
    mql.addEventListener('change', updateIsMobile)
    
    return () => {
      mql.removeEventListener('change', updateIsMobile)
    }
  }, [breakpoint])

  // Retornar false durante SSR para evitar hidratación inconsistente
  return isClient ? isMobile : false
}

/**
 * Hook para detectar breakpoints específicos
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    const breakpointValue = BREAKPOINTS[breakpoint]
    const mediaQuery = `(min-width: ${breakpointValue}px)`
    const mql = window.matchMedia(mediaQuery)
    
    const updateMatches = () => {
      setMatches(mql.matches)
    }
    
    updateMatches()
    mql.addEventListener('change', updateMatches)
    
    return () => {
      mql.removeEventListener('change', updateMatches)
    }
  }, [breakpoint])

  return isClient ? matches : false
}

/**
 * Hook para obtener el breakpoint actual
 */
export function useCurrentBreakpoint(): Breakpoint | null {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint | null>(null)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint('md')
      } else if (width >= BREAKPOINTS.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint(null)
      }
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  return isClient ? currentBreakpoint : null
}
