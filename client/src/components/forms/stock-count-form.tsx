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
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, AlertTriangle, Package, Trash2 } from "lucide-react";
import type { Client, InsertStockCount } from "@shared/schema";

interface ProductCount {
  productId: number;
  productName: string;
  productType: string;
  quantitySent: number;
  quantityRemaining: number;
  unitPrice: string;
  consignmentId: number;
}

interface MultipleStockCountFormProps {
  onSubmit: (data: InsertStockCount[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

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
    queryKey: ["/api/clients", selectedClientId, "inventory"],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clients/${selectedClientId}/inventory`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    enabled: !!selectedClientId
  });

  const { data: difference } = useQuery({
    queryKey: ["/api/clients", selectedClientId, "inventory", selectedProductId, "difference"],
    queryFn: async () => {
      if (!selectedClientId || !selectedProductId) return null;
      const response = await fetch(`/api/clients/${selectedClientId}/inventory`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const inventory = await response.json();
      const product = inventory.find((item: any) => item.productId === selectedProductId);
      return product ? {
        sent: product.totalSent || 0,
        remaining: product.totalRemaining || 0,
        sold: product.totalSold || 0
      } : null;
    },
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

export function MultipleStockCountForm({ onSubmit, onCancel, isLoading }: MultipleStockCountFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductCount[]>([]);
  const [countDate, setCountDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory", selectedClientId],
    enabled: !!selectedClientId
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    setSelectedClientId(id);
    setSelectedProducts([]);
  };

  const handleProductToggle = (item: any, checked: boolean) => {
    if (checked) {
      const newProduct: ProductCount = {
        productId: item.product.id,
        productName: item.product.name,
        productType: item.product.type,
        quantitySent: item.totalSent,
        quantityRemaining: item.totalSent, // Default to sent quantity
        unitPrice: item.product.unitPrice,
        consignmentId: 1 // Simplified for now
      };
      setSelectedProducts(prev => [...prev, newProduct]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.productId !== item.product.id));
    }
  };

  const updateProductCount = (productId: number, quantityRemaining: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.productId === productId
          ? { ...p, quantityRemaining }
          : p
      )
    );
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const handleSubmit = () => {
    const stockCounts: InsertStockCount[] = selectedProducts.map(product => ({
      clientId: selectedClientId!,
      productId: product.productId,
      consignmentId: product.consignmentId,
      quantitySent: product.quantitySent,
      quantityRemaining: product.quantityRemaining,
      unitPrice: product.unitPrice,
      countDate: new Date(countDate)
    }));

    onSubmit(stockCounts);
  };

  const calculateTotals = () => {
    return selectedProducts.reduce((acc, product) => {
      const sold = product.quantitySent - product.quantityRemaining;
      const value = sold * parseFloat(product.unitPrice);
      
      return {
        totalSent: acc.totalSent + product.quantitySent,
        totalCounted: acc.totalCounted + product.quantityRemaining,
        totalSold: acc.totalSold + sold,
        totalValue: acc.totalValue + value
      };
    }, { totalSent: 0, totalCounted: 0, totalSold: 0, totalValue: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Contagem Múltipla de Estoque</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            </div>
            
            <div>
              <Label htmlFor="countDate">Data da Contagem *</Label>
              <Input
                id="countDate"
                type="date"
                value={countDate}
                onChange={(e) => setCountDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Selection */}
      {selectedClientId && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Disponíveis</CardTitle>
            <p className="text-sm text-gray-600">Selecione os produtos para contagem</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.map((item: any) => {
                const isSelected = selectedProducts.some(p => p.productId === item.product.id);
                
                return (
                  <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleProductToggle(item, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-600">
                        <Badge variant="outline" className="mr-2">{item.product.type}</Badge>
                        {item.totalSent} enviadas • {formatCurrency(item.product.unitPrice)} cada
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Products Table */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Selecionados para Contagem</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Contado</TableHead>
                  <TableHead>Vendido</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.map((product) => {
                  const sold = product.quantitySent - product.quantityRemaining;
                  const totalValue = sold * parseFloat(product.unitPrice);
                  
                  return (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.productType}</Badge>
                      </TableCell>
                      <TableCell>{product.quantitySent}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={product.quantitySent}
                          value={product.quantityRemaining}
                          onChange={(e) => updateProductCount(product.productId, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <span className={sold > 0 ? "text-green-600 font-medium" : ""}>
                          {sold}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                      <TableCell>
                        <span className={totalValue > 0 ? "text-green-600 font-medium" : ""}>
                          {formatCurrency(totalValue)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enviado</p>
                  <p className="text-xl font-bold text-blue-600">{totals.totalSent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contado</p>
                  <p className="text-xl font-bold text-green-600">{totals.totalCounted}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendido</p>
                  <p className="text-xl font-bold text-orange-600">{totals.totalSold}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalValue)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Warnings */}
      {selectedProducts.some(p => p.quantityRemaining > p.quantitySent) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">
              Atenção: Alguns produtos têm quantidade contada maior que a enviada
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Verifique se as contagens estão corretas.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !selectedClientId || selectedProducts.length === 0}
        >
          {isLoading ? "Salvando..." : `Registrar ${selectedProducts.length} Contagem${selectedProducts.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}