import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Wine, TrendingUp, Package, DollarSign } from "lucide-react";
import type { DashboardStats, Product, ConsignmentWithDetails } from "@shared/schema";

export default function DashboardOverview() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"]
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: consignments = [] } = useQuery<ConsignmentWithDetails[]>({
    queryKey: ["/api/consignments"]
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de consignações</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consignado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalConsigned || "R$ 0,00"}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.monthlySales || "R$ 0,00"}
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
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeClients || 0}
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
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consignments */}
        <Card>
          <CardHeader>
            <CardTitle>Consignações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consignments.slice(0, 5).map((consignment) => (
                <div key={consignment.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{consignment.client?.name}</p>
                      <p className="text-sm text-gray-600">{formatDate(consignment.date)}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">{formatCurrency(consignment.totalValue)}</span>
                </div>
              ))}
              {consignments.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhuma consignação registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Wine className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.type} • {product.country}</p>
                    </div>
                  </div>
                  <span className="text-success font-medium">{formatCurrency(product.unitPrice)}</span>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}