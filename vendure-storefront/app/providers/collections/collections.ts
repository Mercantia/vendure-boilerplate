import gql from 'graphql-tag';
import { sdk } from '../../graphqlWrapper';
import { CollectionListOptions } from '~/generated/graphql';

export function getCollections(
  request: Request,
  options?: CollectionListOptions
) {
  // Get the URL from the request
  const url = new URL(request.url);
  
  // Extract the vendure token from the URL path
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const vendureToken = pathSegments[0]; // Assume the first segment is the vendure-token
  
  //console.log('Vendure Token:', vendureToken); // Debug log

  const headers = {
    'vendure-token': vendureToken || '', // Use the retrieved token or fallback
  };

  return sdk
    .collections({ options }, { headers })
    .then((result) => result.collections?.items);
}

// Your GraphQL queries remain unchanged.
gql`
  query collections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        parent {
          name
        }
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

gql`
  query collection($slug: String, $id: ID) {
    collection(slug: $slug, id: $id) {
      id
      name
      slug
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;
