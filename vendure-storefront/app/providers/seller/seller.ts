import gql from "graphql-tag";
import { MutationRegisterNewSellerArgs } from "~/generated/graphql";
import { QueryOptions, sdk } from "~/graphqlWrapper";

export const registerSellerAccount = async (
    options: QueryOptions,
    variables: MutationRegisterNewSellerArgs,
  ) => {
    return sdk.registerNewSeller(variables, options);
  };

  gql`
  mutation registerNewSeller($input: RegisterSellerInput!) {
    registerNewSeller(input: $input) {
      __typename
      id
      code
      token
    }
  }
`;

// GraphQL query to fetch the seller custom fields
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

// Function to get seller custom fields by seller ID
export const getSellerCustomFields = async (sellerId: string) => {
  const response = await sdk.getSeller({ id: sellerId });
  return response.seller;
};