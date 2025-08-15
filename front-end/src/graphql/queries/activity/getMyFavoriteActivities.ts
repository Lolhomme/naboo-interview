import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetMyFavoriteActivities = gql`
  query GetMyFavoriteActivities {
    myFavoriteActivities {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetMyFavoriteActivities;
