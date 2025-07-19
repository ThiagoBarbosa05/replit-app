import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image } from "lucide-react";
import { type Product, type InsertProduct, createProductSchema } from "@shared/schema";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: InsertProduct) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const wineTypes = [
  { value: "tinto", label: "Tinto" },
  { value: "branco", label: "Branco" },
  { value: "rose", label: "Rosé" },
  { value: "espumante", label: "Espumante" },
  { value: "fortificado", label: "Fortificado" },
];

const countries = [
  { value: "Argentina", label: "Argentina" },
  { value: "Brasil", label: "Brasil" },
  { value: "Chile", label: "Chile" },
  { value: "França", label: "França" },
  { value: "Itália", label: "Itália" },
  { value: "Portugal", label: "Portugal" },
  { value: "Espanha", label: "Espanha" },
  { value: "Estados Unidos", label: "Estados Unidos" },
];

const volumeOptions = [
  { value: "187ml", label: "187ml (Pequena)" },
  { value: "375ml", label: "375ml (Meia garrafa)" },
  { value: "750ml", label: "750ml (Padrão)" },
];

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(product?.photo || null);
  const [price, setPrice] = useState<string | undefined>(product?.unitPrice || "0,00");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name || "",
      country: product?.country || "",
      type: product?.type || "",
      unitPrice: product?.unitPrice || "0",
      volume: product?.volume || "750ml",
      photo: product?.photo || null,
    },
  });

  function formatCurrencyInput(value: string): string {
    const onlyDigits = value.replace(/\D/g, "");
    const numericValue = parseFloat(onlyDigits) / 100;

    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande. Máximo permitido: 5MB");
        return;
      }
      
      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        alert("Por favor, selecione apenas arquivos de imagem");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedImage(base64);
        form.setValue("photo", base64);
      };
      reader.onerror = () => {
        alert("Erro ao carregar a imagem. Tente novamente.");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    form.setValue("photo", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (data: InsertProduct) => {
    
  onSubmit({...data, unitPrice: price!.replace("R$", "").replace(",", ".").trim()});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Vinho *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Malbec Reserva 2020" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País de Origem *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Vinho *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wineTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o volume" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {volumeOptions.map((volume) => (
                      <SelectItem key={volume.value} value={volume.value}>
                        {volume.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Unitário (R$) *</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    step="0.01" 
                    placeholder={formatCurrencyInput("0,00")} 
                    {...field} 
                    onChange={(e) => {
                      const formattedValue = formatCurrencyInput(e.target.value);
                      setPrice(formattedValue);
                      field.onChange(e);
                    }}
                    value={price}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Photo Upload Section */}
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Produto</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {selectedImage ? (
                    <Card className="p-4">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img 
                            src={selectedImage} 
                            alt="Preview do produto" 
                            className="w-full max-w-[360px] mx-auto h-48 object-contain rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2 p-8">
                      <CardContent className="p-0">
                        <div className="text-center">
                          <Image className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Clique para adicionar uma foto do produto
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Imagem
                          </Button>
                          {selectedImage && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2"
                            >
                              Alterar Imagem
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Salvando..." : product ? "Atualizar Produto" : "Cadastrar Produto"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto">
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}