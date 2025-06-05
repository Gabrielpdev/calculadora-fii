"use client";
import { useState, useEffect, useRef } from "react";

import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { Loading } from "@/components/loading";
import { useParams } from "next/navigation";
import { ICategory } from "@/types/data";
import { PiPlusCircleDuotone, PiTrashSimpleDuotone } from "react-icons/pi";

export default function CategoryName() {
  const params = useParams();

  const inputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [addField, setAddField] = useState(false);

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
      const categories: ICategory[] = categoriesString
        ? JSON.parse(categoriesString)
        : [];

      const filtered = categories.find(
        (category) => category.name.toLocaleLowerCase() === params.categoryName
      );

      setCategories(categories);
      setCategoriesList(filtered?.list || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewValueOnList = () => {
    if (inputRef?.current?.value) {
      const newCategories = categories.map((category) => {
        if (category.name.toLocaleLowerCase() === params.categoryName) {
          return {
            ...category,
            list: [...category.list, inputRef?.current?.value],
          };
        }

        return category;
      });

      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}_categories`,
        JSON.stringify(newCategories)
      );

      setCategoriesList([...categoriesList, inputRef?.current?.value]);
      setAddField(false);
    }
  };

  const handleDeleteValueOnList = (name: string) => {
    const newCategories = categories.map((category) => {
      if (category.name.toLocaleLowerCase() === params.categoryName) {
        return {
          ...category,
          list: category.list.filter((item) => item !== name),
        };
      }

      return category;
    });

    localStorage.setItem(
      `${LOCAL_STORAGE_KEY}_categories`,
      JSON.stringify(newCategories)
    );

    setCategories(newCategories);
    setCategoriesList(categoriesList.filter((item) => item !== name));
    setAddField(false);
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
          <div className={`grid grid-cols-10 m-2`}>
            <span
              className={`w-full flex items-center capitalize border-r-2 text-blue-950 m-2 col-span-9`}
            >
              Nome
            </span>
            {!addField && (
              <button
                onClick={() => setAddField(true)}
                className="flex items-center justify-center gap-2 text-white bg-green-700 rounded-md my-3 py-2 font-extrabold"
              >
                Adicionar
                <PiPlusCircleDuotone />
              </button>
            )}
          </div>

          {addField && (
            <form
              onSubmit={handleSaveNewValueOnList}
              className="flex text-blue-950 w-full mb-3 bg-white p-2 rounded-md "
            >
              <input
                ref={inputRef}
                type="text"
                className="flex text-blue-950 w-full p-5 "
              />
              <button
                type="submit"
                className="text-white bg-green-700 rounded-md px-4 font-extrabold"
              >
                Salvar
              </button>
            </form>
          )}

          <div className="grid gap-2 ">
            {categoriesList.map((category) => (
              <div
                key={category}
                className="grid grid-cols-10 text-center bg-white p-5 rounded-md text-blue-950 "
              >
                <span
                  className={`w-full flex capitalize col-span-9 border-r-2 `}
                >
                  {category}
                </span>

                <button
                  onClick={() => handleDeleteValueOnList(category)}
                  className="flex items-center justify-center gap-2 text-white bg-red-700 rounded-md px-4 font-extrabold"
                >
                  Deletar
                  <PiTrashSimpleDuotone />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
