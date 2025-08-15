import { gql } from '@apollo/client';

export const ADD_FAVORITE_ACTIVITY = gql`
  mutation AddFavoriteActivity($activityId: String!) {
    addFavoriteActivity(activityId: $activityId) {
      id
      favoriteActivityIds
    }
  }
`;

export const REMOVE_FAVORITE_ACTIVITY = gql`
  mutation RemoveFavoriteActivity($activityId: String!) {
    removeFavoriteActivity(activityId: $activityId) {
      id
      favoriteActivityIds
    }
  }
`;
