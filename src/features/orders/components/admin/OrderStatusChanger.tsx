"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { OrderStatus } from "@/lib/supabase/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getOrderStatusInfo,
  getValidNextStatuses,
} from "../../utils/orderStatus";

type OrderStatusChangerProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export default function OrderStatusChanger({
  orderId,
  currentStatus,
}: OrderStatusChangerProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );
  const [isChanging, setIsChanging] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const validNextStatuses = getValidNextStatuses(currentStatus);
  const currentStatusInfo = getOrderStatusInfo(currentStatus) || {
    label: "Desconocido",
    description: "Estado desconocido",
    icon: () => null,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
  };
  const CurrentIcon = currentStatusInfo.icon;

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setIsChanging(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/change-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newStatus: selectedStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar el estado");
      }

      toast({
        title: "Estado actualizado",
        description: `La orden ahora está en estado: ${getOrderStatusInfo(selectedStatus)?.label || selectedStatus}`,
      });

      setShowConfirmDialog(false);
      setSelectedStatus(null);
      router.refresh();
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSelectedStatus(value as OrderStatus);
  };

  const handleConfirmClick = () => {
    if (selectedStatus) {
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado actual */}
          <div>
            <Label className="text-sm text-muted-foreground">
              Estado Actual
            </Label>
            <div
              className={`mt-2 flex items-center gap-3 p-3 rounded-lg border ${currentStatusInfo.borderColor} ${currentStatusInfo.bgColor}`}
            >
              <CurrentIcon size={20} className={currentStatusInfo.color} />
              <div>
                <p className={`font-medium ${currentStatusInfo.color}`}>
                  {currentStatusInfo.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentStatusInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Selector de nuevo estado */}
          {validNextStatuses.length > 0 ? (
            <div className="space-y-3">
              <Label htmlFor="new-status">Cambiar Estado</Label>
              <Select
                value={selectedStatus || undefined}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Selecciona un nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {validNextStatuses.map((status) => {
                    const statusInfo = getOrderStatusInfo(status);
                    const Icon = statusInfo.icon;
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {statusInfo.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Button
                onClick={handleConfirmClick}
                disabled={!selectedStatus || isChanging}
                className="w-full"
              >
                {isChanging ? "Actualizando..." : "Actualizar Estado"}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              Esta orden está en un estado final y no puede cambiar.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar estado de la orden?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus && (
                <>
                  Estás a punto de cambiar el estado de{" "}
                  <strong>{currentStatusInfo.label}</strong> a{" "}
                  <strong>
                    {getOrderStatusInfo(selectedStatus)?.label ||
                      selectedStatus}
                  </strong>
                  .
                  <br />
                  <br />
                  Esta acción se registrará y puede afectar el inventario o
                  notificaciones al cliente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirmar Cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
