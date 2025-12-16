"use client";
import { useCallback, useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SelectCollection } from "@/lib/supabase/schema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icons } from "@/components/layouts/icons";
import PriceRange from "@/components/ui/PriceRange";
import { useDebounce } from "@/features/cms/hooks/use-debounce";
import CollectionsSelection from "@/features/search/components/CollectionsSelection";
import { SearchQuery } from "@/features/search/hooks/useSearchStore";
import { SortEnum } from "@/validations/products";
import React from "react";
import FilterBadges from "./FilterBadges";
import SortSelection from "./SortSelection";

type Props = {
  collectionsSection?: SelectCollection[];
  shopLayout?: boolean;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000];

function parsePriceRangeParam(
  param: string | null,
): [number, number] | undefined {
  if (!param) return undefined;
  const parts = param.split("-");
  if (parts.length !== 2) return undefined;
  const min = Number(parts[0]?.trim());
  const max = Number(parts[1]?.trim());
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  return min <= max ? [min, max] : [max, min];
}

function FilterSelections({ collectionsSection, shopLayout = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  const [query, setQuery] = useState<SearchQuery>({
    collections: [],
  });

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const range = parsePriceRangeParam(searchParams.get("price_range"));

    const collections =
      (JSON.parse(searchParams.get("collections")) as string[]) ?? [];
    const sort = searchParams.get("sort") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    setQuery({
      sort: sort ? SortEnum[sort] : undefined,
      priceRange: range,
      collections,
      search,
    });
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const removeQueryString = useCallback(
    (name: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      console.log("name", name);
      value ? params.set(name, value) : params.delete(name);
      return params.toString();
    },
    [searchParams],
  );

  const debouncedPrice = useDebounce(
    query.priceRange ?? DEFAULT_PRICE_RANGE,
    500,
  );

  React.useEffect(() => {
    const [min, max] = debouncedPrice;
    startTransition(() => {
      const isDefault =
        min === DEFAULT_PRICE_RANGE[0] && max === DEFAULT_PRICE_RANGE[1];
      const shouldRemove = query.priceRange === undefined || isDefault;

      const qs = shouldRemove
        ? removeQueryString("price_range")
        : createQueryString("price_range", `${min}-${max}`);

      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }, [
    debouncedPrice,
    pathname,
    router,
    startTransition,
    createQueryString,
    removeQueryString,
    query.priceRange,
  ]);

  const collectionChangeHandler = (collectionId: string) => {
    const oldValue = query.collections ?? [];

    if (oldValue.includes(collectionId)) {
      const collections = oldValue.filter((item) => item !== collectionId);
      setQuery({ ...query, collections });
      router.push(
        pathname +
          "?" +
          createQueryString("collections", JSON.stringify(collections)),
      );
    } else {
      const collections = [...oldValue, collectionId];
      setQuery({ ...query, collections });
      router.push(
        pathname +
          "?" +
          removeQueryString(
            "collections",
            collections.length > 0 ? JSON.stringify(collections) : undefined,
          ),
      );
    }
  };

  return (
    <>
      <section className="justify-between items-center hidden md:flex">
        <div className="flex gap-x-5 items-center">
          <span>Filtros:</span>
          {shopLayout && (
            <CollectionsSelection
              className="flex items-center"
              value={query.collections}
              onCheckedChange={collectionChangeHandler}
              selections={collectionsSection}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              Rango de precios
              <Icons.chevronDown width={25} height={25} strokeWidth={2} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-5 max-w-xl">
              <DropdownMenuLabel>Rango de precios (CUP)</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <PriceRange
                label={"Rango de precios (CUP)"}
                defaultValue={query.priceRange}
                value={query.priceRange}
                onMinChange={(data) => {
                  const currentRange = query.priceRange ?? [0, 10000];
                  setQuery({
                    ...query,
                    priceRange: [data, currentRange[1]],
                  });
                }}
                onMaxChange={(data) => {
                  const currentRange = query.priceRange ?? [0, 10000];
                  setQuery({
                    ...query,
                    priceRange: [currentRange[0], data],
                  });
                }}
                onValueChange={(priceRange) =>
                  setQuery({ ...query, priceRange })
                }
                onReset={() => {
                  setQuery({ ...query, priceRange: undefined });
                  startTransition(() => {
                    const qs = removeQueryString("price_range");
                    router.push(qs ? `${pathname}?${qs}` : pathname);
                  });
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-x-5 items-center">
          <label htmlFor="sort" className="text-nowrap">
            Ordenar por:
          </label>

          <SortSelection
            id="sort"
            disabled={isLoading}
            onValueChange={(sort) => {
              setQuery({ ...query, sort: SortEnum[sort] });
              router.push(`${pathname}?${createQueryString("sort", sort)}`);
            }}
            items={Object.entries(SortEnum).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            placeholder="Ordenar"
          />
        </div>
      </section>

      <Sheet>
        <SheetTrigger className="block md:hidden">Filtros</SheetTrigger>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription className="flex flex-col items-start">
              {shopLayout && (
                <div className="grid">
                  <label className="text-primary font-semibold text-left">
                    Colecciones
                  </label>
                  <CollectionsSelection
                    className="flex items-center"
                    value={query.collections}
                    onCheckedChange={collectionChangeHandler}
                    selections={collectionsSection}
                  />
                </div>
              )}
              <div className="grid">
                <label className="text-primary font-semibold text-left">
                  Rango de precios
                </label>

                <PriceRange
                  label={"Rango de precios"}
                  defaultValue={query.priceRange}
                  value={query.priceRange}
                  onMinChange={(data) => {
                    const currentRange = query.priceRange ?? [0, 10000];
                    setQuery({
                      ...query,
                      priceRange: [data, currentRange[1]],
                    });
                  }}
                  onMaxChange={(data) => {
                    const currentRange = query.priceRange ?? [0, 10000];
                    setQuery({
                      ...query,
                      priceRange: [currentRange[0], data],
                    });
                  }}
                  onValueChange={(priceRange) =>
                    setQuery({ ...query, priceRange })
                  }
                  onReset={() => {
                    setQuery({ ...query, priceRange: undefined });
                    router.push(
                      pathname + "?" + removeQueryString("price_range"),
                    );
                  }}
                />
              </div>

              <label htmlFor="sort" className="text-nowrap">
                Ordenar por:
              </label>

              <SortSelection
                id="sort"
                disabled={isLoading}
                onValueChange={(sort) => {
                  setQuery({ ...query, sort: SortEnum[sort] });
                  router.push(`${pathname}?${createQueryString("sort", sort)}`);
                }}
                defaultValue={query.sort}
                items={Object.entries(SortEnum).map(([key, value]) => ({
                  value: key,
                  label: value,
                }))}
                placeholder="Ordenar"
              />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <FilterBadges
        query={query}
        collections={collectionsSection}
        onDeleteHandler={removeQueryString}
      />
    </>
  );
}

export default FilterSelections;
