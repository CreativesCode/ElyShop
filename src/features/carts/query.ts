import { gql } from "@/gql";

export const createCartMutation = gql(/* GraphQL */ `
  mutation createCartMutation(
    $id: String!
    $productId: String
    $userId: UUID
    $quantity: Int
    $color: String
    $size: String
    $material: String
  ) {
    insertIntocartsCollection(
      objects: {
        id: $id
        user_id: $userId
        product_id: $productId
        quantity: $quantity
        color: $color
        size: $size
        material: $material
      }
    ) {
      affectedCount
      records {
        __typename
        id
        product_id
        user_id
        quantity
        color
        size
        material
        product: products {
          ...CartItemCardFragment
        }
      }
    }
  }
`);

export const RemoveCartsMutation = gql(/* GraphQL */ `
  mutation RemoveCartsMutation($id: String!) {
    deleteFromcartsCollection(filter: { id: { eq: $id } }) {
      affectedCount
    }
  }
`);

export const updateCartsMutation = gql(/* GraphQL */ `
  mutation UpdateCartsMutation($id: String!, $newQuantity: Int) {
    updatecartsCollection(
      filter: { id: { eq: $id } }
      set: { quantity: $newQuantity }
    ) {
      affectedCount
      records {
        __typename
        nodeId
        id
        product_id
        user_id
        quantity
        color
        size
        material
        product: products {
          ...CartItemCardFragment
        }
      }
    }
  }
`);

export const ListCartQuery = gql(/* GraphQL */ `
  query ListCartQuery($userId: UUID) {
    cartsCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          __typename
          quantity
          user_id
          product_id
        }
      }
    }
  }
`);
