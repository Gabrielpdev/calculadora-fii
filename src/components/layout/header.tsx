import Image from "next/image";
import Card from "../elements/cards";

export default function Header() {
  return (
    <div className="bg-lime-900 h-48 w-full flex  justify-center pt-8">
      <div className="max-w-6xl w-full flex flex-col items-start justify-between m-auto">
        <div className="max-w-6xl w-full flex items-start justify-between">
          <Image src="/logo.svg" alt="logo" width={175} height={25} />

          <div className="flex text-white gap-8">
            <button className="flex">Listagem</button>
            <button className="flex">Importar</button>
          </div>
        </div>

        <div className="flex max-w-6xl w-full gap-11 mt-16">
          <Card title="Entradas" value="R$ 17.400,00" type="in" />
          <Card title="Saidas" value="R$ 17.400,00" type="out" />
        </div>
      </div>
    </div>
  );
}
