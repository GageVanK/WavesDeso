import { GiWaveCrest } from 'react-icons/gi';
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSingleProfile,
  updateFollowingStatus,
  getIsFollowing,
  identity,
  sendDeso,
  getExchangeRates,
} from 'deso-protocol';
import {
  Grid,
  Container,
  ThemeIcon,
  CopyButton,
  Box,
  Overlay,
  Avatar,
  Paper,
  Group,
  Text,
  Card,
  Space,
  Modal,
  Center,
  Divider,
  Image,
  Tabs,
  Badge,
  ActionIcon,
  Tooltip,
  Button,
  Loader,
  Collapse,
  UnstyledButton,
  List,
} from '@mantine/core';
import { useEffect, useState, useContext } from 'react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { IconScreenShare, IconCheck, IconHeartHandshake, IconX } from '@tabler/icons-react';

export function SubscriptionModal({ publickey, username }) {
  const [openedSub1, { toggle: toggleSub1 }] = useDisclosure(false);
  const [openedSub2, { toggle: toggleSub2 }] = useDisclosure(false);
  const [openedSub3, { toggle: toggleSub3 }] = useDisclosure(false);
  const [openedSub, { open: openSub, close: closeSub }] = useDisclosure(false);
  const { currentUser } = useContext(DeSoIdentityContext);

  const subTier1 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: publickey,
      });

      const subscriptionAmount = 5; // $5 USD
      const usdCentsPerDeSoExchangeRate = exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount = (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(equivalentDeSoAmount / nanosPerDeSo);

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: publickey,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Subcribed',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: `You successfully subscribed to ${username}`,
      });
    } catch (error) {
      if (error.message.includes('RuleErrorInsufficientBalance')) {
        notifications.show({
          title: 'Insufficient Balance',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Hey there, please add DeSo to your Wallet to complete this transaction.',
        });
      } else {
        notifications.show({
          title: 'Error',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Something Happened!',
        });
        console.error('Error submitting transaction:', error);
      }
    }
  };

  const subTier2 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: publickey,
      });

      const subscriptionAmount = 15; // $5 USD
      const usdCentsPerDeSoExchangeRate = exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount = (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(equivalentDeSoAmount / nanosPerDeSo);

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: publickey,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Subcribed',
        icon: <IconCheck size="1.1rem" />,
        color: 'red',
        message: `You successfully subscribed to ${username}`,
      });
    } catch (error) {
      if (error.message.includes('RuleErrorInsufficientBalance')) {
        notifications.show({
          title: 'Insufficient Balance',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Hey there, please add DeSo to your Wallet to complete this transaction.',
        });
      } else {
        notifications.show({
          title: 'Error',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Something Happened!',
        });
        console.error('Error submitting transaction:', error);
      }
    }
  };

  const subTier3 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: publickey,
      });

      const subscriptionAmount = 25; // $25 USD
      const usdCentsPerDeSoExchangeRate = exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount = (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(equivalentDeSoAmount / nanosPerDeSo);

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: publickey,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });
      notifications.show({
        title: 'Subcribed',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: `You successfully subscribed to ${username}`,
      });
    } catch (error) {
      if (error.message.includes('RuleErrorInsufficientBalance')) {
        notifications.show({
          title: 'Insufficient Balance',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Hey there, please add DeSo to your Wallet to complete this transaction.',
        });
      } else {
        notifications.show({
          title: 'Error',
          icon: <IconX size="1.1rem" />,
          color: 'red',
          message: 'Something Happened!',
        });
        console.error('Error submitting transaction:', error);
      }
    }
  };

  return (
    <>
      <Button
        variant="gradient"
        gradient={{ from: 'cyan', to: 'indigo' }}
        rightSection={<GiWaveCrest size="1rem" />}
        onClick={openSub}
      >
        Subscribe
      </Button>
      <Modal
        zIndex={1111111111}
        size="70%"
        opened={openedSub}
        onClose={closeSub}
        centered
        transitionProps={{ transition: 'fade' }}
      >
        <Paper p="xl">
          <Space h="xs" />
          <Text fz="xl" fw={700} ta="center">
            {' '}
            Join {username}'s Wave
          </Text>
          <Text fz="xl" fw={700} ta="center">
            {' '}
            Subscribe to contribute to their growth
          </Text>
          <Space h="md" />

          <Space h="md" />
          <Center>
            <Box>
              <Grid>
                <Grid.Col lg={4} sm={7}>
                  <Paper shadow="xl" p="xl" withBorder>
                    <List>
                      <Text fw={700} ta="center">
                        Tier 1
                      </Text>
                      <Divider my="sm" />
                      <Space h="md" />
                      <List.Item>
                        <Text size="xs">1 Month Subcription</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">1 Month Subscriber Badge</Text>
                      </List.Item>

                      <List.Item>
                        <Text size="xs">1 Month Subscriber NFT</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">{`1 ${username} Points`}</Text>
                      </List.Item>
                    </List>
                    <Space h="md" />
                    <Center>
                      <Button onClick={toggleSub1} variant="default" radius="md" fullWidth>
                        $5.00
                      </Button>
                    </Center>
                    <Space h="md" />
                    <Collapse in={openedSub1}>
                      <Paper shadow="xl" radius="xl" p="xl" withBorder>
                        <Center>
                          <Text fz="sm" fw={500}>
                            Confirm Purchase
                          </Text>
                        </Center>
                        <Space h="xs" />
                        <Text ta="center" fz="xs" fw={500} c="dimmed">
                          <ThemeIcon radius="xl" size={14} variant="outline">
                            <TiInfoLargeOutline />
                          </ThemeIcon>{' '}
                          This will instantly be paid out to {`${username}`}
                        </Text>

                        <Divider my="sm" />

                        <Button
                          onClick={subTier1}
                          variant="light"
                          radius="md"
                          fullWidth
                          leftSection={<IconHeartHandshake size="1.5rem" />}
                        >
                          Subscribe
                        </Button>
                      </Paper>
                    </Collapse>
                  </Paper>
                </Grid.Col>
                <Grid.Col lg={4} sm={7}>
                  <Paper shadow="xl" p="xl" withBorder>
                    <List>
                      <Text fw={700} ta="center">
                        Tier 2
                      </Text>
                      <Divider my="sm" />
                      <Space h="md" />
                      <List.Item>
                        <Text size="xs">3 Month Subcription</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">3 Month Subscriber Badge</Text>
                      </List.Item>

                      <List.Item>
                        <Text size="xs">3 Month Subscriber NFT</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">{`3 ${username} Points`}</Text>
                      </List.Item>
                    </List>
                    <Space h="md" />
                    <Center>
                      <Button onClick={toggleSub2} variant="default" radius="md" fullWidth>
                        $15.00
                      </Button>
                    </Center>
                    <Space h="md" />
                    <Collapse in={openedSub2}>
                      <Paper shadow="xl" radius="xl" p="xl" withBorder>
                        <Center>
                          <Text fz="sm" fw={500}>
                            Confirm Purchase
                          </Text>
                        </Center>
                        <Space h="xs" />
                        <Text ta="center" fz="xs" fw={500} c="dimmed">
                          <ThemeIcon radius="xl" size={14} variant="outline">
                            <TiInfoLargeOutline />
                          </ThemeIcon>{' '}
                          This will instantly be paid out to {`${username}`}
                        </Text>

                        <Divider my="sm" />

                        <Button
                          fullWidth
                          onClick={subTier2}
                          variant="light"
                          radius="md"
                          leftSection={<IconHeartHandshake size="1.5rem" />}
                        >
                          Subscribe
                        </Button>
                      </Paper>
                    </Collapse>
                  </Paper>
                </Grid.Col>
                <Grid.Col lg={4} sm={7}>
                  <Paper shadow="xl" p="xl" withBorder>
                    <List>
                      <Text fw={700} ta="center">
                        Tier 3
                      </Text>
                      <Divider my="sm" />
                      <Space h="md" />
                      <List.Item>
                        <Text size="xs">6 Month Subcription</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">6 Month Subscriber Badge</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs">6 Month Subscriber NFT</Text>
                      </List.Item>

                      <List.Item>
                        <Text size="xs">{`6 ${username} Points`}</Text>
                      </List.Item>
                    </List>
                    <Space h="md" />
                    <Center>
                      <Button onClick={toggleSub3} variant="default" radius="md" fullWidth>
                        $25.00
                      </Button>
                    </Center>
                    <Space h="md" />
                    <Collapse in={openedSub3}>
                      <Paper shadow="xl" radius="xl" p="xl" withBorder>
                        <Center>
                          <Text fz="sm" fw={500}>
                            Confirm Purchase
                          </Text>
                        </Center>
                        <Space h="xs" />
                        <Text ta="center" fz="xs" fw={500} c="dimmed">
                          <ThemeIcon radius="xl" size={14} variant="outline">
                            <TiInfoLargeOutline />
                          </ThemeIcon>{' '}
                          This will instantly be paid out to {`${username}`}
                        </Text>

                        <Divider my="sm" />

                        <Button
                          onClick={subTier3}
                          variant="light"
                          radius="md"
                          fullWidth
                          leftSection={<IconHeartHandshake size="1.5rem" />}
                        >
                          Subscribe
                        </Button>
                      </Paper>
                    </Collapse>
                  </Paper>
                </Grid.Col>
              </Grid>

              {currentUser?.PublicKeyBase58Check === publickey && (
                <Overlay center>
                  <Container size="md" px={0}>
                    <Space h={77} />
                    <Paper shadow="xl" p="lg" withBorder>
                      <Text fw={500}>
                        Can't Subscribe to yourself. Switch Accounts to Subscribe!
                      </Text>
                      <Divider my="sm" />
                      <Button
                        leftSection={<GiWaveCrest size="1rem" />}
                        variant="gradient"
                        gradient={{ from: 'cyan', to: 'indigo' }}
                        onClick={() => identity.login()}
                        fullWidth
                      >
                        Switch Account
                      </Button>
                    </Paper>
                  </Container>
                </Overlay>
              )}

              {!currentUser && (
                <Overlay center>
                  <Container size="md" px={0}>
                    <Space h={77} />
                    <Paper shadow="xl" p="lg" withBorder>
                      <Text fw={500}>Please Signup or Sign In to Subscribe.</Text>
                      <Divider my="sm" />
                      <Button
                        leftSection={<GiWaveCrest size="1rem" />}
                        variant="gradient"
                        gradient={{ from: 'cyan', to: 'indigo' }}
                        onClick={() => identity.login()}
                        fullWidth
                      >
                        Sign Up
                      </Button>
                      <Space h="sm" />
                      <Button fullWidth variant="default" onClick={() => identity.login()}>
                        Sign In
                      </Button>
                    </Paper>
                  </Container>
                </Overlay>
              )}
            </Box>
          </Center>
        </Paper>
      </Modal>
    </>
  );
}
