"use client";
import { useState, useCallback, useEffect } from "react";

import { IData } from "@/types/data";
import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { Loading } from "@/components/loading";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

const mock = [
  {
    id: v4(),
    name: "Lanchonete",
    icon: "hamburger",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
  {
    id: v4(),
    name: "Lazer",
    icon: "casa",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
  {
    id: v4(),
    name: "Outros",
    icon: "other",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
];

export default function Category() {
  const { push } = useRouter();
  const [categories, setCategories] = useState(mock);

  const [loading, setLoading] = useState(true);

  const readJsonFile = async () => {
    setLoading(true);
    try {
      // const token = await user?.getIdToken();
      // if (!token) return;

      // const response = await fetch(`/api/list`, {
      //   headers: {
      //     Authorization: `${token}`,
      //   },
      //   credentials: "include",
      // });

      // const { data } = await response.json();

      // if (!data) return;
      const categoriesString = localStorage.getItem(
        `${LOCAL_STORAGE_KEY}_categories`
      );
      const categories = categoriesString ? JSON.parse(categoriesString) : [];

      setCategories(mock);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category: string) => {
    push(`/categorias/${category.toLocaleLowerCase()}`);
  };

  useEffect(() => {
    readJsonFile();
  }, []);

  return (
    <div className="flex max-w-6xl w-full flex-col m-auto">
      {loading ? (
        <div className="w-full h-60 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className={``}>
          <div className={`grid grid-cols-5 m-2`}>
            <span
              className={`w-full flex items-center capitalize border-r-2 text-blue-950 m-2 col-span-4`}
            >
              Nome
            </span>
            <span
              className={`w-full flex items-center justify-center capitalize border-r-2 text-blue-950 m-2 col-span-1`}
            >
              Icone
            </span>
          </div>
          <div className="grid gap-2 ">
            {categories.map((category) => (
              <button
                onClick={() => handleSelectCategory(category.name)}
                key={category.id}
                className="grid grid-cols-5 text-center bg-white p-5 rounded-md "
              >
                <span
                  className={`w-full flex capitalize col-span-4 border-r-2 text-blue-950`}
                >
                  {category.name}
                </span>
                <span
                  className={`w-full flex items-center capitalize justify-center border-r-2 text-blue-950`}
                >
                  {category.icon}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
