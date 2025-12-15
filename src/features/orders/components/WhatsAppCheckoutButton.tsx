"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomerInfoInput } from "../validations";
import CustomerInfoForm from "./CustomerInfoForm";

type CartItem = {
  productId: string;
  quantity: number;
  color?: string | null;
  size?: string | null;
  material?: string | null;
};

type WhatsAppCheckoutButtonProps = {
  cartItems: CartItem[];
  disabled?: boolean;
  className?: string;
};

export function WhatsAppCheckoutButton({
  cartItems,
  disabled = false,
  className,
}: WhatsAppCheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (customerData: CustomerInfoInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          customerData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "INSUFFICIENT_STOCK") {
          toast({
            title: "Stock insuficiente",
            description:
              data.message || "Algunos productos no tienen stock disponible",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        throw new Error(data.message || "Error al crear la orden");
      }

      // Éxito - cerrar modal
      setIsOpen(false);

      // Mostrar mensaje de éxito
      toast({
        title: "¡Orden creada exitosamente!",
        description: `Tu orden ${data.orderNumber} ha sido reservada. Serás redirigido a WhatsApp.`,
      });

      // Disparar evento para que el carrito se recargue (se habrá limpiado en el backend)
      window.dispatchEvent(new Event("cart-updated"));

      // Redirigir a la página de confirmación
      router.push(
        `/orders/confirmation?orderId=${data.orderId}&orderNumber=${data.orderNumber}`,
      );

      // Abrir WhatsApp después de un pequeño delay
      setTimeout(() => {
        window.open(data.whatsappUrl, "_blank");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating WhatsApp order:", error);
      toast({
        title: "Error",
        description:
          error.message || "No se pudo crear la orden. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={className}
          disabled={disabled || cartItems.length === 0}
        >
          <Image
            src="/assets/whatsapp.svg"
            alt="WhatsApp"
            width={20}
            height={20}
            className="mr-2 h-4 w-4"
          />
          Continuar con WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información de entrega</DialogTitle>
          <DialogDescription>
            Completa tus datos para continuar con el pago por WhatsApp. La
            vendedora se pondrá en contacto contigo para confirmar el pedido.
          </DialogDescription>
        </DialogHeader>
        <CustomerInfoForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}

export default WhatsAppCheckoutButton;
