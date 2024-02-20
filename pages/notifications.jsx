import {
  Avatar,
  Paper,
  Group,
  Text,
  Space,
  Center,
  Divider,
  Container,
  Loader,
  Button,
  UnstyledButton,
  Notification,
  Tabs,
  Box,
  Title,
} from '@mantine/core';
import { useState, useContext, useEffect } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import {
  getNotifications,
  getSingleProfile,
  identity,
  getAppState,
  getUnreadNotificationsCount,
} from 'deso-protocol';
import Link from 'next/link';
import { GiWaveCrest, GiMoneyStack } from 'react-icons/gi';
import {
  IconHeartPlus,
  IconHeart,
  IconUsers,
  IconMessage2,
  IconDiamond,
  IconRecycle,
  IconAt,
  IconCoin,
  IconThumbUp,
  IconThumbUpFilled,
  IconCoinOff,
  IconMoneybag,
  IconHeartFilled,
} from '@tabler/icons-react';
import { BiRepost } from 'react-icons/bi';
import { TfiComments } from 'react-icons/tfi';
import { HiOutlineUsers } from 'react-icons/hi2';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { FaRegCommentDots } from 'react-icons/fa';
import Post from '@/components/Post';
import formatDate from '@/formatDate';

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);
  const [notifications, setNotifications] = useState([]);
  const [usd, setUSD] = useState(null);
  const [lastIndex, setLastIndex] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const notificationData = await getNotifications({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        NumToFetch: 25,
        FetchStartIndex: -1,
      });

      setLastIndex(notificationData.Notifications[notificationData.Notifications.length - 1].Index);
      // Initialize an array to store matched notifications with related posts and profiles
      const matchedNotifications = [];

      // Check if notifications is defined
      if (notificationData.Notifications) {
        // Iterate through Notifications while maintaining the original order
        notificationData.Notifications.forEach((notification) => {
          try {
            const parentPostHash =
              notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex ||
              notification.Metadata.BasicTransferTxindexMetadata?.PostHashHex;
            const modifiedPostHash =
              notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex;
            const reactedPostHash =
              notification.Metadata.LikeTxindexMetadata?.PostHashHex ||
              notification.Metadata.CreatePostAssociationTxindexMetadata?.PostHashHex;

            if (parentPostHash || modifiedPostHash || reactedPostHash) {
              const relatedParentPost = parentPostHash
                ? notificationData.PostsByHash[parentPostHash]
                : null;
              const relatedModifiedPost = modifiedPostHash
                ? notificationData.PostsByHash[modifiedPostHash]
                : null;
              const reactedPost = reactedPostHash
                ? notificationData.PostsByHash[reactedPostHash]
                : null;

              let matchedNotification = matchedNotifications.find(
                (item) => item.notification === notification
              );

              if (!matchedNotification) {
                matchedNotification = {
                  notification,
                  relatedParentPost: null,
                  relatedModifiedPost: null,
                  reactedPost: null,
                  relatedProfiles: [],
                };
                matchedNotifications.push(matchedNotification);
              }

              if (relatedParentPost) {
                matchedNotification.relatedParentPost = relatedParentPost;
              }
              if (relatedModifiedPost) {
                matchedNotification.relatedModifiedPost = relatedModifiedPost;
              }
              if (reactedPostHash) {
                matchedNotification.reactedPost = reactedPost;
              }
            }

            const transactorPublicKey =
              notification.Metadata?.TransactorPublicKeyBase58Check || null;
            const transactorProfile =
              transactorPublicKey && notificationData.ProfilesByPublicKey[transactorPublicKey];

            let matchedNotification = matchedNotifications.find(
              (item) => item.notification === notification
            );

            if (!matchedNotification) {
              matchedNotification = {
                notification,
                transactorProfile: null,
              };
              matchedNotifications.push(matchedNotification);
            }

            matchedNotification.transactorProfile = transactorProfile;
          } catch (error) {
            console.error('Error processing notification:', notification);
            console.error('Error details:', error);
          }
        });
      }

      setNotifications(matchedNotifications);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      setIsLoading(false);
    }
  };

  const fetchMoreNotifications = async () => {
    try {
      setIsLoadingMore(true);
      const notificationData = await getNotifications({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        NumToFetch: 25,
        FetchStartIndex: lastIndex,
      });

      setLastIndex(notificationData.Notifications[notificationData.Notifications.length - 1].Index);
      // Initialize an array to store matched notifications with related posts and profiles
      const matchedNotifications = [];

      // Check if notifications is defined
      if (notificationData.Notifications) {
        // Iterate through Notifications while maintaining the original order
        notificationData.Notifications.forEach((notification) => {
          try {
            const parentPostHash =
              notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex ||
              notification.Metadata.BasicTransferTxindexMetadata?.PostHashHex;
            const modifiedPostHash =
              notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex;
            const reactedPostHash =
              notification.Metadata.LikeTxindexMetadata?.PostHashHex ||
              notification.Metadata.CreatePostAssociationTxindexMetadata?.PostHashHex;

            if (parentPostHash || modifiedPostHash || reactedPostHash) {
              const relatedParentPost = parentPostHash
                ? notificationData.PostsByHash[parentPostHash]
                : null;
              const relatedModifiedPost = modifiedPostHash
                ? notificationData.PostsByHash[modifiedPostHash]
                : null;
              const reactedPost = reactedPostHash
                ? notificationData.PostsByHash[reactedPostHash]
                : null;

              let matchedNotification = matchedNotifications.find(
                (item) => item.notification === notification
              );

              if (!matchedNotification) {
                matchedNotification = {
                  notification,
                  relatedParentPost: null,
                  relatedModifiedPost: null,
                  reactedPost: null,
                  relatedProfiles: [],
                };
                matchedNotifications.push(matchedNotification);
              }

              if (relatedParentPost) {
                matchedNotification.relatedParentPost = relatedParentPost;
              }
              if (relatedModifiedPost) {
                matchedNotification.relatedModifiedPost = relatedModifiedPost;
              }
              if (reactedPostHash) {
                matchedNotification.reactedPost = reactedPost;
              }
            }

            const transactorPublicKey =
              notification.Metadata?.TransactorPublicKeyBase58Check || null;
            const transactorProfile =
              transactorPublicKey && notificationData.ProfilesByPublicKey[transactorPublicKey];

            let matchedNotification = matchedNotifications.find(
              (item) => item.notification === notification
            );

            if (!matchedNotification) {
              matchedNotification = {
                notification,
                transactorProfile: null,
              };
              matchedNotifications.push(matchedNotification);
            }

            matchedNotification.transactorProfile = transactorProfile;
          } catch (error) {
            console.error('Error processing notification:', notification);
            console.error('Error details:', error);
          }
        });
      }

      setNotifications((prevPosts) => [...prevPosts, ...matchedNotifications]);

      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appState = await getAppState({
          PublicKeyBase58Check: 'BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD',
        });
        const desoUSD = appState.USDCentsPerDeSoCoinbase / 100;

        setUSD(desoUSD);
      } catch (error) {
        console.error('Error fetching app state:', error);
      }
    };

    fetchData();
  }, [notifications]);

  const convertToUSD = (nanos) => {
    try {
      const nanoToDeso = 0.000000001;
      const deso = nanos * nanoToDeso;
      let usdValue = deso * usd;

      if (usdValue < 0.01) {
        usdValue = 0.01;
      }

      return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } catch (error) {
      console.error('Error converting Nanos to USD:', error);
      return null;
    }
  };

  return (
    <div>
      <Divider
        my="xs"
        label={
          <>
            <Title order={3}>Notifications</Title>
          </>
        }
        labelPosition="center"
      />

      {!currentUser && (
        <>
          <Space h="xl" />
          <Container size="30rem" px={0}>
            <Paper shadow="xl" p="lg" withBorder>
              <Center>
                <Text c="dimmed" fw={700}>
                  Please Sign Up or Sign In to view your Notifications.
                </Text>
              </Center>
              <Space h="md" />
              <Center>
                <Button
                  fullWidth
                  leftSection={<GiWaveCrest size="1rem" />}
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'indigo' }}
                  onClick={() => identity.login()}
                >
                  Sign Up
                </Button>
                <Space w="xs" />
                <Button fullWidth variant="default" onClick={() => identity.login()}>
                  Sign In
                </Button>
              </Center>
            </Paper>
          </Container>
        </>
      )}

      {currentUser && (
        <Container>
          <Tabs variant="pills" radius="xl" defaultValue="All">
            <Center>
              <Tabs.List>
                <Tabs.Tab value="All">All</Tabs.Tab>
                <Tabs.Tab value="Follows" leftSection={<AiOutlineUserAdd size="1.3rem" />} />
                <Tabs.Tab value="Mentions" leftSection={<IconAt size="1.3rem" />} />
                <Tabs.Tab value="Reactions" leftSection={<IconHeartFilled size="1.3rem" />} />
                <Tabs.Tab value="Comments" leftSection={<FaRegCommentDots size="1.3rem" />} />
                <Tabs.Tab value="Diamonds" leftSection={<IconDiamond size="1.3rem" />} />
                <Tabs.Tab value="Reposts" leftSection={<IconRecycle size="1.3rem" />} />
                <Tabs.Tab value="CC" leftSection={<IconCoin size="1.3rem" />} />
                <Tabs.Tab value="Sent" leftSection={<GiMoneyStack size="1.3rem" />} />
              </Tabs.List>
            </Center>
            <Space h="sm" />
            <Tabs.Panel value="All">
              <>
                {isLoading ? (
                  <Center>
                    <Loader variant="bars" />
                  </Center>
                ) : (
                  <>
                    {notifications.map((n) => (
                      <>
                        {/* Liked Post */}
                        {(n.notification.Metadata.TxnType === 'CREATE_POST_ASSOCIATION' &&
                          n.notification.Metadata.CreatePostAssociationTxindexMetadata
                            .AssociationValue === 'LIKE') ||
                          (n.notification.Metadata.TxnType === 'LIKE' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<IconThumbUp size="1.3rem" />}
                                radius="md"
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.transactorProfile?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <UnstyledButton
                                        component={Link}
                                        href={`/post/${
                                          n.notification.Metadata
                                            ?.CreatePostAssociationTxindexMetadata?.PostHashHex ||
                                          n.notification.Metadata?.LikeTxindexMetadata.PostHashHex
                                        }`}
                                      >
                                        <Group>
                                          <Text fw={500} size="sm" td="">
                                            Liked
                                          </Text>

                                          <Box maw={321}>
                                            <Text size="sm" truncate="end">
                                              {n.reactedPost?.Body || 'your post'}
                                            </Text>
                                          </Box>
                                        </Group>
                                      </UnstyledButton>
                                    </Group>
                                  </>
                                }
                              />
                            </>
                          ))}

                        {/* Loved Post */}
                        {n.notification.Metadata.TxnType === 'CREATE_POST_ASSOCIATION' &&
                          n.notification.Metadata?.CreatePostAssociationTxindexMetadata
                            .AssociationValue === 'LOVE' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<IconHeartFilled size="1.3rem" />}
                                radius="md"
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton>
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <UnstyledButton
                                        component={Link}
                                        href={`/post/${n.notification.Metadata?.CreatePostAssociationTxindexMetadata?.PostHashHex}`}
                                      >
                                        <Group>
                                          <Text fw={500} size="sm" td="">
                                            Loved
                                          </Text>

                                          <Box maw={321}>
                                            <Text size="sm" truncate="end">
                                              {n.reactedPost?.Body || 'your post!'}
                                            </Text>
                                          </Box>
                                        </Group>
                                      </UnstyledButton>
                                    </Group>
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* Mentions */}
                        {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                          n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                            'MentionedPublicKeyBase58Check' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                radius="md"
                                icon={<IconAt />}
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.transactorProfile?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>
                                      <Text fw={500} size="sm">
                                        Mentioned you
                                      </Text>
                                    </Group>
                                    <Post
                                      post={n.relatedModifiedPost}
                                      username={n.transactorProfile?.Username}
                                      key={n.transactorProfile?.PublicKeyBase58Check}
                                    />
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* Reposts & Quotes */}
                        {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                          n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                            'RepostedPublicKeyBase58Check' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<IconRecycle size="1.3rem" />}
                                radius="md"
                                title={
                                  <>
                                    <Group justify="right">
                                      <Text c="dimmed" size="xs" fw={500}>
                                        {formatDate(n.relatedModifiedPost?.TimestampNanos)} ago
                                      </Text>
                                    </Group>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.relatedModifiedPost?.ProfileEntryResponse?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                                ?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.relatedModifiedPost?.ProfileEntryResponse
                                                  ?.ExtraData?.DisplayName ||
                                                  n.relatedModifiedPost?.ProfileEntryResponse
                                                    ?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @
                                              {n.relatedModifiedPost.ProfileEntryResponse
                                                .Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <UnstyledButton
                                        component={Link}
                                        href={`/post/${n.notification.Metadata.SubmitPostTxindexMetadata.PostHashBeingModifiedHex}`}
                                      >
                                        <Text fw={500} size="sm">
                                          Reposted
                                        </Text>
                                      </UnstyledButton>
                                    </Group>
                                    <Space h="md" />
                                    <Post
                                      post={n.relatedModifiedPost}
                                      username={n.transactorProfile?.Username}
                                      key={n.transactorProfile?.PublicKeyBase58Check}
                                    />
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* Comments */}
                        {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                          n.notification.Metadata.AffectedPublicKeys.length >= 2 &&
                          n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                            'ParentPosterPublicKeyBase58Check' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<FaRegCommentDots size="1.3rem" />}
                                radius="md"
                                title={
                                  <>
                                    <Group justify="right">
                                      <Text c="dimmed" size="xs" fw={500}>
                                        {formatDate(n.relatedModifiedPost?.TimestampNanos)} ago
                                      </Text>
                                    </Group>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.relatedModifiedPost?.ProfileEntryResponse?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                                ?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.relatedModifiedPost?.ProfileEntryResponse
                                                  ?.ExtraData?.DisplayName ||
                                                  n.relatedModifiedPost?.ProfileEntryResponse
                                                    ?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @
                                              {n.relatedModifiedPost.ProfileEntryResponse
                                                .Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <UnstyledButton
                                        component={Link}
                                        href={`/post/${n.relatedParentPost?.PostHashHex}`}
                                      >
                                        <Group>
                                          <Text fw={500} size="sm" td="">
                                            Commented on
                                          </Text>
                                        </Group>
                                      </UnstyledButton>
                                      <Box maw={321}>
                                        <Text size="sm" truncate="end">
                                          {n.relatedParentPost?.Body || ''}
                                        </Text>
                                      </Box>
                                    </Group>
                                    <Space h="md" />
                                    <Post
                                      post={n.relatedModifiedPost}
                                      username={n.transactorProfile?.Username}
                                      key={n.transactorProfile?.PublicKeyBase58Check}
                                    />
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* Follows */}
                        {n.notification.Metadata.TxnType === 'FOLLOW' && (
                          <>
                            <Notification
                              withCloseButton={false}
                              withBorder
                              icon={<AiOutlineUserAdd size="1.3rem" />}
                              radius="md"
                              title={
                                <>
                                  <Group>
                                    <UnstyledButton
                                      component={Link}
                                      href={`/wave/${n.transactorProfile?.Username}`}
                                    >
                                      <Group style={{ width: '100%', flexGrow: 1 }}>
                                        <Avatar
                                          size="lg"
                                          radius="sm"
                                          src={
                                            n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                            n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                            `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                            null
                                          }
                                        />
                                        <div>
                                          <Box maw={222}>
                                            <Text fw={500} size="sm" truncate="end">
                                              {n.transactorProfile?.ExtraData?.DisplayName ||
                                                n.transactorProfile?.Username ||
                                                'Anon'}
                                            </Text>
                                          </Box>
                                          <Text fw={500} size="xs">
                                            @{n.transactorProfile?.Username || 'Anon'}
                                          </Text>
                                        </div>
                                        <Text fw={500} size="sm" td="">
                                          Followed You!
                                        </Text>
                                      </Group>
                                    </UnstyledButton>
                                  </Group>
                                </>
                              }
                            />
                          </>
                        )}

                        {/* Diamonds */}
                        {n.notification.Metadata.BasicTransferTxindexMetadata &&
                          n.notification.Metadata.BasicTransferTxindexMetadata.DiamondLevel > 0 && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<IconDiamond />}
                                radius="sm"
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.transactorProfile?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <UnstyledButton
                                        component={Link}
                                        href={`/post/${n.relatedParentPost?.PostHashHex}`}
                                      >
                                        <Group>
                                          <Text fw={500} size="sm">
                                            Tipped{' '}
                                            {convertToUSD(
                                              n.notification?.Metadata?.BasicTransferTxindexMetadata
                                                ?.TotalOutputNanos
                                            )}{' '}
                                            to
                                          </Text>

                                          <Box maw={321}>
                                            <Text size="sm" truncate="end">
                                              {n.relatedParentPost?.Body || ''}
                                            </Text>
                                          </Box>
                                        </Group>
                                      </UnstyledButton>
                                    </Group>
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* CC Buys */}
                        {n.notification.Metadata.TxnType === 'CREATOR_COIN' &&
                          n.notification.Metadata.CreatorCoinTxindexMetadata.OperationType ===
                            'buy' && (
                            <>
                              <Notification
                                withCloseButton={false}
                                withBorder
                                icon={<IconCoin />}
                                radius="md"
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.transactorProfile?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>
                                      <Text fw={500} size="sm">
                                        Bought{' '}
                                        {convertToUSD(
                                          n.notification?.Metadata?.BasicTransferTxindexMetadata
                                            ?.TotalOutputNanos
                                        )}{' '}
                                        of your Creator Coin!
                                      </Text>
                                    </Group>
                                  </>
                                }
                              />
                            </>
                          )}

                        {/* Sent DESO */}
                        {n.notification.Metadata.TxnType === 'BASIC_TRANSFER' &&
                          n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                            'BasicTransferOutput' &&
                          n.notification.Metadata.AffectedPublicKeys[0].PublicKeyBase58Check ===
                            currentUser.PublicKeyBase58Check &&
                          n.notification.Metadata.BasicTransferTxindexMetadata.DiamondLevel ===
                            0 && (
                            <>
                              <Notification
                                icon={<GiMoneyStack size="1.3rem" />}
                                withCloseButton={false}
                                withBorder
                                radius="md"
                                title={
                                  <>
                                    <Group>
                                      <UnstyledButton
                                        component={Link}
                                        href={`/wave/${n.transactorProfile?.Username}`}
                                      >
                                        <Group style={{ width: '100%', flexGrow: 1 }}>
                                          <Avatar
                                            size="lg"
                                            radius="sm"
                                            src={
                                              n.transactorProfile?.ExtraData
                                                ?.NFTProfilePictureUrl ||
                                              n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                              `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                              null
                                            }
                                          />
                                          <div>
                                            <Box maw={222}>
                                              <Text fw={500} size="sm" truncate="end">
                                                {n.transactorProfile?.ExtraData?.DisplayName ||
                                                  n.transactorProfile?.Username ||
                                                  'Anon'}
                                              </Text>
                                            </Box>
                                            <Text fw={500} size="xs">
                                              @{n.transactorProfile?.Username || 'Anon'}
                                            </Text>
                                          </div>
                                        </Group>
                                      </UnstyledButton>

                                      <Text fw={500} size="sm">
                                        Sent you{' '}
                                        {convertToUSD(
                                          n.notification?.Metadata?.BasicTransferTxindexMetadata
                                            ?.TotalOutputNanos
                                        )}
                                        !
                                      </Text>
                                    </Group>
                                  </>
                                }
                              />
                            </>
                          )}
                      </>
                    ))}

                    {isLoadingMore ? (
                      <>
                        <Space h="md" />
                        <Center>
                          <Loader />
                        </Center>
                      </>
                    ) : (
                      <>
                        <Space h="md" />
                        <Center>
                          <Button onClick={fetchMoreNotifications}>Load More</Button>
                        </Center>
                      </>
                    )}
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Follows">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Follows */}
                    {n.notification.Metadata.TxnType === 'FOLLOW' && (
                      <>
                        <Notification
                          withCloseButton={false}
                          withBorder
                          icon={<AiOutlineUserAdd size="1.3rem" />}
                          radius="md"
                          title={
                            <>
                              <Group>
                                <UnstyledButton
                                  component={Link}
                                  href={`/wave/${n.transactorProfile?.Username}`}
                                >
                                  <Group style={{ width: '100%', flexGrow: 1 }}>
                                    <Avatar
                                      size="lg"
                                      radius="sm"
                                      src={
                                        n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                        n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                        `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                        null
                                      }
                                    />
                                    <div>
                                      <Box maw={222}>
                                        <Text fw={500} size="sm" truncate="end">
                                          {n.transactorProfile?.ExtraData?.DisplayName ||
                                            n.transactorProfile?.Username ||
                                            'Anon'}
                                        </Text>
                                      </Box>
                                      <Text fw={500} size="xs">
                                        @{n.transactorProfile?.Username || 'Anon'}
                                      </Text>
                                    </div>
                                    <Text fw={500} size="sm" td="">
                                      Followed You!
                                    </Text>
                                  </Group>
                                </UnstyledButton>
                              </Group>
                            </>
                          }
                        />
                      </>
                    )}
                  </>
                ))}

                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Mentions">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Mentions */}
                    {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                      n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                        'MentionedPublicKeyBase58Check' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            radius="md"
                            icon={<IconAt />}
                            title={
                              <>
                                <Group justify="right">
                                  <Text c="dimmed" size="xs" fw={500}>
                                    {formatDate(n.relatedModifiedPost?.TimestampNanos)} ago
                                  </Text>
                                </Group>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>
                                  <Text fw={500} size="sm">
                                    Mentioned you
                                  </Text>
                                </Group>
                                <Post
                                  post={n.relatedModifiedPost}
                                  username={n.transactorProfile?.Username}
                                  key={n.transactorProfile?.PublicKeyBase58Check}
                                />
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}

                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Reactions">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Liked Post */}
                    {(n.notification.Metadata.TxnType === 'CREATE_POST_ASSOCIATION' &&
                      n.notification.Metadata.CreatePostAssociationTxindexMetadata
                        .AssociationValue === 'LIKE') ||
                      (n.notification.Metadata.TxnType === 'LIKE' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<IconThumbUp size="1.3rem" />}
                            radius="md"
                            title={
                              <>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <UnstyledButton
                                    component={Link}
                                    href={`/post/${
                                      n.notification.Metadata?.CreatePostAssociationTxindexMetadata
                                        ?.PostHashHex ||
                                      n.notification.Metadata?.LikeTxindexMetadata.PostHashHex
                                    }`}
                                  >
                                    <Group>
                                      <Text fw={500} size="sm" td="">
                                        Liked
                                      </Text>

                                      <Box maw={321}>
                                        <Text size="sm" truncate="end">
                                          {n.reactedPost?.Body || 'your post'}
                                        </Text>
                                      </Box>
                                    </Group>
                                  </UnstyledButton>
                                </Group>
                              </>
                            }
                          />
                        </>
                      ))}
                    {/* Loved Post */}
                    {n.notification.Metadata.TxnType === 'CREATE_POST_ASSOCIATION' &&
                      n.notification.Metadata?.CreatePostAssociationTxindexMetadata
                        .AssociationValue === 'LOVE' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<IconHeartFilled size="1.3rem" />}
                            radius="md"
                            title={
                              <>
                                <Group>
                                  <UnstyledButton>
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <UnstyledButton
                                    component={Link}
                                    href={`/post/${n.notification.Metadata?.CreatePostAssociationTxindexMetadata?.PostHashHex}`}
                                  >
                                    <Group>
                                      <Text fw={500} size="sm" td="">
                                        Loved
                                      </Text>

                                      <Box maw={321}>
                                        <Text size="sm" truncate="end">
                                          {n.reactedPost?.Body || 'your post!'}
                                        </Text>
                                      </Box>
                                    </Group>
                                  </UnstyledButton>
                                </Group>
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}
                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Comments">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Comments */}
                    {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                      n.notification.Metadata.AffectedPublicKeys.length >= 2 &&
                      n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                        'ParentPosterPublicKeyBase58Check' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<FaRegCommentDots size="1.3rem" />}
                            radius="md"
                            title={
                              <>
                                <Group justify="right">
                                  <Text c="dimmed" size="xs" fw={500}>
                                    {formatDate(n.relatedModifiedPost?.TimestampNanos)} ago
                                  </Text>
                                </Group>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.relatedModifiedPost?.ProfileEntryResponse?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                            ?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                              ?.DisplayName ||
                                              n.relatedModifiedPost?.ProfileEntryResponse
                                                ?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @
                                          {n.relatedModifiedPost.ProfileEntryResponse.Username ||
                                            'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <UnstyledButton
                                    component={Link}
                                    href={`/post/${n.relatedParentPost?.PostHashHex}`}
                                  >
                                    <Group>
                                      <Text fw={500} size="sm" td="">
                                        Commented on
                                      </Text>
                                    </Group>
                                  </UnstyledButton>
                                  <Box maw={321}>
                                    <Text size="sm" truncate="end">
                                      {n.relatedParentPost?.Body || ''}
                                    </Text>
                                  </Box>
                                </Group>
                                <Space h="md" />
                                <Post
                                  post={n.relatedModifiedPost}
                                  username={n.transactorProfile?.Username}
                                  key={n.transactorProfile?.PublicKeyBase58Check}
                                />
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}
                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Diamonds">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Diamonds */}
                    {n.notification.Metadata.BasicTransferTxindexMetadata &&
                      n.notification.Metadata.BasicTransferTxindexMetadata.DiamondLevel > 0 && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<IconDiamond />}
                            radius="sm"
                            title={
                              <>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group>
                                      <Text fw={500} size="sm">
                                        Tipped{' '}
                                        {convertToUSD(
                                          n.notification?.Metadata?.BasicTransferTxindexMetadata
                                            ?.TotalOutputNanos
                                        )}{' '}
                                        to
                                      </Text>

                                      <Box maw={321}>
                                        <Text size="sm" truncate="end">
                                          {n.relatedParentPost?.Body || ''}
                                        </Text>
                                      </Box>
                                    </Group>
                                  </UnstyledButton>
                                </Group>
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}
                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Reposts">
              <>
                {notifications.map((n) => (
                  <>
                    {/* Reposts & Quotes */}
                    {n.notification.Metadata.TxnType === 'SUBMIT_POST' &&
                      n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                        'RepostedPublicKeyBase58Check' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<IconRecycle size="1.3rem" />}
                            radius="md"
                            title={
                              <>
                                <Group justify="right">
                                  <Text c="dimmed" size="xs" fw={500}>
                                    {formatDate(n.relatedModifiedPost?.TimestampNanos)} ago
                                  </Text>
                                </Group>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.relatedModifiedPost?.ProfileEntryResponse?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                            ?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.relatedModifiedPost?.ProfileEntryResponse?.ExtraData
                                              ?.DisplayName ||
                                              n.relatedModifiedPost?.ProfileEntryResponse
                                                ?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @
                                          {n.relatedModifiedPost.ProfileEntryResponse.Username ||
                                            'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <UnstyledButton
                                    component={Link}
                                    href={`/post/${n.notification.Metadata.SubmitPostTxindexMetadata.PostHashBeingModifiedHex}`}
                                  >
                                    <Text fw={500} size="sm" td="">
                                      Reposted
                                    </Text>
                                  </UnstyledButton>
                                </Group>
                                <Space h="md" />
                                <Post
                                  post={n.relatedModifiedPost}
                                  username={n.transactorProfile?.Username}
                                  key={n.transactorProfile?.PublicKeyBase58Check}
                                />
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}

                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="CC">
              <>
                {notifications.map((n) => (
                  <>
                    {n.notification.Metadata.TxnType === 'CREATOR_COIN' &&
                      n.notification.Metadata.CreatorCoinTxindexMetadata.OperationType ===
                        'buy' && (
                        <>
                          <Notification
                            withCloseButton={false}
                            withBorder
                            icon={<IconCoin />}
                            radius="md"
                            title={
                              <>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>
                                  <Text fw={500} size="sm">
                                    Bought{' '}
                                    {convertToUSD(
                                      n.notification?.Metadata?.BasicTransferTxindexMetadata
                                        ?.TotalOutputNanos
                                    )}{' '}
                                    of your Creator Coin!
                                  </Text>
                                </Group>
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}

                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
            <Tabs.Panel value="Sent">
              <>
                {notifications.map((n) => (
                  <>
                    {n.notification.Metadata.TxnType === 'BASIC_TRANSFER' &&
                      n.notification.Metadata.AffectedPublicKeys[0].Metadata ===
                        'BasicTransferOutput' &&
                      n.notification.Metadata.AffectedPublicKeys[0].PublicKeyBase58Check ===
                        currentUser.PublicKeyBase58Check &&
                      n.notification.Metadata.BasicTransferTxindexMetadata.DiamondLevel === 0 && (
                        <>
                          <Notification
                            icon={<GiMoneyStack size="1.3rem" />}
                            withCloseButton={false}
                            withBorder
                            radius="md"
                            title={
                              <>
                                <Group>
                                  <UnstyledButton
                                    component={Link}
                                    href={`/wave/${n.transactorProfile?.Username}`}
                                  >
                                    <Group style={{ width: '100%', flexGrow: 1 }}>
                                      <Avatar
                                        size="lg"
                                        radius="sm"
                                        src={
                                          n.transactorProfile?.ExtraData?.NFTProfilePictureUrl ||
                                          n.transactorProfile?.ExtraData?.LargeProfilePicURL ||
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${n.notification.Metadata.TransactorPublicKeyBase58Check}` ||
                                          null
                                        }
                                      />
                                      <div>
                                        <Box maw={222}>
                                          <Text fw={500} size="sm" truncate="end">
                                            {n.transactorProfile?.ExtraData?.DisplayName ||
                                              n.transactorProfile?.Username ||
                                              'Anon'}
                                          </Text>
                                        </Box>
                                        <Text fw={500} size="xs">
                                          @{n.transactorProfile?.Username || 'Anon'}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>

                                  <Text fw={500} size="sm">
                                    Sent you{' '}
                                    {convertToUSD(
                                      n.notification?.Metadata?.BasicTransferTxindexMetadata
                                        ?.TotalOutputNanos
                                    )}
                                    !
                                  </Text>
                                </Group>
                              </>
                            }
                          />
                        </>
                      )}
                  </>
                ))}

                {isLoadingMore ? (
                  <>
                    <Space h="md" />
                    <Center>
                      <Loader />
                    </Center>
                  </>
                ) : (
                  <>
                    <Space h="md" />
                    <Center>
                      <Button onClick={fetchMoreNotifications}>Load More</Button>
                    </Center>
                  </>
                )}
              </>
            </Tabs.Panel>
          </Tabs>
        </Container>
      )}
      <Space h={222} />
    </div>
  );
}
