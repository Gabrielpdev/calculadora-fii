export interface IData {
  Data: string;
  Estabelecimento: string;
  Parcela: string;
  Portador: string;
  Valor: string;
  Tipo: string;
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
