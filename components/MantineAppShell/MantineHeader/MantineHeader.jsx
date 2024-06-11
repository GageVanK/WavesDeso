import {
  Group,
  Button,
  UnstyledButton,
  Text,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  Modal,
  ActionIcon,
  Tooltip,
  Badge,
  Space,
  Menu,
  Avatar,
  Center,
  Container,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBellRinging,
  IconHome2,
  IconUser,
  IconWallet,
  IconLogout,
  IconReceipt2,
  IconPlus,
  IconListSearch,
  IconSearch,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import Link from 'next/link';
import { GiWaveCrest } from 'react-icons/gi';
import { identity, getUnreadNotificationsCount, setNotificationMetadata } from 'deso-protocol';
import { useContext, useEffect, useState } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { PiSealQuestion } from 'react-icons/pi';
import { BsPlusCircleDotted } from 'react-icons/bs';
import { BiSearchAlt } from 'react-icons/bi';
import { useRouter } from 'next/router';
import { MdOutlineDashboard } from 'react-icons/md';
import { LiaUsersSolid } from 'react-icons/lia';
import NotificationsPage from '../../../pages/notifications';
import { Search } from '@/components/Search/Search';
import { SignAndSubmitTx } from '@/components/SignAndSubmit/SubmitPost';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { GoBlocked } from 'react-icons/go';
import classes from './MantineHeader.module.css';

export function MantineHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const { currentUser, alternateUsers } = useContext(DeSoIdentityContext);
  const [openedSearch, { open: openSearch, close: closeSearch }] = useDisclosure(false);
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const router = useRouter();
  const handleUserSwitch = (publicKey) => {
    identity.setActiveUser(publicKey);
  };
  const [opened, setOpened] = useState(false);
  const handleLogout = () => {
    if (alternateUsers && alternateUsers.length > 0) {
      const firstAlternateUser = alternateUsers[0];
      identity.logout().then(() => {
        handleUserSwitch(firstAlternateUser.PublicKeyBase58Check);
      });
    } else {
      identity.logout();
    }
  };

  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const fetchUnreadNotifications = async () => {
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });

    setUnreadNotifs(notifData.NotificationsCount);
  };

  // Fetch the followingPosts when the currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchUnreadNotifications();
    }
  }, [currentUser]);

  const resetUnreadNotifications = async () => {
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
    });
    await setNotificationMetadata({
      PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      UnreadNotifications: 0,
      LastUnreadNotificationIndex: notifData?.LastUnreadNotificationIndex,
    });

    setUnreadNotifs(0);
  };

  return (
    <>
      <Modal size="xl" opened={openedCreate} onClose={closeCreate}>
        <SignAndSubmitTx close={closeCreate} />
      </Modal>

      <Modal size="md" opened={openedSearch} onClose={closeSearch}>
        <Search close={closeSearch} />
      </Modal>

      <Box>
        <header className={classes.header}>
          <Group justify="space-between" h="100%">
            <Group ml={22}>
              <Text
                size="xl"
                fw={900}
                fs="italic"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              >
                Waves
              </Text>
              <Badge color="blue" radius="sm" className={classes.betaTag}>
                BETA
              </Badge>
            </Group>

            <Group h="100%" visibleFrom="sm" justify="center">
              <Search close={closeSearch} />
            </Group>

            <Group visibleFrom="sm" mr={22}>
              {currentUser && (
                <Tooltip label="Create Post">
                  <ActionIcon onClick={openCreate} variant="subtle" size="lg" radius="xl">
                    <BsPlusCircleDotted size="1.3rem" />
                  </ActionIcon>
                </Tooltip>
              )}

              <Menu opened={opened} onChange={setOpened} offset={2} shadow="md" withArrow>
                <Tooltip label="Notifications" withArrow position="bottom" offset={3}>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      radius="xl"
                      aria-label="Notification Button"
                      onClick={() => {
                        resetUnreadNotifications();
                        setOpened(true);
                      }}
                    >
                      <IconBellRinging size="1.3rem" strokeWidth={1.2} />

                      {currentUser && unreadNotifs > 0 && (
                        <Text fz="sm" fw={700} c="red">
                          {unreadNotifs}
                        </Text>
                      )}
                    </ActionIcon>
                  </Menu.Target>
                </Tooltip>

                <Menu.Dropdown>
                  <Space h="xs" />
                  <Group justify="right">
                    <Button
                      variant="light"
                      size="xs"
                      mr={11}
                      onClick={() => {
                        router.push('/notifications');
                        setOpened(false);
                      }}
                    >
                      View More
                    </Button>
                  </Group>

                  <ScrollArea h={555}>
                    <NotificationsPage />
                  </ScrollArea>
                </Menu.Dropdown>
              </Menu>

              <ColorSchemeToggle />

              {!currentUser && (!alternateUsers || alternateUsers.length === 0) && (
                <>
                  <Button variant="default" onClick={() => identity.login()}>
                    Sign In
                  </Button>
                </>
              )}

              {!!currentUser && (
                <Menu
                  trigger="hover"
                  openDelay={100}
                  closeDelay={400}
                  shadow="md"
                  width={200}
                  zIndex={1000000}
                >
                  <Menu.Target>
                    <UnstyledButton>
                      <Avatar
                        variant="light"
                        radius="xl"
                        size="md"
                        src={
                          `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser.PublicKeyBase58Check}` ||
                          null
                        }
                        alt="Profile Picture"
                      />
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPlus size={17} />}
                      onClick={() => identity.login()}
                    >
                      Add Account
                    </Menu.Item>
                    {alternateUsers?.length > 0 && (
                      <>
                        <Menu.Divider />
                        <Menu.Label>Accounts</Menu.Label>
                      </>
                    )}

                    {alternateUsers?.map((user) => (
                      <Menu.Item
                        leftSection={<IconUser size={17} />}
                        key={user.PublicKeyBase58Check}
                        onClick={() => identity.setActiveUser(user.PublicKeyBase58Check)}
                        style={{
                          maxWidth: '190px', // Adjust the maximum width as needed
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user.ProfileEntryResponse?.Username ?? user.PublicKeyBase58Check}
                      </Menu.Item>
                    ))}

                    {currentUser && (
                      <>
                        <Menu.Divider />
                        <Menu.Label>Lists</Menu.Label>
                        <Menu.Item
                          component={Link}
                          href="/closeFriends"
                          leftSection={<LiaUsersSolid size={17} />}
                        >
                          Close Friends
                        </Menu.Item>
                        <Menu.Item
                          component={Link}
                          href="/blockedUsers"
                          leftSection={<GoBlocked size={17} />}
                        >
                          Blocked Users
                        </Menu.Item>
                      </>
                    )}

                    <Menu.Divider />

                    <Menu.Label>Visit DeSo</Menu.Label>
                    <Menu.Item
                      onClick={() => window.open('https://explorer.deso.com/', '_blank')}
                      leftSection={<IconListSearch size={17} />}
                    >
                      DeSo Explorer
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => window.open('https://wallet.deso.com/', '_blank')}
                      leftSection={<IconReceipt2 size={17} />}
                    >
                      DeSo Wallet
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      leftSection={<IconLogout size={17} />}
                      onClick={handleLogout}
                      color="red"
                    >
                      Sign Out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>

            <Group gap="xs" hiddenFrom="sm">
              <ColorSchemeToggle />
              <Burger opened={drawerOpened} onClick={toggleDrawer} />
            </Group>
          </Group>
        </header>

        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="70%"
          padding="md"
          title={
            <Text
              fw={700}
              size="xl"
              fs="italic"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            >
              Waves
            </Text>
          }
          className={classes.hiddenDesktop}
          zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
            <Link href="/" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 360 }}
              >
                <IconHome2 />
              </ActionIcon>
              <Space w="md" />
              Home
            </Link>
            <Space h="md" />
            <Link href="/dashboard" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              >
                <IconLayoutDashboard />
              </ActionIcon>
              <Space w="md" />
              Dashboard
            </Link>
            <Space h="md" />
            <Link href="/wallet" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 150 }}
              >
                <IconWallet />
              </ActionIcon>
              <Space w="md" />
              Wallet
            </Link>
            <Space h="md" />
            <Link href="/notifications" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 270 }}
              >
                <IconBellRinging />
              </ActionIcon>
              <Space w="md" />
              Notifications
            </Link>
            <Space h="md" />
            <Link href="/search" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 270 }}
              >
                <IconSearch size="1.7rem" />
              </ActionIcon>
              <Space w="md" />
              Search
            </Link>
            <Space h="md" />
            <Link href="/why" className={classes.link} onClick={closeDrawer}>
              <ActionIcon
                variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                gradient={{ from: 'blue', to: 'cyan', deg: 270 }}
              >
                <PiSealQuestion size="1.7rem" />
              </ActionIcon>
              <Space w="md" />
              Why Waves
            </Link>
            <Space h="md" />

            <Group justify="center" grow pb="xl" px="md">
              {!currentUser && (!alternateUsers || alternateUsers.length === 0) && (
                <>
                  <Button variant="default" onClick={() => identity.login()}>
                    Sign In
                  </Button>
                  <Button
                    leftSection={<GiWaveCrest size="1rem" />}
                    variant="gradient"
                    gradient={{ from: 'cyan', to: 'indigo', deg: 150 }}
                    onClick={() => identity.login()}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {!!currentUser && (
                <Menu
                  trigger="hover"
                  openDelay={100}
                  closeDelay={400}
                  shadow="md"
                  width={200}
                  zIndex={1000000}
                >
                  <Menu.Target>
                    <Button
                      leftSection={<GiWaveCrest size="1rem" />}
                      variant="gradient"
                      gradient={{ from: 'cyan', to: 'indigo', deg: 150 }}
                    >
                      {currentUser.ProfileEntryResponse?.Username ??
                        currentUser.PublicKeyBase58Check}
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPlus size={17} />}
                      onClick={() => identity.login()}
                    >
                      Add Account
                    </Menu.Item>
                    {alternateUsers?.length > 0 && (
                      <>
                        <Menu.Divider />
                        <Menu.Label>Accounts</Menu.Label>
                      </>
                    )}

                    {alternateUsers?.map((user) => (
                      <Menu.Item
                        leftSection={<IconUser size={17} />}
                        key={user.PublicKeyBase58Check}
                        onClick={() => identity.setActiveUser(user.PublicKeyBase58Check)}
                        style={{
                          maxWidth: '190px', // Adjust the maximum width as needed
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user.ProfileEntryResponse?.Username ?? user.PublicKeyBase58Check}
                      </Menu.Item>
                    ))}

                    {currentUser && (
                      <>
                        <Menu.Divider />
                        <Menu.Label>Lists</Menu.Label>
                        <Menu.Item
                          component={Link}
                          href="/closeFriends"
                          leftSection={<LiaUsersSolid size={17} />}
                        >
                          Close Friends
                        </Menu.Item>
                        <Menu.Item
                          component={Link}
                          href="/blockedUsers"
                          leftSection={<GoBlocked size={17} />}
                        >
                          Blocked Users
                        </Menu.Item>
                      </>
                    )}

                    <Menu.Divider />

                    <Menu.Label>Visit DeSo</Menu.Label>
                    <Menu.Item
                      onClick={() => window.open('https://explorer.deso.com/', '_blank')}
                      leftSection={<IconListSearch size={17} />}
                    >
                      DeSo Explorer
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => window.open('https://wallet.deso.com/', '_blank')}
                      leftSection={<IconReceipt2 size={17} />}
                    >
                      DeSo Wallet
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={17} />}
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </ScrollArea>
        </Drawer>
      </Box>
    </>
  );
}
