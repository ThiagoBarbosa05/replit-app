import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, Phone, MapPin, User, Hash, Calendar, TrendingUp, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, ConsignmentWithDetails } from "@shared/schema";

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export default function ClientDetailsDialog({ open, onOpenChange, client }: ClientDetailsDialogProps) {
  // Buscar consignações do cliente
  const { data: clientConsignments = [] } = useQuery<ConsignmentWithDetails[]>({
    queryKey: ["/api/consignments", client?.id],
    queryFn: async () => {
      if (!client?.id) return [];
      const response = await fetch(`/api/consignments?clientId=${client.id}`);
      if (!response.ok) throw new Error('Failed to fetch consignments');
      return response.json();
    },
    enabled: open && !!client?.id
  });

  // Buscar inventário do cliente
  const { data: clientInventory = [] } = useQuery({
    queryKey: ["/api/clients", client?.id, "inventory"],
    queryFn: async () => {
      if (!client?.id) return [];
      const response = await fetch(`/api/clients/${client.id}/inventory`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    },
    enabled: open && !!client?.id
  });

  if (!client) return null;

 console.log(client)
  // Calcular estatísticas
  const totalConsignments = clientConsignments.length;
  const totalProducts = clientConsignments.reduce((sum, c) => sum + c.items.length, 0);
  const totalValue = clientConsignments.reduce((sum, c) => sum + parseFloat(c.totalValue || '0'), 0);
  const totalSold = clientInventory.reduce((sum: number, item: any) => {
    return sum + (item.totalSold || 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };


  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Detalhes do Cliente
          </DialogTitle>
          <DialogDescription>
            Visualize informações completas, histórico de consignações e inventário atual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {client.name}
                    <Badge variant={client.isActive ? "default" : "destructive"}>
                      {client.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="w-4 h-4" />
                  <span>{client.cnpj}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <div className="font-medium">Endereço</div>
                    <div className="text-gray-600">{client.address}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Telefone</div>
                    <div className="text-gray-600">{client.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Responsável</div>
                    <div className="text-gray-600">{client.contactName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Data de Cadastro</div>
                    <div className="text-gray-600">{formatDate(client.createdAt || new Date())}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 min-w-4 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{totalConsignments}</div>
                    <div className="text-xs text-gray-500">Consignações</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 min-w-4 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <div className="text-xs text-gray-500">Produtos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 min-w-4 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                    <div className="text-xs text-gray-500">Valor Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 min-w-4 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{totalSold || 0}</div>
                    <div className="text-xs text-gray-500">Vendidos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Consignações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Consignações</CardTitle>
            </CardHeader>
            <CardContent>
              {clientConsignments.length > 0 ? (
                <div className="space-y-3">
                  {clientConsignments.slice(0, 5).map((consignment) => (
                    <div key={`consignment-${consignment.id}`} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Consignação #{consignment.id}</div>
                        <div className="text-sm text-gray-600">
                          {consignment.items.length} produto(s) • {formatDate(consignment.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(parseFloat(consignment.totalValue || '0'))}</div>
                        <Badge variant="outline" className="text-xs">
                          {consignment.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} unidades
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {clientConsignments.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      E mais {clientConsignments.length - 5} consignações...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma consignação encontrada para este cliente
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventário Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventário Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {clientInventory.length > 0 ? (
                <div className="space-y-3">
                  {clientInventory.slice(0, 5).map((item: any, index: number) => (
                    <div key={`inventory-${item.product?.id || index}`} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.product?.name || 'Produto sem nome'}</div>
                        <div className="text-sm text-gray-600">
                          Enviado: {item.totalSent || 0} • Contado: {item.totalCounted || 0}
                        </div>
                        {item.lastCountDate && (
                          <div className="text-xs text-gray-500">
                            Última contagem: {formatDate(item.lastCountDate)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          Vendido: {item.totalSold || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(parseFloat(item.product?.unitPrice || '0'))} cada
                        </div>
                      </div>
                    </div>
                  ))}
                  {clientInventory.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      E mais {clientInventory.length - 5} produtos...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhum produto em estoque para este cliente
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}