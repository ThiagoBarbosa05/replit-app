import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, InsertProduct } from "@shared/schema";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: InsertProduct) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const wineTypes = [
  { value: "tinto", label: "Tinto" },
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "espumante", label: "Espumante" },
  { value: "fortificado", label: "Fortificado" },
];

const countries = [
  { value: "Argentina", label: "Argentina" },
  { value: "Brasil", label: "Brasil" },
  { value: "Chile", label: "Chile" },
  { value: "França", label: "França" },
  { value: "Itália", label: "Itália" },
  { value: "Portugal", label: "Portugal" },
  { value: "Espanha", label: "Espanha" },
  { value: "Estados Unidos", label: "Estados Unidos" },
];

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      country: product?.country || "",
      type: product?.type || "",
      unitPrice: product?.unitPrice || "0",
    },
  });

  const handleSubmit = (data: InsertProduct) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Vinho *</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Ex: Malbec Argentino 2020"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipo de Vinho *</Label>
          <Select onValueChange={(value) => form.setValue("type", value)} defaultValue={product?.type}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {wineTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">País de Origem *</Label>
          <Select onValueChange={(value) => form.setValue("country", value)} defaultValue={product?.country}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.country && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.country.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="unitPrice">Valor Unitário (R$) *</Label>
        <Input
          id="unitPrice"
          type="number"
          step="0.01"
          min="0"
          {...form.register("unitPrice")}
          placeholder="0,00"
        />
        {form.formState.errors.unitPrice && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.unitPrice.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : product ? "Atualizar" : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}
