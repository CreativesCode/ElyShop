"use client";

import { PhoneInputField } from "@/components/forms/PhoneInputField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomerInfoInput, customerInfoSchema } from "../validations";

type CustomerInfoFormProps = {
  onSubmit: (data: CustomerInfoInput) => void;
  isLoading?: boolean;
  initialData?: Partial<CustomerInfoInput>;
};

type ShippingZone = {
  id: string;
  name: string;
  cost: string;
};

const OTHER_VALUE = "__other__";

export function CustomerInfoForm({
  onSubmit,
  isLoading = false,
  initialData,
}: CustomerInfoFormProps) {
  const form = useForm<CustomerInfoInput>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      zone: initialData?.zone || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    },
  });

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [zoneSelectValue, setZoneSelectValue] = useState<string>(OTHER_VALUE);
  const [otherZone, setOtherZone] = useState<string>(initialData?.zone || "");

  const selectedZone = useMemo(() => {
    if (!zoneSelectValue || zoneSelectValue === OTHER_VALUE) return null;
    return shippingZones.find((z) => z.id === zoneSelectValue) ?? null;
  }, [shippingZones, zoneSelectValue]);

  const shippingCost = useMemo(() => {
    if (!selectedZone) return undefined;
    const n = Number(selectedZone.cost);
    return Number.isFinite(n) ? n : undefined;
  }, [selectedZone]);

  // Load zones for selector
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingZones(true);
      try {
        const res = await fetch("/api/shipping-zones");
        const data = await res.json();
        const zones = (data?.zones ?? []) as ShippingZone[];

        if (cancelled) return;
        setShippingZones(zones);
      } catch (e) {
        console.error("Error loading shipping zones:", e);
      } finally {
        if (!cancelled) setLoadingZones(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // When zones load, try to match initial zone to one of them
  useEffect(() => {
    const currentZone = (form.getValues("zone") || "").trim();
    if (!currentZone) {
      setZoneSelectValue(OTHER_VALUE);
      return;
    }

    const matched = shippingZones.find(
      (z) => z.name.trim().toLowerCase() === currentZone.toLowerCase(),
    );

    if (matched) {
      setZoneSelectValue(matched.id);
      form.setValue("zone", matched.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setOtherZone("");
    } else {
      setZoneSelectValue(OTHER_VALUE);
      setOtherZone(currentZone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingZones]);

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
                <PhoneInputField field={field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Selecciona el país y escribe solo el número (sin el +código).
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
              <div className="space-y-2">
                <Select
                  value={zoneSelectValue}
                  onValueChange={(value) => {
                    setZoneSelectValue(value);

                    if (value === OTHER_VALUE) {
                      const v = (otherZone || "").trim();
                      field.onChange(v);
                      return;
                    }

                    const zone = shippingZones.find((z) => z.id === value);
                    if (zone) {
                      field.onChange(zone.name);
                    }
                  }}
                  disabled={isLoading || loadingZones}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingZones
                            ? "Cargando zonas..."
                            : "Selecciona tu zona"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shippingZones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}{" "}
                        {Number.isFinite(Number(z.cost))
                          ? `— ${formatPrice(Number(z.cost))}`
                          : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_VALUE}>
                      Otro / no aparece
                    </SelectItem>
                  </SelectContent>
                </Select>

                {zoneSelectValue === OTHER_VALUE && (
                  <Input
                    placeholder="Escribe tu zona (ej: Camajuaní...)"
                    value={otherZone}
                    onChange={(e) => {
                      const v = e.target.value;
                      setOtherZone(v);
                      field.onChange(v);
                    }}
                    disabled={isLoading}
                  />
                )}
              </div>
              <FormDescription>
                {selectedZone ? (
                  <>
                    Costo de envío para <b>{selectedZone.name}</b>:{" "}
                    <b>{formatPrice(Number(selectedZone.cost))}</b>
                  </>
                ) : (
                  "Si tu zona no aparece, selecciónala como “Otro” y la vendedora te confirmará el costo por WhatsApp antes de pagar."
                )}
              </FormDescription>
              {zoneSelectValue === OTHER_VALUE && (
                <Alert className="mt-2">
                  <AlertTitle>Envío por definir</AlertTitle>
                  <AlertDescription>
                    El costo de envío para esta zona{" "}
                    <b>se confirmará por WhatsApp</b> antes de coordinar el
                    pago.
                  </AlertDescription>
                </Alert>
              )}
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
