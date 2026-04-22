export type ReservationStatus = "pendente" | "confirmada" | "cancelada" | "checkin_realizado" | "checkout_realizado";

export type FutureReservation = {
  id: string;
  clienteId: string;
  quartoSlug: string;
  checkin: string;
  checkout: string;
  status: ReservationStatus;
  total: number;
};

export type FutureClient = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  cpf?: string;
};

export type FuturePayment = {
  id: string;
  reservaId: string;
  valor: number;
  metodo: "pix" | "cartao" | "dinheiro" | "transferencia";
  status: "pendente" | "aprovado" | "recusado";
};

export type FutureAvailability = {
  quartoSlug: string;
  data: string;
  disponivel: boolean;
};
