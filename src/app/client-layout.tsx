'use client';

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OrganizationProvider } from "@/hooks/useOrganization";
import { AuthProvider } from "@/hooks/useAuth";
import { OrganizationCheck } from "@/components/auth/organization-check";
import { OrganizationFlowProvider } from "@/contexts/organization-flow-context";
import { ErrorBoundary } from "@/components/error-boundary";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Root Error Boundary:', error, errorInfo);
          // Aquí podrías enviar el error a un servicio de logging
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Theme Error Boundary:', error, errorInfo);
            }}
          >
            <AuthProvider>
              <OrganizationProvider>
                <OrganizationFlowProvider>
                  <OrganizationCheck>
                    {children}
                  </OrganizationCheck>
                </OrganizationFlowProvider>
              </OrganizationProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}
