import gql from "graphql-tag";
import { sdk } from "~/graphqlWrapper";

// Query to get the seller by channel token (vendure-token)
gql`
  query GetSellerByToken($token: String!) {
    seller(token: $token) {
      id
    }
  }
`;

export const getSellerByToken = async (token: string) => {
  const response = await sdk.getSellerByToken({ token });
  return response.seller.id;
};
