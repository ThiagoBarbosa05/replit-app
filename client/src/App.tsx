import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import DashboardOverview from "@/pages/dashboard-overview";
import ClientsPage from "@/pages/clients-page";
import ProductsPage from "@/pages/products-page";
import ConsignmentsPage from "@/pages/consignments-page";
import InventoryPage from "@/pages/inventory-page";
import ReportsPage from "@/pages/reports-page";
import UsersPage from "@/pages/users-page";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout title="Grand Cru Dashboard" description="Visão geral do sistema de consignações">
          <DashboardOverview />
        </MainLayout>
      </Route>
      <Route path="/clients">
        <MainLayout title="Grand Cru - Clientes" description="Gerenciar estabelecimentos que recebem vinhos em consignação">
          <ClientsPage />
        </MainLayout>
      </Route>
      <Route path="/products">
        <MainLayout title="Grand Cru - Produtos" description="Gerenciar catálogo de vinhos para consignação">
          <ProductsPage />
        </MainLayout>
      </Route>
      <Route path="/consignments">
        <MainLayout title="Grand Cru - Consignações" description="Registrar e acompanhar envios de vinhos para clientes">
          <ConsignmentsPage />
        </MainLayout>
      </Route>
      <Route path="/inventory">
        <MainLayout title="Grand Cru - Inventário" description="Realizar contagem e calcular vendas baseadas no estoque">
          <InventoryPage />
        </MainLayout>
      </Route>
      <Route path="/reports">
        <MainLayout title="Grand Cru - Relatórios" description="Gerar relatórios de vendas, estoque e desempenho">
          <ReportsPage />
        </MainLayout>
      </Route>
      <Route path="/users">
        <MainLayout title="Grand Cru - Usuários" description="Gerenciar usuários e perfis de acesso ao sistema">
          <UsersPage />
        </MainLayout>
      </Route>
      <Route>
        <MainLayout title="404" description="Página não encontrada">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Página não encontrada</h1>
            <p className="text-gray-600 mt-2">A página que você está procurando não existe.</p>
          </div>
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
