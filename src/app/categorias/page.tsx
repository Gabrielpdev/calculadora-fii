"use client";
import { useState, useEffect, useRef } from "react";
import * as Icons from "react-icons/pi";

import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { Loading } from "@/components/loading";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { ICategory } from "@/types/data";
import ListItem from "./components/ListItem";

const mock = [
  {
    id: v4(),
    name: "Lanchonete",
    icon: "PiHamburgerDuotone",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
  {
    id: v4(),
    name: "Lazer",
    icon: "PiConfettiDuotone",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
  {
    id: v4(),
    name: "Outros",
    icon: "PiConfettiDuotone",
    list: ["Leo Lanches", "Baita Burger", "Jardel"],
  },
];

export default function Category() {
  const { push } = useRouter();

  const inputNameRef = useRef<HTMLInputElement>(null);
  const inputIconRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ICategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState("");

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

      setCategories(categories);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = (id: string) => {
    if (isEditing === id) {
      handleEditCategory(id);
    }
    setIsEditing(isEditing === id ? "" : id);
  };

  const handleSaveNewCategory = () => {
    if (isAdding) {
      if (inputNameRef?.current?.value && inputIconRef?.current?.value) {
        const newCategory = {
          id: v4(),
          name: inputNameRef?.current?.value,
          icon: inputIconRef?.current?.value,
          list: [],
        };

        const newCategories = [...categories, newCategory];

        localStorage.setItem(
          `${LOCAL_STORAGE_KEY}_categories`,
          JSON.stringify(newCategories)
        );

        setCategories(newCategories);
        setIsEditing("");
      }
    }

    setIsAdding(!isAdding);
  };

  const handleEditCategory = (id: string) => {
    if (inputNameRef?.current?.value && inputIconRef?.current?.value) {
      const newCategories = categories.map((category) => {
        if (category.id === id) {
          return {
            ...category,
            name: inputNameRef?.current?.value ?? category.name,
            icon: inputIconRef?.current?.value ?? category.icon,
          };
        }

        return category;
      });

      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}_categories`,
        JSON.stringify(newCategories)
      );

      setCategories(newCategories);
      setIsEditing("");
    }
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
          <div className={`grid grid-cols-11 my-2`}>
            <span
              className={`w-full flex items-center text-blue-950 m-2 col-span-9`}
            >
              Nome
            </span>
            <span
              className={`w-full flex items-center justify-center text-blue-950`}
            >
              Icone
            </span>
            <button
              onClick={handleSaveNewCategory}
              className="flex items-center justify-center gap-2 text-white bg-green-700 rounded-md my-3 p-2 text-sm font-extrabold"
            >
              {isAdding ? (
                <>
                  Salvar <Icons.PiCheckCircleDuotone />
                </>
              ) : (
                <>
                  Adicionar <Icons.PiPlusCircleDuotone />
                </>
              )}
            </button>
          </div>

          {isAdding && (
            <form
              onSubmit={handleSaveNewCategory}
              className={`grid grid-cols-10 text-center bg-white p-5 rounded-md w-full mb-2`}
            >
              <input
                ref={inputNameRef}
                className={`w-full flex capitalize col-span-9 border-r-2 text-blue-950`}
              />
              <input
                ref={inputIconRef}
                className={`w-full flex items-center capitalize justify-center border-r-2 text-blue-950`}
              />
            </form>
          )}
          <div className="grid gap-4">
            {categories.map((category) => (
              <div className="grid grid-cols-12 gap-2" key={category.id}>
                <ListItem
                  className="col-span-11"
                  category={category}
                  isEditing={isEditing}
                  inputIconRef={inputIconRef}
                  inputNameRef={inputNameRef}
                />
                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  <button
                    onClick={() => handleToggleEdit(category.id)}
                    className="w-full flex items-center justify-center gap-2 text-white bg-yellow-600 rounded-md p-2 text-sm font-extrabold"
                  >
                    {isEditing === category.id ? (
                      <>
                        Salvar <Icons.PiCheckCircleDuotone />
                      </>
                    ) : (
                      <>
                        Editar <Icons.PiNotePencilDuotone />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleEdit(category.id)}
                    className=" w-full flex items-center justify-center gap-2 text-white bg-red-600 rounded-md p-2 text-sm font-extrabold"
                  >
                    Deletar
                    <Icons.PiTrashSimpleDuotone />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
