export interface IData {
  Data: string;
  ["Entrada/Saída"]: "Debito" | "Credito";
  Instituição: string;
  Movimentação: string;
  ["Média da compra"]: number;
  ["Preço unitário"]: number;
  Produto: string;
  Quantidade: number;
  ["Valor da Operação"]: number;
}

export interface IShowedData {
  [key: string]: IData[];
}

export interface IUpdateData {
  date: string;
  product: string;
  divided: number;
}

export interface IUserContext {
  user: any;
}
