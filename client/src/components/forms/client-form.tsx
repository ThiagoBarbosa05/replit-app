import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client, InsertClient } from "@shared/schema";

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: InsertClient) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ClientForm({ client, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: client?.name || "",
      cnpj: client?.cnpj || "",
      address: client?.address || "",
      phone: client?.phone || "",
      contactName: client?.contactName || "",
    },
  });

  const handleSubmit = (data: InsertClient) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome da Empresa *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Ex: Restaurante Villa Toscana"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            {...form.register("cnpj")}
            placeholder="00.000.000/0000-00"
          />
          {form.formState.errors.cnpj && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.cnpj.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Endereço Completo *</Label>
        <Input
          id="address"
          {...form.register("address")}
          placeholder="Rua, número, bairro, cidade, estado"
        />
        {form.formState.errors.address && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactName">Nome do Responsável *</Label>
          <Input
            id="contactName"
            {...form.register("contactName")}
            placeholder="Ex: Maria Silva"
          />
          {form.formState.errors.contactName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="(00) 00000-0000"
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="sm:w-auto">
          {isLoading ? "Salvando..." : client ? "Atualizar" : "Criar Cliente"}
        </Button>
      </div>
    </form>
  );
}
