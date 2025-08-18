import gql from "graphql-tag";

const ReorderFavoriteActivities = gql`
  mutation ReorderFavoriteActivities($activityIds: [String!]!) {
    reorderFavoriteActivities(activityIds: $activityIds) {
      id
      favoriteActivityIds
    }
  }
`;

export default ReorderFavoriteActivities;
