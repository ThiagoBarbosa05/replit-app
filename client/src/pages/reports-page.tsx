import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Users, BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const { data: salesByClient = [] } = useQuery({
    queryKey: ["/api/reports/sales-by-client"]
  });

  const { data: currentStock = [] } = useQuery({
    queryKey: ["/api/reports/current-stock"]
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Gerar relatórios de vendas, estoque e desempenho</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesByClient.reduce((sum: number, client: any) => sum + parseFloat(client.totalSales || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtos em Estoque</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStock.reduce((sum: number, item: any) => sum + (item.quantityRemaining || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes com Vendas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesByClient.filter((client: any) => parseFloat(client.totalSales || 0) > 0).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesByClient.length > 0 
                    ? Math.round((salesByClient.filter((client: any) => parseFloat(client.totalSales || 0) > 0).length / salesByClient.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Client Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Vendas por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Cliente</TableHead>
                  <TableHead className="min-w-[120px]">Total de Vendas</TableHead>
                  <TableHead className="min-w-[100px]">Produtos Vendidos</TableHead>
                  <TableHead className="min-w-[120px]">Ticket Médio</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByClient.length > 0 ? (
                  salesByClient.map((client: any, index: number) => {
                    const totalSales = parseFloat(client.totalSales || 0);
                    const productsSold = client.productsSold || 0;
                    const avgTicket = productsSold > 0 ? totalSales / productsSold : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.clientName}</p>
                            <p className="text-sm text-gray-600">{client.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(totalSales)}
                        </TableCell>
                        <TableCell>{productsSold}</TableCell>
                        <TableCell>{formatCurrency(avgTicket)}</TableCell>
                        <TableCell>
                          <Badge variant={totalSales > 0 ? "default" : "secondary"}>
                            {totalSales > 0 ? "Ativo" : "Sem vendas"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum dado de vendas disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Current Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Estoque Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Produto</TableHead>
                  <TableHead className="min-w-[120px]">Cliente</TableHead>
                  <TableHead className="min-w-[100px]">Enviado</TableHead>
                  <TableHead className="min-w-[100px]">Restante</TableHead>
                  <TableHead className="min-w-[100px]">Vendido</TableHead>
                  <TableHead className="min-w-[100px]">Taxa Venda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStock.length > 0 ? (
                  currentStock.map((item: any, index: number) => {
                    const sellRate = item.quantitySent > 0 ? Math.round((item.quantitySold / item.quantitySent) * 100) : 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-600">{item.productType} • {item.productCountry}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.clientName}</TableCell>
                        <TableCell className="font-medium">{item.quantitySent}</TableCell>
                        <TableCell className="font-medium">{item.quantityRemaining}</TableCell>
                        <TableCell className="font-medium text-green-600">{item.quantitySold}</TableCell>
                        <TableCell>
                          <Badge variant={sellRate > 50 ? "default" : sellRate > 20 ? "secondary" : "outline"}>
                            {sellRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum dado de estoque disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}