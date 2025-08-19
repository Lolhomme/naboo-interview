import { Activity, EmptyData, PageTitle } from "@/components";
import { createApolloClient } from "@/graphql/apollo";
import {
  GetActivitiesQuery,
  GetActivitiesQueryVariables,
} from "@/graphql/generated/types";
import GetActivities from "@/graphql/queries/activity/getActivities";
import { useAuth } from "@/hooks";
import { Button, Grid, Group } from "@mantine/core";
import { useQuery } from "@apollo/client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

interface DiscoverProps {
  activities: GetActivitiesQuery["getActivities"];
}

export const getServerSideProps: GetServerSideProps<
  DiscoverProps
> = async ({ req }) => {
  const client = createApolloClient({ headers: { cookie: req.headers.cookie || "" } });
  const response = await client.query<
    GetActivitiesQuery,
    GetActivitiesQueryVariables
  >({
    query: GetActivities,
  });
  return { props: { activities: response.data.getActivities } };
};

export default function Discover({ activities }: DiscoverProps) {
  const { user } = useAuth();
  // Client-side fetch ensures requests include JWT header from localStorage
  const { data } = useQuery<GetActivitiesQuery, GetActivitiesQueryVariables>(GetActivities, {
    fetchPolicy: "network-only",
  });
  const list = data?.getActivities ?? activities;

  return (
    <>
      <Head>
        <title>Discover | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Découvrez des activités" />
        {user && (
          <Link href="/activities/create">
            <Button>Ajouter une activité</Button>
          </Link>
        )}
      </Group>
      <Grid>
        {list.length > 0 ? (
          list.map((activity) => (
            <Activity activity={activity} key={activity.id} />
          ))
        ) : (
          <EmptyData />
        )}
      </Grid>
    </>
  );
}
