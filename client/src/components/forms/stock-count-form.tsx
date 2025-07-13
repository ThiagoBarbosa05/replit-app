import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertStockCountSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle } from "lucide-react";
import type { Client, InsertStockCount } from "@shared/schema";

interface StockCountFormProps {
  onSubmit: (data: InsertStockCount) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function StockCountForm({ onSubmit, onCancel, isLoading }: StockCountFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory", selectedClientId],
    enabled: !!selectedClientId
  });

  const { data: difference } = useQuery({
    queryKey: ["/api/inventory", selectedClientId, selectedProductId, "difference"],
    enabled: !!selectedClientId && !!selectedProductId
  });

  const form = useForm<InsertStockCount>({
    resolver: zodResolver(insertStockCountSchema),
    defaultValues: {
      clientId: 0,
      productId: 0,
      consignmentId: 0,
      quantitySent: 0,
      quantityRemaining: 0,
      unitPrice: "0",
    },
  });

  const handleSubmit = (data: InsertStockCount) => {
    onSubmit(data);
  };

  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    setSelectedClientId(id);
    setSelectedProductId(null);
    form.setValue("clientId", id);
    form.setValue("productId", 0);
  };

  const handleProductChange = (productId: string) => {
    const id = parseInt(productId);
    setSelectedProductId(id);
    form.setValue("productId", id);
    
    const selectedItem = inventory.find((item: any) => item.product.id === id);
    if (selectedItem) {
      form.setValue("quantitySent", selectedItem.totalSent);
      form.setValue("unitPrice", selectedItem.product.unitPrice);
      form.setValue("consignmentId", 1); // Simplified for now
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Nunca";
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientId">Cliente *</Label>
          <Select onValueChange={handleClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.clientId && (
            <p className="text-sm text-red-500 mt-1">Cliente é obrigatório</p>
          )}
        </div>

        <div>
          <Label htmlFor="productId">Produto *</Label>
          <Select onValueChange={handleProductChange} disabled={!selectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {inventory.map((item: any) => (
                <SelectItem key={item.product.id} value={item.product.id.toString()}>
                  {item.product.name} - {item.product.type}
                  <Badge variant="outline" className="ml-2">
                    {item.totalSent} enviadas
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.productId && (
            <p className="text-sm text-red-500 mt-1">Produto é obrigatório</p>
          )}
        </div>
      </div>

      {selectedClientId && selectedProductId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Informações do Estoque</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total Enviado</p>
                <p className="text-2xl font-bold text-blue-600">{difference?.totalSent || 0}</p>
                <p className="text-xs text-gray-500">garrafas</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Estoque Atual</p>
                <p className="text-2xl font-bold text-green-600">{difference?.remainingStock || 0}</p>
                <p className="text-xs text-gray-500">garrafas</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Vendido</p>
                <p className="text-2xl font-bold text-orange-600">{difference?.soldQuantity || 0}</p>
                <p className="text-xs text-gray-500">garrafas</p>
              </div>
            </div>

            {difference?.salesValue > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Valor Total Vendido: {formatCurrency(difference.salesValue)}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Última contagem: {formatDate(difference.lastCountDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantitySent">Quantidade Enviada</Label>
          <Input
            id="quantitySent"
            type="number"
            min="0"
            {...form.register("quantitySent", { valueAsNumber: true })}
            placeholder="0"
            readOnly
          />
          {form.formState.errors.quantitySent && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.quantitySent.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="quantityRemaining">Quantidade Contada *</Label>
          <Input
            id="quantityRemaining"
            type="number"
            min="0"
            {...form.register("quantityRemaining", { valueAsNumber: true })}
            placeholder="0"
          />
          {form.formState.errors.quantityRemaining && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.quantityRemaining.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unitPrice">Valor Unitário (R$)</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            {...form.register("unitPrice")}
            placeholder="0,00"
            readOnly
          />
          {form.formState.errors.unitPrice && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.unitPrice.message}</p>
          )}
        </div>
      </div>

      {form.watch("quantityRemaining") > form.watch("quantitySent") && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">
              Atenção: Quantidade contada é maior que a enviada
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Verifique se a contagem está correta.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !selectedClientId || !selectedProductId}>
          {isLoading ? "Salvando..." : "Registrar Contagem"}
        </Button>
      </div>
    </form>
  );
}