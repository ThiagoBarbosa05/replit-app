import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Edit, Building, Filter, Calendar } from "lucide-react";
import ConsignmentDialog from "@/components/dialogs/consignment-dialog";
import type { ConsignmentWithDetails, Client } from "@shared/schema";

export default function ConsignmentsPage() {
  const [consignmentDialogOpen, setConsignmentDialogOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] =
    useState<ConsignmentWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Build query parameters for server-side filtering
  const queryParams = new URLSearchParams();
  if (searchTerm.trim()) queryParams.append("search", searchTerm.trim());
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const queryString = queryParams.toString();
  const queryKey = queryString
    ? ["/api/consignments", queryString]
    : ["/api/consignments"];

  const { data: consignments = [], isLoading: consignmentsLoading } = useQuery<
    ConsignmentWithDetails[]
  >({
    queryKey,
    queryFn: async () => {
      const url = queryString
        ? `/api/consignments?${queryString}`
        : "/api/consignments";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch consignments");
      return response.json();
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const openConsignmentDialog = (consignment?: ConsignmentWithDetails) => {
    setSelectedConsignment(consignment || null);
    setConsignmentDialogOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  // No need for client-side filtering since we're using server-side filtering
  const filteredConsignments = consignments;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
          <div>
            <CardTitle className="text-lg sm:text-xl">Consignações</CardTitle>
            <p className="text-sm sm:text-base text-gray-600">
              Registrar e acompanhar envios de vinhos para clientes
            </p>
          </div>
          <Button
            onClick={() => openConsignmentDialog()}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Consignação
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Ocultar Filtros" : "Mais Filtros"}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Data Inicial
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    Data Final
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-gray-600">
            {consignmentsLoading
              ? "Carregando..."
              : `${filteredConsignments.length} consignação${
                  filteredConsignments.length !== 1 ? "ões" : ""
                } encontrada${filteredConsignments.length !== 1 ? "s" : ""}`}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">Cliente</TableHead>
                  <TableHead className="min-w-[120px]">Data</TableHead>
                  <TableHead className="min-w-[100px]">Items</TableHead>
                  <TableHead className="min-w-[120px]">Valor Total</TableHead>
                  <TableHead className="min-w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consignmentsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredConsignments.length > 0 ? (
                  filteredConsignments.map((consignment) => (
                    <TableRow key={consignment.id}>
                      <TableCell className="font-medium">
                        #{consignment.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span>{consignment.client?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(consignment.date)}</TableCell>
                      <TableCell>
                        {consignment.items.length} produto(s)
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(consignment.totalValue)}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConsignmentDialog(consignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      {consignments.length === 0
                        ? "Nenhuma consignação registrada"
                        : "Nenhuma consignação encontrada com os filtros aplicados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConsignmentDialog
        open={consignmentDialogOpen}
        onOpenChange={setConsignmentDialogOpen}
        consignment={selectedConsignment}
        onClose={() => {
          setConsignmentDialogOpen(false);
          setSelectedConsignment(null);
        }}
      />
    </div>
  );
}
