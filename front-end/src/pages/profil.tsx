import { Activity, EmptyData, PageTitle } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Flex, Grid, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import GetMyFavoriteActivities from "@/graphql/queries/activity/getMyFavoriteActivities";
import {
  GetMyFavoriteActivitiesQuery,
  GetMyFavoriteActivitiesQueryVariables,
} from "@/graphql/generated/getMyFavoriteActivities";
import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@apollo/client";
import ReorderFavoriteActivities from "@/graphql/mutations/activity/reorderFavoriteActivities";
import {
  ReorderFavoriteActivitiesMutation,
  ReorderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import { useSnackbar } from "@/hooks";
import { createApolloClient } from "@/graphql/apollo";

interface ProfileProps {
  favoriteActivities: GetMyFavoriteActivitiesQuery["myFavoriteActivities"];
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async ({
  req,
}) => {
  const ssrClient = createApolloClient({ headers: { Cookie: req.headers.cookie } });
  const response = await ssrClient.query<
    GetMyFavoriteActivitiesQuery,
    GetMyFavoriteActivitiesQueryVariables
  >({
    query: GetMyFavoriteActivities,
  });

  return {
    props: {
      favoriteActivities: response.data.myFavoriteActivities,
    },
  };
};

// Minimal wrapper to make an item sortable while preserving existing Activity card
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (dnd: any) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };
  return <>{children({ setNodeRef, attributes, listeners, style })}</>;
}

const Profile = ({ favoriteActivities }: ProfileProps) => {
  const { user } = useAuth();
  const snackbar = useSnackbar();

  const [items, setItems] = useState<
    GetMyFavoriteActivitiesQuery["myFavoriteActivities"]
  >(favoriteActivities);

  useEffect(() => {
    setItems(favoriteActivities);
  }, [favoriteActivities]);

  const ids = useMemo(() => items.map((a) => a.id), [items]);

  const [reorderMutation] = useMutation<
    ReorderFavoriteActivitiesMutation,
    ReorderFavoriteActivitiesMutationVariables
  >(ReorderFavoriteActivities);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

  const oldIndex = ids.indexOf(String(active.id));
  const newIndex = ids.indexOf(String(over.id));
  if (oldIndex === -1 || newIndex === -1) return;

    const previous = items;
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await reorderMutation({
        variables: { activityIds: newItems.map((a) => a.id) },
      });
      snackbar.success("Ordre mis à jour");
    } catch (e) {
      // revert on error
      setItems(previous);
      snackbar.error("Impossible de mettre à jour l'ordre");
    }
  };

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
      {items.length > 0 ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <Grid>
        {items.map((activity) => (
                <SortableItem id={activity.id} key={activity.id}>
          {(dnd) => <Activity activity={activity} dnd={dnd} />}
                </SortableItem>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      ) : (
        <Grid>
          <EmptyData />
        </Grid>
      )}
    </>
  );
};

export default withAuth(Profile);
