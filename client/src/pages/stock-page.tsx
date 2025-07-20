import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Eye, Settings, RefreshCw, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface ClientStockItem {
  id: number;
  clientId: number;
  productId: number;
  quantity: number;
  lastUpdated: string;
  minimumAlert: number;
  product: {
    id: number;
    name: string;
    country: string;
    type: string;
    unitPrice: string;
    volume: string;
    photo: string | null;
  };
  client: {
    id: number;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    contactName: string;
    isActive: number;
  };
}

interface StockCountFormData {
  countedQuantity: number;
}

export default function StockPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClientStockItem | null>(null);
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [minimumAlert, setMinimumAlert] = useState<number>(5);

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: clientStock = [], isLoading: stockLoading, refetch: refetchStock } = useQuery<ClientStockItem[]>({
    queryKey: ["/api/clients", selectedClientId, "stock"],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clients/${selectedClientId}/stock`);
      if (!response.ok) throw new Error('Failed to fetch client stock');
      return response.json();
    },
    enabled: !!selectedClientId
  });

  const { data: stockValue } = useQuery<{ totalValue: string }>({
    queryKey: ["/api/clients", selectedClientId, "stock-value"],
    queryFn: async () => {
      if (!selectedClientId) return { totalValue: "0" };
      const response = await fetch(`/api/clients/${selectedClientId}/stock-value`);
      if (!response.ok) throw new Error('Failed to fetch stock value');
      return response.json();
    },
    enabled: !!selectedClientId
  });

  const { data: lowStockAlerts = [] } = useQuery<ClientStockItem[]>({
    queryKey: ["/api/stock", "alerts"],
    queryFn: async () => {
      const response = await fetch("/api/stock/alerts");
      if (!response.ok) throw new Error('Failed to fetch low stock alerts');
      return response.json();
    }
  });

  const stockCountMutation = useMutation({
    mutationFn: async ({ clientId, productId, countedQuantity }: { clientId: number; productId: number; countedQuantity: number }) => {
      const response = await fetch(`/api/clients/${clientId}/stock/${productId}/count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countedQuantity }),
      });
      if (!response.ok) throw new Error('Failed to process stock count');
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Contagem realizada com sucesso",
        description: `Vendas: ${result.quantitySold} unidades (${formatCurrency(parseFloat(result.salesValue))})`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setCountDialogOpen(false);
      setSelectedItem(null);
      refetchStock();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar contagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setMinimumAlertMutation = useMutation({
    mutationFn: async ({ clientId, productId, minimumAlert }: { clientId: number; productId: number; minimumAlert: number }) => {
      const response = await fetch(`/api/clients/${clientId}/stock/${productId}/alert`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minimumAlert }),
      });
      if (!response.ok) throw new Error('Failed to set minimum alert');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alerta de estoque definido",
        description: "Limite mínimo atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setAlertDialogOpen(false);
      setSelectedItem(null);
      refetchStock();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao definir alerta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLowStock = (item: ClientStockItem) => {
    return item.quantity <= item.minimumAlert;
  };

  const openCountDialog = (item: ClientStockItem) => {
    setSelectedItem(item);
    setCountedQuantity(item.quantity);
    setCountDialogOpen(true);
  };

  const openAlertDialog = (item: ClientStockItem) => {
    setSelectedItem(item);
    setMinimumAlert(item.minimumAlert);
    setAlertDialogOpen(true);
  };

  const handleStockCount = () => {
    if (!selectedItem) return;
    stockCountMutation.mutate({
      clientId: selectedItem.clientId,
      productId: selectedItem.productId,
      countedQuantity: countedQuantity
    });
  };

  const handleSetAlert = () => {
    if (!selectedItem) return;
    setMinimumAlertMutation.mutate({
      clientId: selectedItem.clientId,
      productId: selectedItem.productId,
      minimumAlert: minimumAlert
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600">Acompanhe o estoque em tempo real de cada cliente</p>
        </div>
        <Button onClick={() => refetchStock()} disabled={!selectedClientId}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Selecionar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-select">Cliente</Label>
              <Select value={selectedClientId?.toString() || ""} onValueChange={(value) => setSelectedClientId(parseInt(value))}>
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
            {selectedClientId && stockValue && (
              <div>
                <Label>Valor Total do Estoque</Label>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(parseFloat(stockValue.totalValue))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertas de Estoque Baixo ({lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockAlerts.slice(0, 5).map((alert) => (
                <div key={`${alert.clientId}-${alert.productId}`} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                  <div>
                    <span className="font-medium">{alert.client.name}</span>
                    <span className="mx-2">•</span>
                    <span>{alert.product.name}</span>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    {alert.quantity} restantes (mín: {alert.minimumAlert})
                  </Badge>
                </div>
              ))}
              {lowStockAlerts.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  E mais {lowStockAlerts.length - 5} alertas...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Stock Table */}
      {selectedClientId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estoque do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <div className="text-center py-8">Carregando estoque...</div>
            ) : clientStock.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unitário</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientStock.map((item) => (
                      <TableRow key={`${item.clientId}-${item.productId}`} className={isLowStock(item) ? "bg-orange-50" : ""}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            {isLowStock(item) && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600 mt-1">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Estoque baixo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.product.country} • {item.product.type}</div>
                            <div className="text-gray-500">{item.product.volume}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isLowStock(item) ? "destructive" : "outline"}>
                            {item.quantity} unidades
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(parseFloat(item.product.unitPrice))}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.quantity * parseFloat(item.product.unitPrice))}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(item.lastUpdated)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCountDialog(item)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Contar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAlertDialog(item)}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Alerta
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum produto em estoque para este cliente
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock Count Dialog */}
      <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Realizar Contagem de Estoque</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>Produto</Label>
                <div className="text-lg font-medium">{selectedItem.product.name}</div>
                <div className="text-sm text-gray-500">
                  Estoque atual: {selectedItem.quantity} unidades
                </div>
              </div>
              <div>
                <Label htmlFor="counted-quantity">Quantidade Contada</Label>
                <Input
                  id="counted-quantity"
                  type="number"
                  value={countedQuantity}
                  onChange={(e) => setCountedQuantity(parseInt(e.target.value) || 0)}
                  min="0"
                />
                {countedQuantity < selectedItem.quantity && (
                  <div className="text-sm text-green-600 mt-1">
                    Vendas calculadas: {selectedItem.quantity - countedQuantity} unidades
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCountDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleStockCount}
                  disabled={stockCountMutation.isPending}
                >
                  {stockCountMutation.isPending ? "Processando..." : "Confirmar Contagem"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Minimum Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Alerta de Estoque</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label>Produto</Label>
                <div className="text-lg font-medium">{selectedItem.product.name}</div>
                <div className="text-sm text-gray-500">
                  Alerta atual: {selectedItem.minimumAlert} unidades
                </div>
              </div>
              <div>
                <Label htmlFor="minimum-alert">Quantidade Mínima para Alerta</Label>
                <Input
                  id="minimum-alert"
                  type="number"
                  value={minimumAlert}
                  onChange={(e) => setMinimumAlert(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Você será alertado quando o estoque ficar igual ou abaixo desta quantidade
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSetAlert}
                  disabled={setMinimumAlertMutation.isPending}
                >
                  {setMinimumAlertMutation.isPending ? "Salvando..." : "Salvar Alerta"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}