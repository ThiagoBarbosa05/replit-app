import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConsignmentForm from "@/components/forms/consignment-form";
import type { ConsignmentWithDetails, InsertConsignmentItem } from "@shared/schema";

interface ConsignmentFormData {
  clientId: number;
  items: InsertConsignmentItem[];
}

interface ConsignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consignment?: ConsignmentWithDetails | null;
  onClose: () => void;
}

export default function ConsignmentDialog({ open, onOpenChange, consignment, onClose }: ConsignmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: ConsignmentFormData) => {
      const response = await apiRequest("POST", "/api/consignments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/current-stock"] });
      toast({
        title: "Sucesso",
        description: "Consignação criada com sucesso!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar consignação",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ConsignmentFormData) => {
      const response = await apiRequest("PUT", `/api/consignments/${consignment?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/current-stock"] });
      toast({
        title: "Sucesso",
        description: "Consignação atualizada com sucesso!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar consignação",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ConsignmentFormData) => {
    if (consignment) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {consignment ? "Editar Consignação" : "Nova Consignação"}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {consignment ? "Atualize as informações da consignação" : "Registre uma nova consignação de vinhos para o cliente"}
          </p>
        </DialogHeader>
        <ConsignmentForm
          consignment={consignment}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
