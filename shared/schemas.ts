import { z } from "zod";

const cellphoneRegex = /^(\(?\d{2}\)?\s?)?(9\d{4})-?(\d{4})$/;

export const createClientSchema = z.object({
  name: z.string().min(1, { message: "Nome dao cliente é obrigatório" }),
  cnpj: z
    .string()
    .min(14, { message: "CNPJ deve ter no mínimo 14 caracteres" }),
  address: z.string().min(1, { message: "Endereço é obrigatório" }),
  phone: z.string().regex(cellphoneRegex, {
    message: "Número de celular inválido. Ex: (11) 91234-5678",
  }),
  contactName: z.string().min(1, { message: "Nome do contato é obrigatório" }),
});
