import { ActivityFragment } from "./types";

export type GetMyFavoriteActivitiesQuery = {
  myFavoriteActivities: Array<ActivityFragment>;
};

export type GetMyFavoriteActivitiesQueryVariables = Record<string, never>;
