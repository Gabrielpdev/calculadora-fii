import Image from "next/image";

interface CardProp {
  title: string;
  value: string;
  type: "in" | "out";
}

export default function Card({ title, value, type }: CardProp) {
  return (
    <div className="bg-white h-36 max-w-sm w-full flex flex-col p-5 gap-4 ">
      <div className="max-w-6xl w-full flex items-start justify-between">
        <span className="text-blue-950">{title}</span>

        {type === "out" && (
          <Image src="/outs.svg" alt="saidas" width={32} height={32} />
        )}
        {type === "in" && (
          <Image src="/ins.svg" alt="entradas" width={32} height={32} />
        )}
      </div>

      <div className="text-blue-950 text-3xl ">{value}</div>
    </div>
  );
}
