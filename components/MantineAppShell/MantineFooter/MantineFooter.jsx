import { ActionIcon, Group, Modal, Text } from "@mantine/core";
import {
  IconBellRinging,
  IconHome2,
  IconLayoutDashboard,
  IconReceipt2,
} from "@tabler/icons-react";
import { FiPlus } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { useDisclosure } from "@mantine/hooks";
import { useState, useContext, useEffect} from "react";
import { DeSoIdentityContext } from 'react-deso-protocol';
import classes from "./MantineFooter.module.css";
import { useRouter } from "next/router";
import { SignAndSubmitTx } from '@/components/SignAndSubmit/SubmitPost';
import {
    getUnreadNotificationsCount,
    setNotificationMetadata
  } from "deso-protocol";

export function MantineFooter() {
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [active, setActive] = useState("Home");
  const router = useRouter();
  const { currentUser } = useContext(DeSoIdentityContext);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

    const fetchUnreadNotifications = async () => {
        if (!currentUser) {
            return
        }
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });


    setUnreadNotifs(notifData.NotificationsCount)
  };

   // Fetch the followingPosts when the currentUser changes
   useEffect(() => {
    if (currentUser) {
     
      fetchUnreadNotifications();
    }
  }, [currentUser]);

  const resetUnreadNotifications = async () => {
    if (!currentUser) {
        return
    }
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    await setNotificationMetadata({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
      UnreadNotifications: 0,
      LastUnreadNotificationIndex:  notifData.LastUnreadNotificationIndex
    });

    setUnreadNotifs(0)
  };

  return (
    <>
      <Modal
        opened={openedCreate}
        onClose={closeCreate}
        centered
      >
        <SignAndSubmitTx close={closeCreate}/>
      </Modal>

      <Group position="center" spacing="lg" grow wrap="nowrap" hiddenFrom="md">
        <ActionIcon
          className={classes.link}
          data-active={active === "/" || undefined}
          variant="subtle"
          size="xl"
          radius="md"
          onClick={() => {
            setActive("/");
            router.push("/");
          }}
        >
          <IconHome2 size="1.4rem" />
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          className={classes.link}
          data-active={active === "/dashboard" || undefined}
          size="xl"
          radius="md"
          onClick={() => {
            setActive("/dashboard");
            router.push("/dashboard");
          }}
        >
          <IconLayoutDashboard size="1.4rem" />
        </ActionIcon>

        {currentUser && (
          <ActionIcon
            onClick={openCreate}
            color="blue"
            size="lg"
            radius="xl"
            variant="filled"
          >
            <FiPlus size="1.7rem" />
          </ActionIcon>
        )}

        <ActionIcon
          variant="subtle"
          data-active={active === "/wallet" || undefined}
          size="xl"
          radius="md"
          className={classes.link}
          onClick={() => {
            setActive("/wallet");
            router.push("/wallet");
          }}
        >
          <IconReceipt2 size="1.4rem" />
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          className={classes.link}
          data-active={active === "/notifications" || undefined}
          size="xl"
          radius="md"
          onClick={() => {
            setActive("/notifications");
            router.push("/notifications");
            resetUnreadNotifications();
          }}
        >
          {currentUser && unreadNotifs > 0 && (
          <Text fz="sm" fw={700} c="orange">{unreadNotifs}</Text>
        )}  
          <IconBellRinging size="1.4rem" />
        </ActionIcon>
      </Group>
    </>
  );
}