import { PiShootingStarLight } from "react-icons/pi";
import {
  ActionIcon,
  Text,
  Space,
  Group,
  UnstyledButton,
  Avatar,
  Center,
  Modal,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Spotlight.module.css";
import { useRouter } from "next/router";

export function Spotlight() {
  const router = useRouter();

  return (
    <>
    <Space h="md" />


      
        
    

      

        <Text fw={700} ta="center" fs="italic">
          Promoted Albums
        </Text>
        <Space h="sm" />
        <Group mr={11} ml={11}>
         <iframe
          style={{
            borderRadius: "14px",
          }}
          src="https://open.spotify.com/embed/album/74vEZzMxVkd08QOx4lbeRF?utm_source=generator"
          width="100%"
          height="152"
          frameBorder="0"
          
          allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
        </Group>
          <Space h="md" />
        <Group mr={11} ml={11}>
          <iframe
            style={{
              borderRadius: "14px",
            }}
            src="https://open.spotify.com/embed/album/4m1SepLgm4jLLnNIKK8D5v?utm_source=generator"
            width="100%"
            height="152"
            frameBorder="0"
            
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </Group>

        <Space h="sm" />

        <Text fw={700} ta="center" fs="italic">
          Waves Top Artists
        </Text>

        <Space h="sm" />

        <UnstyledButton
          onClick={() => router.push("/wave/elrickerikose")}
          className={classes.user}
        >
          <Group>
            <Avatar
              src="https://node.deso.org/api/v0/get-single-profile-picture/BC1YLgcHBgCfnwRRQfsAZMjsCXMcyec2CTgiKHT1i3oKqMhER5zd3od"
              radius="xl"
            />

            <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Elrick Erikose
            </Text>

            <Text c="dimmed" size="xs">
              @elrickerikose
            </Text>
            </div>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          onClick={() => router.push("/wave/tobiasschmid")}
          className={classes.user}
        >
          <Group>
            <Avatar
              src="https://node.deso.org/api/v0/get-single-profile-picture/BC1YLj9VUniNwLt55mZ6Ls7mfuG4Fc4xjemzN7vNixdDjxyg8dWkxhv"
              radius="xl"
            />

            <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Tobias Schmid
            </Text>

            <Text c="dimmed" size="xs">
              @tobiasschmid
            </Text>
            </div>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          onClick={() => router.push("/wave/abundantlawrie")}
          className={classes.user}
        >
          <Group>
            <Avatar
              src="https://node.deso.org/api/v0/get-single-profile-picture/BC1YLhB5benERNQpzejY64cxdHTWssidmsoQAD1BPun7vhLsfeH1Gor"
              radius="xl"
            />

            <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              Abundant Lawrie
            </Text>

            <Text c="dimmed" size="xs">
              @abundantlawrie
            </Text>
            </div>
          </Group>
        </UnstyledButton>

        <Space h="sm" />
          
        <Text fw={700} ta="center" fs="italic">
          Powered By
        </Text>
        
        <Space h="sm" />
      <UnstyledButton
          component="a"
          href="https://www.deso.com/"
          target="_blank"
          rel="noreferrer"
          className={classes.user}
        >
          <Group>
            <Avatar
              src="https://pbs.twimg.com/profile_images/1576351999079026689/AIrcdg1J_400x400.jpg"
              radius="xl"
            />

            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                DeSo Protocol
              </Text>
            </div>
          </Group>
        </UnstyledButton>

        <UnstyledButton
          component="a"
          href="https://livepeer.org/"
          target="_blank"
          rel="noreferrer"
          className={classes.user}
        >
          <Group>
            <Avatar
              src="https://gw.ipfs-lens.dev/ipfs/bafkreieqprlwmiawdkfzlvxjsaldlctrgxq6ccjhizriqhspedb5k2imyy"
              radius="xl"
            />

            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                Livepeer
              </Text>
            </div>
          </Group>
        </UnstyledButton>
       
       


      
    </>
  );
}