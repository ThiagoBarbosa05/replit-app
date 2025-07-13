import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StockCountForm from "@/components/forms/stock-count-form";
import type { InsertStockCount } from "@shared/schema";

interface StockCountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function StockCountDialog({ open, onOpenChange, onClose }: StockCountDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: InsertStockCount) => {
      const response = await apiRequest("POST", "/api/stock-counts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Sucesso",
        description: "Contagem de estoque registrada com sucesso!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar contagem de estoque",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertStockCount) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Contagem de Estoque</DialogTitle>
        </DialogHeader>
        <StockCountForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}