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