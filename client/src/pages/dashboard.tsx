import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, Plus, Search, Wine, Building, Truck, ClipboardList, BarChart3, Check, Menu, X } from "lucide-react";
import ClientDialog from "@/components/dialogs/client-dialog";
import ProductDialog from "@/components/dialogs/product-dialog";
import ConsignmentDialog from "@/components/dialogs/consignment-dialog";
import StockCountDialog from "@/components/dialogs/stock-count-dialog";
import UserDialog from "@/components/dialogs/user-dialog";
import type { DashboardStats, Client, Product, ConsignmentWithDetails, StockCount, User } from "@shared/schema";

type ActiveTab = "dashboard" | "clients" | "products" | "consignments" | "inventory" | "reports" | "users";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [consignmentDialogOpen, setConsignmentDialogOpen] = useState(false);
  const [stockCountDialogOpen, setStockCountDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedConsignment, setSelectedConsignment] = useState<ConsignmentWithDetails | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedClientForInventory, setSelectedClientForInventory] = useState<number | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: activeTab === "dashboard"
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: activeTab === "clients" || activeTab === "consignments" || activeTab === "inventory"
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: activeTab === "products" || activeTab === "consignments"
  });

  const { data: consignments = [], isLoading: consignmentsLoading } = useQuery<ConsignmentWithDetails[]>({
    queryKey: ["/api/consignments"],
    enabled: activeTab === "consignments" || activeTab === "dashboard"
  });

  const { data: stockCounts = [], isLoading: stockCountsLoading } = useQuery<StockCount[]>({
    queryKey: ["/api/stock-counts"],
    enabled: activeTab === "inventory"
  });

  const { data: clientInventory = [] } = useQuery({
    queryKey: ["/api/inventory", selectedClientForInventory],
    enabled: activeTab === "inventory" && !!selectedClientForInventory
  });

  const { data: salesByClient = [] } = useQuery({
    queryKey: ["/api/reports/sales-by-client"],
    enabled: activeTab === "reports"
  });

  const { data: currentStock = [] } = useQuery({
    queryKey: ["/api/reports/current-stock"],
    enabled: activeTab === "reports"
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: activeTab === "users"
  });

  const openClientDialog = (client?: Client) => {
    setSelectedClient(client || null);
    setClientDialogOpen(true);
  };

  const openProductDialog = (product?: Product) => {
    setSelectedProduct(product || null);
    setProductDialogOpen(true);
  };

  const openConsignmentDialog = (consignment?: ConsignmentWithDetails) => {
    setSelectedConsignment(consignment || null);
    setConsignmentDialogOpen(true);
  };

  const openUserDialog = (user?: User) => {
    setSelectedUser(user || null);
    setUserDialogOpen(true);
  };

  const getTabConfig = (tab: ActiveTab) => {
    const configs = {
      dashboard: { title: "Grand Cru Dashboard", description: "Visão geral do sistema de consignações" },
      clients: { title: "Grand Cru - Clientes", description: "Gerenciar estabelecimentos que recebem vinhos em consignação" },
      products: { title: "Grand Cru - Produtos", description: "Gerenciar catálogo de vinhos para consignação" },
      consignments: { title: "Grand Cru - Consignações", description: "Registrar e acompanhar envios de vinhos para clientes" },
      inventory: { title: "Grand Cru - Inventário", description: "Realizar contagem e calcular vendas baseadas no estoque" },
      reports: { title: "Grand Cru - Relatórios", description: "Gerar relatórios de vendas, estoque e desempenho" },
      users: { title: "Grand Cru - Usuários", description: "Gerenciar usuários e perfis de acesso ao sistema" }
    };
    return configs[tab];
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false); // Close sidebar on mobile after selection
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header with menu button */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Grand Cru</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
        
        <Header config={getTabConfig(activeTab)} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Total Consignado</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mt-2" />
                        ) : (
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.totalConsigned || "R$ 0,00"}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Wine className="text-primary text-sm sm:text-base lg:text-xl" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-success font-medium">+12.5%</span>
                      <span className="text-gray-600 ml-2">vs. mês anterior</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Vendas do Mês</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mt-2" />
                        ) : (
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.monthlySales || "R$ 0,00"}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-success text-sm sm:text-base lg:text-xl" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-success font-medium">+8.2%</span>
                      <span className="text-gray-600 ml-2">vs. mês anterior</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Clientes Ativos</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mt-2" />
                        ) : (
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.activeClients || 0}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Building className="text-secondary text-sm sm:text-base lg:text-xl" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-success font-medium">+3</span>
                      <span className="text-gray-600 ml-2">novos este mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Produtos</p>
                        {statsLoading ? (
                          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mt-2" />
                        ) : (
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                        )}
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                        <Wine className="text-warning text-sm sm:text-base lg:text-xl" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                      <span className="text-gray-600">12 tipos diferentes</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="p-3 sm:p-4 lg:p-6">
                    <CardTitle className="text-lg sm:text-xl">Consignações Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {consignmentsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between py-3">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="space-y-2 text-right">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consignments.slice(0, 3).map((consignment) => (
                          <div key={consignment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div>
                              <p className="font-medium text-gray-900">{consignment.client.name}</p>
                              <p className="text-sm text-gray-600">
                                {consignment.items.reduce((sum, item) => sum + item.quantity, 0)} Garrafas • 
                                {consignment.items[0]?.product.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatCurrency(consignment.totalValue)}</p>
                              <p className="text-sm text-gray-500">{formatDate(consignment.date)}</p>
                            </div>
                          </div>
                        ))}
                        {consignments.length === 0 && (
                          <p className="text-gray-500 text-center py-8">Nenhuma consignação registrada</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

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
          )}

          {/* Clients Content */}
          {activeTab === "clients" && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Clientes</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600">Gerenciar estabelecimentos que recebem vinhos em consignação</p>
                </div>
                <Button onClick={() => openClientDialog()} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar clientes..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Cliente</TableHead>
                        <TableHead className="min-w-[120px]">CNPJ</TableHead>
                        <TableHead className="min-w-[120px]">Responsável</TableHead>
                        <TableHead className="min-w-[100px]">Telefone</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientsLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : clients.length > 0 ? (
                        clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-gray-600">{client.address}</p>
                              </div>
                            </TableCell>
                            <TableCell>{client.cnpj}</TableCell>
                            <TableCell>{client.contactName}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>
                              <Badge variant={client.isActive ? "default" : "secondary"}>
                                {client.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openClientDialog(client)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Nenhum cliente cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Content */}
          {activeTab === "products" && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Produtos (Vinhos)</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600">Gerenciar catálogo de vinhos para consignação</p>
                </div>
                <Button onClick={() => openProductDialog()} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar produtos..." className="pl-10" />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Select>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="tinto">Tinto</SelectItem>
                        <SelectItem value="branco">Branco</SelectItem>
                        <SelectItem value="rose">Rosé</SelectItem>
                        <SelectItem value="espumante">Espumante</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Todos os países" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os países</SelectItem>
                        <SelectItem value="argentina">Argentina</SelectItem>
                        <SelectItem value="brasil">Brasil</SelectItem>
                        <SelectItem value="chile">Chile</SelectItem>
                        <SelectItem value="franca">França</SelectItem>
                        <SelectItem value="italia">Itália</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {productsLoading ? (
                    [...Array(8)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="w-full h-32 rounded-lg mb-4" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24 mb-4" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="w-full h-32 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {product.photo ? (
                              <img 
                                src={product.photo} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                <Wine className="text-4xl text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">{product.type}</Badge>
                              <Badge variant="outline" className="text-xs">{product.volume}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{product.country}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">{formatCurrency(product.unitPrice)}</span>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => openProductDialog(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhum produto cadastrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consignments Content */}
          {activeTab === "consignments" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div>
                  <CardTitle>Consignações</CardTitle>
                  <p className="text-gray-600">Registrar envios de vinhos para clientes</p>
                </div>
                <Button onClick={() => openConsignmentDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Consignação
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar consignações..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="date" className="w-48" />
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Data</TableHead>
                        <TableHead className="min-w-[150px]">Cliente</TableHead>
                        <TableHead className="min-w-[120px]">Produtos</TableHead>
                        <TableHead className="min-w-[100px]">Quantidade</TableHead>
                        <TableHead className="min-w-[100px]">Valor Total</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consignmentsLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : consignments.length > 0 ? (
                        consignments.map((consignment) => (
                          <TableRow key={consignment.id}>
                            <TableCell>{formatDate(consignment.date)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{consignment.client.name}</p>
                                <p className="text-sm text-gray-600">{consignment.client.contactName}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{consignment.items[0]?.product.name}</p>
                                {consignment.items.length > 1 && (
                                  <p className="text-sm text-gray-600">+{consignment.items.length - 1} produtos</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {consignment.items.reduce((sum, item) => sum + item.quantity, 0)} garrafas
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(consignment.totalValue)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                consignment.status === "completed" ? "default" :
                                consignment.status === "delivered" ? "secondary" : "outline"
                              }>
                                {consignment.status === "pending" ? "Pendente" :
                                 consignment.status === "delivered" ? "Entregue" : "Finalizado"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openConsignmentDialog(consignment)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {consignment.status === "pending" && (
                                  <Button variant="ghost" size="sm">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Nenhuma consignação registrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Content */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                  <div>
                    <CardTitle>Contagem de Estoque</CardTitle>
                    <p className="text-gray-600">Registrar contagem física de estoque nos clientes</p>
                  </div>
                  <Button onClick={() => setStockCountDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Contagem
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Filtrar por Cliente</label>
                      <Select onValueChange={(value) => setSelectedClientForInventory(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os clientes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Todos os clientes</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="pending">Pendente contagem</SelectItem>
                          <SelectItem value="counted">Já contado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar produtos..." className="pl-10" />
                      </div>
                    </div>
                  </div>

                  {selectedClientForInventory && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Estoque do Cliente: {clients.find(c => c.id === selectedClientForInventory)?.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="min-w-[150px]">Produto</TableHead>
                                <TableHead className="min-w-[80px]">Tipo</TableHead>
                                <TableHead className="min-w-[80px]">Enviado</TableHead>
                                <TableHead className="min-w-[80px]">Contado</TableHead>
                                <TableHead className="min-w-[80px]">Vendido</TableHead>
                                <TableHead className="min-w-[100px]">Valor Unit.</TableHead>
                                <TableHead className="min-w-[100px]">Total Vendido</TableHead>
                                <TableHead className="min-w-[120px]">Última Contagem</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientInventory.length > 0 ? (
                                clientInventory.map((item: any) => (
                                  <TableRow key={item.product.id}>
                                    <TableCell className="font-medium">{item.product.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{item.product.type}</Badge>
                                    </TableCell>
                                    <TableCell>{item.totalSent}</TableCell>
                                    <TableCell>{item.totalCounted}</TableCell>
                                    <TableCell>
                                      <span className={item.totalSold > 0 ? "text-green-600 font-medium" : ""}>
                                        {item.totalSold}
                                      </span>
                                    </TableCell>
                                    <TableCell>{formatCurrency(item.product.unitPrice)}</TableCell>
                                    <TableCell>
                                      <span className={item.totalSold > 0 ? "text-green-600 font-medium" : ""}>
                                        {formatCurrency(item.totalSold * parseFloat(item.product.unitPrice))}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-gray-500">
                                        {item.lastCountDate ? formatDate(item.lastCountDate) : "Nunca"}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                    Nenhum produto consignado para este cliente
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Contagens Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[150px]">Cliente</TableHead>
                              <TableHead className="min-w-[120px]">Produto</TableHead>
                              <TableHead className="min-w-[80px]">Enviado</TableHead>
                              <TableHead className="min-w-[80px]">Contado</TableHead>
                              <TableHead className="min-w-[80px]">Vendido</TableHead>
                              <TableHead className="min-w-[100px]">Total Vendido</TableHead>
                              <TableHead className="min-w-[100px]">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockCountsLoading ? (
                              [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                </TableRow>
                              ))
                            ) : stockCounts.length > 0 ? (
                              stockCounts.map((count) => {
                                const client = clients.find(c => c.id === count.clientId);
                                const product = products.find(p => p.id === count.productId);
                                return (
                                  <TableRow key={count.id}>
                                    <TableCell className="font-medium">{client?.name || "Cliente não encontrado"}</TableCell>
                                    <TableCell>{product?.name || "Produto não encontrado"}</TableCell>
                                    <TableCell>{count.quantitySent}</TableCell>
                                    <TableCell>{count.quantityRemaining}</TableCell>
                                    <TableCell>
                                      <span className={count.quantitySold > 0 ? "text-green-600 font-medium" : ""}>
                                        {count.quantitySold}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className={parseFloat(count.totalSold) > 0 ? "text-green-600 font-medium" : ""}>
                                        {formatCurrency(count.totalSold)}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-gray-500">
                                        {formatDate(count.countDate)}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  Nenhuma contagem de estoque registrada
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Content */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios de Vendas e Estoque</CardTitle>
                  <p className="text-gray-600">Dados atualizados em tempo real baseados nas contagens de estoque</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Vendas por Cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales-by-client">Vendas por Cliente</SelectItem>
                          <SelectItem value="sales-by-product">Vendas por Produto</SelectItem>
                          <SelectItem value="current-stock">Estoque Atual</SelectItem>
                          <SelectItem value="consignment-history">Histórico de Consignações</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Data Inicial</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Data Final</label>
                      <Input type="date" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={() => {
                        // Invalidate queries to refresh data
                        queryClient.invalidateQueries({ queryKey: ["/api/reports/sales-by-client"] });
                        queryClient.invalidateQueries({ queryKey: ["/api/reports/current-stock"] });
                      }}>
                        Atualizar Dados
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Resumo de Vendas</CardTitle>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesByClient.length > 0 ? (
                        salesByClient.map((sale: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                              <p className="font-medium">{sale.client.name}</p>
                              <p className="text-sm text-gray-600">{sale.quantitySold} garrafas vendidas</p>
                            </div>
                            <span className="font-bold text-success">{formatCurrency(sale.totalSales)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Status do Estoque</CardTitle>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentStock.length > 0 ? (
                        currentStock.map((stock: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                              <p className="font-medium">{stock.product.name}</p>
                              <p className="text-sm text-gray-600">Em {stock.clientCount} clientes</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{stock.totalRemaining} garrafas</p>
                              <p className="text-sm text-success">{formatCurrency(stock.value)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nenhum estoque disponível</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Users Content */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Gerenciamento de Usuários</CardTitle>
                    <p className="text-gray-600">Controle de acesso e perfis do sistema</p>
                  </div>
                  <Button onClick={() => openUserDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Último Acesso</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersLoading ? (
                          Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                          ))
                        ) : users.length > 0 ? (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  user.role === "admin" ? "default" : 
                                  user.role === "manager" ? "secondary" : 
                                  "outline"
                                }>
                                  {user.role === "admin" ? "Administrador" : 
                                   user.role === "manager" ? "Gerente" : "Usuário"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openUserDialog(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Nenhum usuário cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <ClientDialog 
        open={clientDialogOpen} 
        onOpenChange={setClientDialogOpen}
        client={selectedClient}
        onClose={() => {
          setClientDialogOpen(false);
          setSelectedClient(null);
        }}
      />
      <ProductDialog 
        open={productDialogOpen} 
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onClose={() => {
          setProductDialogOpen(false);
          setSelectedProduct(null);
        }}
      />
      <ConsignmentDialog 
        open={consignmentDialogOpen} 
        onOpenChange={setConsignmentDialogOpen}
        consignment={selectedConsignment}
        onClose={() => {
          setConsignmentDialogOpen(false);
          setSelectedConsignment(null);
        }}
      />
      <StockCountDialog 
        open={stockCountDialogOpen} 
        onOpenChange={setStockCountDialogOpen}
        onClose={() => {
          setStockCountDialogOpen(false);
        }}
      />
      <UserDialog 
        open={userDialogOpen} 
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        onClose={() => {
          setUserDialogOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
