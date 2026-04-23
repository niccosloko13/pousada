export type QuartoTipo = "standard" | "familia" | "casa";

export type Quarto = {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  capacidade: string;
  tipo_de_cama: string;
  camas_extras_ou_observacao: string;
  preco_por_noite: number;
  preco_por_pessoa?: number;
  preco_modelo?: "por_noite" | "por_pessoa";
  cafe_da_manha_incluso: boolean;
  quantidade_quartos?: number;
  quantidade_banheiros?: number;
  sala?: boolean;
  cozinha_completa?: boolean;
  varanda?: boolean;
  imagem_capa?: string;
  imagens?: string[];
  comodidades: string[];
  destaque: string;
  tipo: QuartoTipo;
};

export type PousadaData = {
  nome: string;
  slogan: string;
  local: string;
  endereco: string;
  link_google_maps?: string;
  descricao: string;
  preco_base_diaria_casal: number;
  cafe_da_manha_incluso: boolean;
  nota: number;
  avaliacoes: number;
  destaques: string[];
  comodidades: string[];
  galeria?: string[];
  quartos: Quarto[];
  imagens_por_secao?: {
    hero: string[];
    quartos: string[];
    cafe_da_manha: string[];
    lazer: string[];
    locais: string[];
    casa: string[];
  };
};

export type Guest = {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "checked_in" | "checked_out";

export type Payment = {
  id: string;
  reservationId: string;
  provider: "mercadopago" | "pagseguro";
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type Reservation = {
  id: string;
  code: string;
  roomId: number;
  roomSlug: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  cpf?: string;
  checkin: string;
  checkout: string;
  nights: number;
  adults: number;
  childrenFree: number;
  childrenHalf: number;
  total: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  arrivalTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AvailabilityBlock = {
  id: string;
  roomSlug: string;
  startDate: string;
  endDate: string;
  reason: "maintenance" | "manual_block" | "reservation";
  reservationId?: string;
};
