import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Plus, Search, UserX, UserCheck } from "lucide-react";
import ClientDialog from "@/components/dialogs/client-dialog";
import ClientDetailsDialog from "@/components/dialogs/client-details-dialog";
import type { Client } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientDetailsDialogOpen, setClientDetailsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");

  async function toggleClientStatus(client: Client) {
    const action = client.isActive ? "desativar" : "ativar";
    // const confirmation = confirm(
    //   `Tem certeza que deseja ${action} o cliente "${client.name}"?`,
    // );

    try {
      const endpoint = client.isActive ? "deactivate" : "activate";
      const response = await fetch(`/api/clients/${client.id}/${endpoint}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} client`);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });

      // alert(
      //   `Cliente ${action === "desativar" ? "desativado" : "ativado"} com sucesso!`,
      // );
    } catch (error) {
      console.error(`Error ${action}ing client:`, error);
      alert(`Erro ao ${action} cliente. Tente novamente.`);
    }
  }

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients", clientSearch, clientStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (clientSearch) params.append("search", clientSearch);
      if (clientStatusFilter && clientStatusFilter !== "all")
        params.append("status", clientStatusFilter);

      const response = await fetch(`/api/clients?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const openClientDialog = (client?: Client) => {
    setSelectedClient(client || null);
    setClientDialogOpen(true);
  };

  const viewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setClientDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">Clientes</CardTitle>
            <p className="text-sm sm:text-base text-gray-600">
              Gerenciar estabelecimentos que recebem vinhos em consignação
            </p>
          </div>
          <Button
            onClick={() => openClientDialog()}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ ou responsável..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={clientStatusFilter}
              onValueChange={setClientStatusFilter}
            >
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

          <div className="mb-4 text-sm text-gray-600">
            {clientsLoading
              ? "Carregando..."
              : `${clients.length} cliente${clients.length !== 1 ? "s" : ""} encontrado${clients.length !== 1 ? "s" : ""}`}
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
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">
                            {client.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{client.cnpj}</TableCell>
                      <TableCell>{client.contactName}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={client.isActive ? "default" : "secondary"}
                        >
                          {client.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => viewClientDetails(client)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openClientDialog(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title={
                                  client.isActive
                                    ? "Desativar cliente"
                                    : "Ativar cliente"
                                }
                              >
                                {client.isActive ? (
                                  <UserX className="h-4 w-4 text-red-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Deseja desativar o cliente {client.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Clique em confirmar para{" "}
                                  {client.isActive ? "desativar" : "ativar"} o
                                  cliente ou em cancelar para manter o cliente{" "}
                                  {client.isActive ? "ativo" : "desativado"}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => toggleClientStatus(client)}
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      {clients.length === 0
                        ? "Nenhum cliente cadastrado"
                        : "Nenhum cliente encontrado com os filtros aplicados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

      <ClientDetailsDialog
        open={clientDetailsDialogOpen}
        onOpenChange={setClientDetailsDialogOpen}
        client={selectedClient}
      />
    </div>
  );
}
