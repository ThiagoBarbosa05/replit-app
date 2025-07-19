import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Wine } from "lucide-react";
import ProductDialog from "@/components/dialogs/product-dialog";
import type { Product } from "@shared/schema";

export default function ProductsPage() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", searchTerm, typeFilter, countryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      if (countryFilter && countryFilter !== 'all') params.append('country', countryFilter);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Query to get all products for filter options
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/all"],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch all products');
      return response.json();
    }
  });

  const openProductDialog = (product?: Product) => {
    setSelectedProduct(product || null);
    setProductDialogOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Products are already filtered by the server
  const filteredProducts = products;

  // Get unique countries for filter from all products
  const uniqueCountries = [...new Set(allProducts.map(p => p.country))];

  return (
    <div className="space-y-6">
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
              <Input 
                placeholder="Buscar produtos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" 
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos os países" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os países</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            {productsLoading ? "Carregando..." : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openProductDialog(product)}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {product.photo && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={product.photo} 
                          alt={product.name}
                          className="w-full h-full object-contain "
                        />
                      </div>
                    )}
                    {!product.photo && (
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                        <Wine className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.country}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.volume}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(product.unitPrice)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {products.length === 0 && !productsLoading && (
              <div className="col-span-full text-center py-12 text-gray-500">
                {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado com os filtros aplicados"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ProductDialog 
        open={productDialogOpen} 
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        onClose={() => {
          setProductDialogOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}