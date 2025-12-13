import { gql } from "@/gql";

export const UpdateCollectionMutation = gql(/* GraphQL */ `
  mutation UpdateCollectionMutation(
    $id: String
    $slug: String
    $label: String
    $description: String
    $title: String
    $featuredImageId: String
    $parentId: String
    $showInHome: Boolean
  ) {
    updatecollectionsCollection(
      filter: { id: { eq: $id } }
      set: {
        slug: $slug
        featured_image_id: $featuredImageId
        label: $label
        description: $description
        title: $title
        parent_id: $parentId
        show_in_home: $showInHome
      }
    ) {
      affectedCount
      records {
        __typename
        nodeId
      }
    }
  }
`);

export const CreateCollectionMutation = gql(/* GraphQL */ `
  mutation CreateCollectionMutation(
    $id: String
    $slug: String
    $label: String
    $description: String
    $title: String
    $featuredImageId: String
    $parentId: String
    $showInHome: Boolean
  ) {
    insertIntocollectionsCollection(
      objects: {
        id: $id
        slug: $slug
        featured_image_id: $featuredImageId
        label: $label
        description: $description
        title: $title
        parent_id: $parentId
        show_in_home: $showInHome
      }
    ) {
      affectedCount
      records {
        __typename
      }
    }
  }
`);
