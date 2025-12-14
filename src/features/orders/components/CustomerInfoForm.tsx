"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CustomerInfoInput, customerInfoSchema } from "../validations";

type CustomerInfoFormProps = {
  onSubmit: (data: CustomerInfoInput) => void;
  isLoading?: boolean;
};

export function CustomerInfoForm({
  onSubmit,
  isLoading = false,
}: CustomerInfoFormProps) {
  const form = useForm<CustomerInfoInput>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      name: "",
      phone: "",
      zone: "",
      address: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Juan Pérez"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono *</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 234 567 8901"
                  type="tel"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Incluye código de país si es necesario
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona de entrega *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Santa Clara, Placetas..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Zonas disponibles: {siteConfig.zones}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección completa (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Calle, número, referencias..."
                  {...field}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Puedes coordinar los detalles por WhatsApp
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas adicionales (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Preferencias de entrega, instrucciones especiales..."
                  {...field}
                  disabled={isLoading}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Continuar con WhatsApp"}
        </Button>
      </form>
    </Form>
  );
}

export default CustomerInfoForm;
