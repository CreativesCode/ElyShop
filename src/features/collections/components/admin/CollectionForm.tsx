"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { InsertCollection, collections } from "@/lib/supabase/schema";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ImageDialog } from "@/features/medias";
import { DocumentType, gql } from "@/gql";
import { useMutation, useQuery } from "@urql/next";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreateCollectionMutation,
  UpdateCollectionMutation,
} from "../../query";

const CollectionFromFragment = gql(/* GraphQL */ `
  fragment CollectionFromFragment on collections {
    id
    slug
    label
    description
    title
    featured_image_id
    parent_id
    show_in_home
  }
`);

const CollectionsQuery = gql(/* GraphQL */ `
  query CollectionsQuery {
    collectionsCollection(orderBy: [{ label: AscNullsLast }]) {
      edges {
        node {
          id
          label
        }
      }
    }
  }
`);

type CollectionEdge = {
  node: {
    id: string;
    label: string;
  };
};

function ParentCollectionSelect({
  value,
  onChange,
  excludeId,
  disabled,
  collections,
  fetching,
  error,
}: {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  excludeId?: string;
  disabled?: boolean;
  collections: CollectionEdge[];
  fetching: boolean;
  error?: any;
}) {
  const filteredCollections = collections.filter(
    ({ node: parentCollection }) => parentCollection.id !== excludeId,
  );

  return (
    <Select
      onValueChange={(val) => onChange(val === "none" ? null : val)}
      value={value || "none"}
      disabled={disabled || fetching}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select a parent collection (optional)" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="none">None (Root Collection)</SelectItem>
        {error ? (
          <SelectItem value="error" disabled>
            Error loading collections
          </SelectItem>
        ) : fetching && collections.length === 0 ? (
          <SelectItem value="loading" disabled>
            Loading collections...
          </SelectItem>
        ) : (
          filteredCollections.map(({ node: parentCollection }) => (
            <SelectItem value={parentCollection.id} key={parentCollection.id}>
              {parentCollection.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

type CollectionFormProps = {
  collection?: DocumentType<typeof CollectionFromFragment>;
};

function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const [, updateCollection] = useMutation(UpdateCollectionMutation);
  const [, createCollection] = useMutation(CreateCollectionMutation);

  // Query collections once at the parent level
  const [{ data, fetching, error }] = useQuery({
    query: CollectionsQuery,
    requestPolicy: "cache-first",
  });

  const collectionsList = data?.collectionsCollection?.edges || [];

  const form = useForm<InsertCollection>({
    resolver: zodResolver(createInsertSchema(collections)),
    defaultValues: {
      ...collection,
      featuredImageId: collection ? collection.featured_image_id : undefined,
      parentId: collection?.parent_id || undefined,
      showInHome: collection?.show_in_home || false,
    },
  });

  const { register, handleSubmit } = form;

  const onSubmit = handleSubmit(async (data: InsertCollection) => {
    setIsPending(true);
    try {
      const mutationData = {
        ...data,
        parentId: data.parentId || null,
        showInHome: data.showInHome || false,
      };

      if (collection) {
        const res = await updateCollection({
          id: collection.id,
          ...mutationData,
        });
        setIsPending(false);
        if (res.data) {
          router.push("/admin/collections");
          router.refresh();
          toast({ title: "Success Collection is updated." });
        }
      } else {
        const res = await createCollection({
          id: nanoid(),
          ...mutationData,
        });
        setIsPending(false);
        if (res.data) {
          router.push("/admin/collections");
          router.refresh();

          toast({ title: "Success Collection is created." });
        }
      }
    } catch {
      setIsPending(false);
    }
  });

  return (
    <Form {...form}>
      <form
        id="project-form"
        className="gap-x-5 flex gap-y-5 flex-col px-3"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-y-5 max-w-[500px]">
          <FormItem>
            <FormLabel className="text-sm">Label*</FormLabel>
            <FormControl>
              <Input
                aria-invalid={!!form.formState.errors.label}
                placeholder="Type Collection label."
                {...register("label")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel className="text-sm">Title*</FormLabel>
            <FormControl>
              <Input
                aria-invalid={!!form.formState.errors.title}
                placeholder="Type Collection title."
                {...register("title")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm">Slug*</FormLabel>
            <FormControl>
              <Input
                defaultValue={collection?.slug}
                aria-invalid={!!form.formState.errors.slug}
                placeholder="Type Collection slug."
                {...register("slug")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm">Description*</FormLabel>
            <FormControl>
              <Textarea
                defaultValue={collection?.description}
                aria-invalid={!!form.formState.errors.description}
                placeholder="Type Collection description."
                {...register("description")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="featuredImageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image*</FormLabel>
                <Suspense
                  fallback={
                    <div className="h-32 w-full bg-muted animate-pulse rounded-md" />
                  }
                >
                  <div className="">
                    <ImageDialog
                      defaultValue={collection?.featured_image_id}
                      onChange={field.onChange}
                      value={field.value || undefined}
                    />
                  </div>
                </Suspense>

                <FormDescription>
                  Drag n Drop the image to above section or click the button to
                  select from Image gallery.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Collection</FormLabel>
                <ParentCollectionSelect
                  value={field.value}
                  onChange={field.onChange}
                  excludeId={collection?.id}
                  collections={collectionsList}
                  fetching={fetching}
                  error={error}
                />
                <FormDescription>
                  Select a parent collection to create a hierarchical structure.
                  Leave as &quot;None&quot; for root-level collections.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showInHome"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Mostrar en el Home</FormLabel>
                  <FormDescription>
                    Marca esta opción si quieres que esta categoría aparezca en
                    el listado de categorías del home.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="py-8 flex gap-x-5 items-center">
          <Button disabled={isPending} variant={"outline"} form="project-form">
            {collection ? "Update" : "Create"}
            {isPending && (
              <Spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
          </Button>
          <Link href="/admin/collections" className={buttonVariants()}>
            Cancel
          </Link>
        </div>
      </form>
    </Form>
  );
}

export default CollectionForm;
