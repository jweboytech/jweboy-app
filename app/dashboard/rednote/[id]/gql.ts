import { gql } from "@apollo/client";

export const GET_REDNOTE = gql`
  query getRednotes($first: int, $after: Cursor, $filter: any) {
    red_noteCollection(first: $first, after: $after, filter: $filter) {
      edges {
        node {
          id
          title
          description
          href
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
