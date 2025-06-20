"use client"

import { useEffect } from 'react';
import { useCreateOrganization } from '@/hooks/useCreateOrganization';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Schema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no puede exceder 100 caracteres.",
  }),
  slug: z.string().min(2, {
    message: "El identificador debe tener al menos 2 caracteres.",
  }).max(50, {
    message: "El identificador no puede exceder 50 caracteres.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "El identificador solo puede contener letras minúsculas, números y guiones.",
  }),
  description: z.string().max(500, {
    message: "La descripción no puede exceder 500 caracteres.",
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Generar slug automáticamente basado en el nombre
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim()
    .substring(0, 50); // Limitar longitud
};

export function CreateOrganizationForm() {
  const { loading, error, success, createOrganization, clearError } = useCreateOrganization();

  // Configurar el formulario con react-hook-form y zod
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Observar cambios en el nombre para generar slug automáticamente
  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");
  
  // Actualizar slug automáticamente cuando cambie el nombre
  useEffect(() => {
    if (watchName && (!watchSlug || watchSlug === generateSlug(form.getValues("name")))) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, watchSlug, form]);

  const onSubmit = async (values: FormData) => {
    await createOrganization({
      name: values.name,
      description: values.description || undefined,
      slug: values.slug,
    });
  };

  // Limpiar error cuando el usuario empiece a escribir
  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear nueva organización</CardTitle>
        <CardDescription>
          Crea tu organización para comenzar a utilizar la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
            <AlertDescription className="text-green-700">
              Organización creada correctamente. Redireccionando...
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la organización *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mi Empresa"
                      disabled={loading || success}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    El nombre público de tu organización
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador único</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mi-empresa"
                      disabled={loading || success}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Este identificador se usará en URLs y debe ser único
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe brevemente tu organización"
                      rows={3}
                      disabled={loading || success}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Una breve descripción de tu organización (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || success}
            >
              {loading ? 'Creando...' : 'Crear organización'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        Al crear una organización, serás asignado automáticamente como administrador.
      </CardFooter>
    </Card>
  );
}