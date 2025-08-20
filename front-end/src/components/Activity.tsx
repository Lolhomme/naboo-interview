import { ActivityFragment } from "@/graphql/generated/types";
import { useGlobalStyles } from "@/utils";
import { Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../contexts";

interface ActivityProps {
  activity: ActivityFragment;
  dnd?: {
    setNodeRef?: (node: HTMLElement | null) => void;
    attributes?: Record<string, any>;
    listeners?: Record<string, any>;
    style?: React.CSSProperties;
  };
}

export function Activity({ activity, dnd }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const { user } = useContext(AuthContext);

  return (
    <Grid.Col
      span={4}
      ref={dnd?.setNodeRef as any}
      style={dnd?.style}
      {...(dnd?.attributes || {})}
      {...(dnd?.listeners || {})}
    >
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
          {activity.debug?.createdAt && (
            <Badge color="blue" variant="light">
              {new Date(activity.debug!.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Badge>
          )}
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
