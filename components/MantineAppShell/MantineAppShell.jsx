import { ActionIcon, AppShell, Container, Group, Modal, Tooltip, Space } from '@mantine/core';
import { RiArrowRightDoubleLine, RiArrowLeftDoubleLine } from 'react-icons/ri';
import { useDisclosure } from '@mantine/hooks';
import { PiShootingStarLight } from 'react-icons/pi';
import { useRouter } from 'next/router';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { getSingleProfile } from 'deso-protocol';
import { useContext, useState, useEffect } from 'react';
import { LiaGlobeSolid } from 'react-icons/lia';
import { MantineHeader } from '@/components/MantineAppShell/MantineHeader/MantineHeader';
import { MantineNavBar } from '@/components/MantineAppShell/MantineNavBar/MantineNavBar';
import { MantineAside } from '@/components/MantineAppShell/MantineAside/MantineAside';
import { MantineFooter } from '@/components/MantineAppShell/MantineFooter/MantineFooter';
import { Chat } from '@/components/Chat';
import { Spotlight } from '../Spotlight/Spotlight';
import classes from './MantineAppShell.module.css';
export function MantineAppShell({ children }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [opened, { open, close }] = useDisclosure(false);
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true);
  const [asideOpened, { toggle: toggleAside }] = useDisclosure(true);
  const [profile, setProfile] = useState();
  const router = useRouter();
  const { userName } = router.query;
  const { currentUser } = useContext(DeSoIdentityContext);
  const [openedChat, { open: openChat, close: closeChat }] = useDisclosure(false);

  // Get Profile for chat
  const fetchProfile = async () => {
    try {
      const profileData = await getSingleProfile({
        Username: userName,
        NoErrorOnMissing: true,
      });

      if (profileData !== null) {
        setProfile(profileData.Profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchProfile();
    }
  }, [userName]);

  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <Spotlight />
      </Modal>

      <Modal p="md" opened={openedChat} onClose={closeChat}>
        <Chat handle="Global Wave" />
      </Modal>

      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'md',
          collapsed: { mobile: !mobileOpened, desktop: !navOpened },
        }}
        aside={{
          width: 300,
          breakpoint: 'md',
          collapsed: { mobile: !mobileOpened, desktop: !asideOpened },
        }}
      >
        <AppShell.Header className={classes.theme}>
          <MantineHeader />
        </AppShell.Header>

        <AppShell.Navbar className={classes.theme}>
          <MantineNavBar navOpened={navOpened} toggleNav={toggleNav} />
        </AppShell.Navbar>

        <AppShell.Aside className={classes.theme}>
          {asideOpened && (
            <>
              <Tooltip position="right-start" label="Close Sidebar">
                <ActionIcon variant="light" mt={11} ml={11} onClick={toggleAside} visibleFrom="sm">
                  <RiArrowRightDoubleLine />
                </ActionIcon>
              </Tooltip>
            </>
          )}

          {router.pathname.startsWith('/wave/') && profile && (
            <>
              <Space h="xl" />
              <Chat handle={profile?.Username || 'Anon'} />
            </>
          )}

          {router.pathname === '/dashboard' && currentUser && (
            <>
              <Space h="xl" />
              <Chat handle={currentUser?.ProfileEntryResponse?.Username || 'Anon'} />
            </>
          )}
          <MantineAside />
        </AppShell.Aside>

        <AppShell.Footer>
          <MantineFooter />
        </AppShell.Footer>

        <AppShell.Main>
          <Group justify="space-between">
            {!navOpened && (
              <Tooltip position="right-start" label="Open Navbar">
                <Group justify="left" mt={15} ml={10} style={{ position: 'fixed', zIndex: 9999 }}>
                  <ActionIcon variant="light" onClick={toggleNav} visibleFrom="sm">
                    <RiArrowRightDoubleLine />
                  </ActionIcon>
                </Group>
              </Tooltip>
            )}

            {!asideOpened && (
              <Tooltip position="right-start" label="Open Sidebar">
                <Group
                  mt={15}
                  mr={10}
                  justify="right"
                  style={{ position: 'fixed', zIndex: 9999, right: '1px' }}
                >
                  <ActionIcon variant="light" onClick={toggleAside} visibleFrom="sm">
                    <RiArrowLeftDoubleLine />
                  </ActionIcon>
                </Group>
              </Tooltip>
            )}
          </Group>
          <Space h="md" />

          <Group hiddenFrom="md">
            <Tooltip label="Global Chat">
              <ActionIcon
                mt={40}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                size="xl"
                radius="xl"
                onClick={openChat}
                style={{ position: 'fixed', zIndex: 9999 }}
              >
                <LiaGlobeSolid size="2rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group justify="flex-end" hiddenFrom="md">
            <Tooltip label="Spotlight">
              <ActionIcon
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                size="xl"
                radius="xl"
                hiddenFrom="md"
                onClick={open}
              >
                <PiShootingStarLight size="1.4rem" />
              </ActionIcon>
            </Tooltip>
          </Group>

          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
