import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MultipleStockCountForm } from "@/components/forms/stock-count-form";
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
    mutationFn: async (data: InsertStockCount[]) => {
      // Process multiple stock counts
      const promises = data.map(item => 
        apiRequest("POST", "/api/stock-counts", item).then(response => response.json())
      );
      return Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/sales-by-client"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/sales-by-product"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/current-stock"] });
      // Invalidate stock-related queries as well
      queryClient.invalidateQueries({ queryKey: ["/api/stock", "alerts"] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === "/api/clients" && query.queryKey[2] === "stock"
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === "/api/clients" && query.queryKey[2] === "stock-value"
      });
      toast({
        title: "Sucesso",
        description: `${results.length} contagem${results.length !== 1 ? 's' : ''} de estoque registrada${results.length !== 1 ? 's' : ''} com sucesso!`,
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

  const handleSubmit = (data: InsertStockCount[]) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Contagem de Estoque</DialogTitle>
        </DialogHeader>
        <MultipleStockCountForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}