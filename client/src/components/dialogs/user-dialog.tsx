import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import UserForm from "@/components/forms/user-form";
import { type User, type InsertUser } from "@shared/schema";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onClose: () => void;
}

export default function UserDialog({ open, onOpenChange, user, onClose }: UserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return apiRequest("/api/users", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return apiRequest(`/api/users/${user?.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertUser) => {
    if (user) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuário" : "Cadastrar Usuário"}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}