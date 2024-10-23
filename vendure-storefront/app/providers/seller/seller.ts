import gql from "graphql-tag";
import { MutationRegisterNewSellerArgs } from "~/generated/graphql";
import { QueryOptions, sdk } from "~/graphqlWrapper";

// Função para registrar novo vendedor
export const registerSellerAccount = async (
  options: QueryOptions,
  variables: MutationRegisterNewSellerArgs
) => {
  return sdk.registerNewSeller(variables, options);
};

// Query para buscar os campos customizados do vendedor
gql`
  query GetSeller($id: ID!) {
    seller(id: $id) {
      id
      name
      customFields {
        cnpj
        companyName
        tradingName
        stateRegistration
        municipalRegistration
        businessPhone
        responsiblePerson
      }
    }
  }
`;

// Função para buscar os dados do vendedor
export const getSellerData = async (sellerId: string) => {
  const response = await sdk.getSeller({ id: sellerId });
  return response.seller;
};

// Query para buscar as coleções do vendedor
gql`
  query GetCollectionsForSeller($sellerId: ID!) {
    collections(sellerId: $sellerId) {
      items {
        id
        name
        featuredAsset {
          preview
        }
      }
    }
  }
`;

// Função para buscar as coleções do vendedor
export const getCollectionsForSeller = async (sellerId: string) => {
  const response = await sdk.getCollectionsForSeller({ sellerId });
  return response.collections.items;
};
