import { Activity, EmptyData, PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Flex, Grid, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import GetMyFavoriteActivities from "@/graphql/queries/activity/getMyFavoriteActivities";
import { GetMyFavoriteActivitiesQuery, GetMyFavoriteActivitiesQueryVariables } from "@/graphql/generated/getMyFavoriteActivities";

interface ProfileProps {
  favoriteActivities: GetMyFavoriteActivitiesQuery["myFavoriteActivities"];
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({ req }) => {
  const response = await graphqlClient.query<
    GetMyFavoriteActivitiesQuery,
    GetMyFavoriteActivitiesQueryVariables
  >({
    query: GetMyFavoriteActivities,
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return {
    props: {
      favoriteActivities: response.data.myFavoriteActivities,
    },
  };
};

const Profile = ({ favoriteActivities }: ProfileProps) => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Flex align="center" gap="md">
        <Avatar color="cyan" radius="xl" size="lg">
          {user?.firstName[0]}
          {user?.lastName[0]}
        </Avatar>
        <Flex direction="column">
          <Text>{user?.email}</Text>
          <Text>{user?.firstName}</Text>
          <Text>{user?.lastName}</Text>
        </Flex>
      </Flex>
      <PageTitle title="Mes activités favorites" />
      <Grid>
        {favoriteActivities.length > 0 ? (
          favoriteActivities.map((activity) => (
            <Activity activity={activity} key={activity.id} />
          ))
        ) : (
          <EmptyData />
        )}
      </Grid>
    </>
  );
};

export default withAuth(Profile);
