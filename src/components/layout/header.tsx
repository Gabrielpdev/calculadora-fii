import Image from "next/image";
import Link from "next/link";
import HeaderDescription from "./header-cards";

export default function Header() {
  return (
    <div className="bg-lime-900 h-48 w-full flex  justify-center pt-8">
      <div className="max-w-6xl w-full flex flex-col items-start justify-between ">
        <div className="max-w-6xl w-full flex items-start justify-between">
          <Link href="/" className="flex">
            <Image src="/logo.svg" alt="logo" width={175} height={25} />
          </Link>

          <div className="flex text-white gap-8">
            <Link href="/" className="flex">
              Listagem
            </Link>
            <Link href="/categorias" className="flex">
              Categorias
            </Link>
            <Link href="/importar" className="flex">
              Importar
            </Link>
          </div>
        </div>

        <HeaderDescription />
      </div>
    </div>
  );
}
