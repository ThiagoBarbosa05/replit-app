import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: InsertUser) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive
    } : {
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: 1
    }
  });

  const watchedRole = watch("role");

  const handleFormSubmit = (data: InsertUser) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {user ? "Editar Usuário" : "Cadastrar Usuário"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Digite o nome completo"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "Nova Senha (deixe em branco para manter)" : "Senha"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={user ? "Nova senha..." : "Digite a senha"}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil de Acesso</Label>
            <Select value={watchedRole} onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              value={1}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Usuário Ativo</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : user ? "Atualizar" : "Cadastrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}