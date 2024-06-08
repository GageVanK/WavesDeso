import { useEffect, useState, useContext, useRef } from 'react';
import Link from 'next/link';
import { Player } from '@livepeer/react';
import {
  IconScreenShare,
  IconCheck,
  IconX,
  IconRocket,
  IconUserPlus,
  IconUserMinus,
  IconDotsVertical,
} from '@tabler/icons-react';
import { doc, getDoc } from 'firebase/firestore';
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSingleProfile,
  updateFollowingStatus,
  getIsFollowing,
  identity,
  getSinglePost,
  submitPost,
  createUserAssociation,
  deleteUserAssociation,
  getUserAssociations,
  getPostAssociations,
} from 'deso-protocol';
import {
  Menu,
  Container,
  ThemeIcon,
  CopyButton,
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
  rem,
  RingProgress,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { Chat } from '@/components/Chat';
import classes from './wave.module.css';
import Post from '@/components/Post';
import { replaceURLs } from '../../helpers/linkHelper';
import { SubscriptionModal } from '../../components/SubscriptionModal';
import { extractTwitchUsername } from '@/helpers/linkHelper';
import { TwitchEmbed } from 'react-twitch-embed';
import { TbPinned } from 'react-icons/tb';
import { db } from '../../firebase-config';
import { FaUsers, FaUsersSlash } from 'react-icons/fa';
import { GoBlocked } from 'react-icons/go';

export default function Wave() {
  const router = useRouter();
  const { userName } = router.query;
  const [posts, setPosts] = useState([]);
  const [NFTs, setNFTs] = useState([]);
  const [profile, setProfile] = useState();
  const [followerInfo, setFollowers] = useState({ followers: 0, following: 0 });
  const { currentUser } = useContext(DeSoIdentityContext);
  const [isFollowingUser, setisFollowingUser] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [openedChat, { toggle }] = useDisclosure(true);
  const [pinnedPost, setPinnedPost] = useState();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingVODs, setIsLoadingVODs] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState();
  const [streamPlaybackId, setStreamPlaybackId] = useState();
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [didCloseFriendId, setCloseFriendId] = useState();
  const [VODs, setVODs] = useState();
  const [blockId, setBlockId] = useState(null);
  const embed = useRef();

  // For Twitch Embed
  const handleReady = (e) => {
    embed.current = e;
  };

  // Get Profile
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
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Get Stream
  const fetchStream = async () => {
    try {
      const docRef = doc(db, 'streams', profile?.Username);
      const streamData = await getDoc(docRef);

      if (streamData.data()) {
        setStreamPlaybackId(streamData.data().playbackId);
      } else {
        setStreamPlaybackId(undefined);
      }
    } catch (error) {
      console.error('Error fetching user stream:', error);
    } finally {
      setIsLoadingStream(false);
    }
  };

  // Get Follow Counts
  const fetchFollowerInfo = async () => {
    try {
      const following = await getFollowersForUser({
        Username: profile?.Username,
      });
      const followers = await getFollowersForUser({
        Username: profile?.Username,
        GetEntriesFollowingUsername: true,
      });

      setFollowers({ following, followers });
    } catch (error) {
      console.error('Error fetching follower information:', error);
    }
  };

  // Get For Sale NFTs
  const fetchNFTs = async (limit) => {
    try {
      setIsLoadingNFTs(true);
      const nftData = await getNFTsForUser({
        UserPublicKeyBase58Check: profile.PublicKeyBase58Check,
        IsForSale: true,
      });

      const nftKeys = Object.keys(nftData.NFTsMap);
      const limitedNFTKeys = nftKeys.slice(0, limit);

      const limitedNFTs = limitedNFTKeys.reduce((result, key) => {
        result[key] = nftData.NFTsMap[key];
        return result;
      }, {});

      setNFTs(limitedNFTs);
      setIsLoadingNFTs(false);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
    }
  };

  // Get Posts
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const postData = await getPostsForUser({
        Username: profile?.Username,
        NumToFetch: 25,
      });
      setPosts(postData.Posts);
      setLastSeenPostHash(postData.Posts[postData.Posts.length - 1].PostHashHex);
      setIsLoadingPosts(false);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // Load More Posts
  const fetchMorePosts = async () => {
    try {
      setIsLoadingMore(true);
      const morePostsData = await getPostsForUser({
        Username: profile?.Username,
        NumToFetch: 25,
        LastPostHashHex: lastSeenPostHash,
      });
      if (morePostsData.Posts.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...morePostsData.Posts]);
        setLastSeenPostHash(morePostsData.Posts[morePostsData.Posts.length - 1].PostHashHex);
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.error('Error fetching more hotFeed:', error);
      setIsLoadingMore(false);
    }
  };

  // Get if Current User follows profile
  const getIsFollowingData = async () => {
    try {
      const req = {
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: profile?.PublicKeyBase58Check,
      };

      const result = await getIsFollowing(req);
      setisFollowingUser(result.IsFollowing);
    } catch (error) {
      console.error('Error checking if following:', error);
    }
  };

  // Function to Follow user
  const followUser = async () => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: false,
        FollowedPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });
      getIsFollowingData();
      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: `You successfully followed ${profile?.Username}`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
    }
  };

  // Function to Unfollow user
  const unfollowUser = async () => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: true,
        FollowedPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });
      getIsFollowingData();
      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'red',
        message: `You successfully unfollowed ${userName}`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
    }
  };

  // Getting Pinned Post
  const fetchPinnedPost = async () => {
    try {
      const postData = await getSinglePost({
        PostHashHex: profile?.ExtraData?.PinnedPostHashHex,
      });
      setPinnedPost(postData.PostFound);
    } catch (error) {
      console.error('Error fetching livestream post:', error);
    }
  };

  // Promote Stream to DeSo
  const postStreamToDeso = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: `Come Watch ${`${profile?.Username}'s Wave`}\nvisit: \nhttps://desowaves.vercel.app/wave/${
            profile?.Username
          }`,
          VideoURLs: [`https://lvpr.tv/?v=${streamPlaybackId}`],
          ImageURLs: [],
        },
        PostExtraData: {
          WavesStreamTitle: profile.ExtraData?.WavesStreamTitle || `${profile?.Username}'s Wave`,
        },
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: `You Promoted ${profile?.Username}'s Wave`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      console.log('something happened: ' + error);
    }
  };

  // Getting if is close friend & getting association if so user has option to delete the association
  const getDidCloseFriend = async () => {
    try {
      const didCF = await getUserAssociations({
        TargetUserPublicKeyBase58Check: profile.PublicKeyBase58Check,
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
      });

      setCloseFriendId(didCF.Associations[0]?.AssociationID);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser && profile) {
      getDidCloseFriend();
    }
  }, [currentUser, isCloseFriend, profile]);

  // Add Close Friend
  const handleAddCloseFriend = async () => {
    try {
      await createUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconUserPlus size="1.1rem" />,
        color: 'blue',
        message: `${profile.Username} added to Close Friends!`,
      });
      setIsCloseFriend(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      setIsCloseFriend(false);

      console.error('Error submitting heart:', error);
    }
  };

  // Remove Close Friend
  const handleRemoveCloseFriend = async () => {
    try {
      await deleteUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: profile.PublicKeyBase58Check,
        AssociationID: didCloseFriendId,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconUserMinus size="1.1rem" />,
        color: 'blue',
        message: 'Close Friend Removed!',
      });

      setIsCloseFriend(false);
      setCloseFriendId(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      setIsCloseFriend(true);
      console.error('Error submitting heart:', error);
    }
  };

  // Get Public VODs for user
  const getVODs = async () => {
    try {
      setIsLoadingVODs(true);
      const res = await getPostAssociations({
        TransactorPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        AssociationType: 'Wave VOD',
        AssociationValue: `${profile?.Username}'s VOD`,
      });

      const newVODs = [];

      for (const association of res.Associations) {
        const postHash = association.PostHashHex;
        const response = await getSinglePost({ PostHashHex: postHash });

        newVODs.push(response.PostFound);
      }

      setVODs(newVODs);
      setIsLoadingVODs(false);
    } catch (error) {
      console.error('Error getting VODs:', error);
      setIsLoadingVODs(false);
    }
  };

  // Checking if user is Blocked
  const getDidBlock = async () => {
    try {
      const didBlock = await getUserAssociations({
        TargetUserPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'BLOCK',
        AssociationValue: 'BLOCK',
      });

      setBlockId(didBlock.Associations[0]?.AssociationID);
    } catch (error) {
      console.error(error);
    }
  };

  // Block user
  const handleBlock = async () => {
    try {
      await createUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: profile?.PublicKeyBase58Check,
        AssociationType: 'BLOCK',
        AssociationValue: 'BLOCK',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <GoBlocked size="1.1rem" />,
        color: 'blue',
        message: `You Blocked ${profile?.Username}!`,
      });
      getDidBlock();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      console.error('Error submitting heart:', error);
    }
  };

  // Unblock User
  const handleUnblock = async () => {
    try {
      await deleteUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        PostHashHex: profile?.PublicKeyBase58Check,
        AssociationID: blockId,
        AssociationType: 'BLOCK',
        AssociationValue: 'BLOCK',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Unblocked User',
      });

      setBlockId(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      console.error('Error submitting heart:', error);
    }
  };

  useEffect(() => {
    if (currentUser && profile?.PublicKeyBase58Check) {
      getDidBlock();
    }
  }, [currentUser, profile, profile?.PublicKeyBase58Check]);

  // Fetch profile for username
  useEffect(() => {
    if (userName) {
      fetchProfile();
    }
  }, [userName]);

  // If the profile exists, fetch the data for the profile
  useEffect(() => {
    if (profile) {
      fetchNFTs(25);
      fetchFollowerInfo();
      fetchPosts();
      fetchStream();
      getVODs();
    }
  }, [profile, profile?.PublicKeyBase58Check]);

  // Get if Current User follows profile
  useEffect(() => {
    if (profile?.PublicKeyBase58Check && currentUser?.PublicKeyBase58Check) {
      getIsFollowingData();
    }
  }, [currentUser?.PublicKeyBase58Check, profile?.PublicKeyBase58Check]);

  useEffect(() => {
    setPinnedPost(null);
    if (profile?.ExtraData?.PinnedPostHashHex) {
      fetchPinnedPost();
    }
  }, [profile, profile?.Username, profile?.ExtraData?.PinnedPostHashHex]);

  return (
    <>
      {isLoadingProfile ? (
        <>
          <Space h="md" />
          <Center>
            <Loader />
          </Center>
        </>
      ) : profile ? (
        <>
          <Card ml={17} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={profile?.ExtraData?.FeaturedImageURL || null}
                fallbackSrc="https://images.deso.org/4903a46ab3761c5d8bd57416ff411ff98b24b35fcf5480dde039eb9bae6eebe0.webp"
                height={321}
              />
            </Card.Section>

            <Group>
              <>
                <Avatar
                  src={
                    profile?.ExtraData?.LargeProfilePicURL ||
                    `https://node.deso.org/api/v0/get-single-profile-picture/${profile?.PublicKeyBase58Check}` ||
                    null
                  }
                  alt="Profile Picture"
                  className={classes.avatar}
                  size={123}
                  radius="md"
                  mt={-55}
                />
              </>
              <div>
                {profile !== null ? (
                  <>
                    <Text className={classes.Avatar} fw={500}>
                      {profile?.ExtraData?.DisplayName || profile?.Username}
                    </Text>
                    <Text size="xs" className={classes.Avatar}>
                      @{profile?.Username}
                    </Text>
                  </>
                ) : (
                  <Text fz="lg" fw={777} truncate="end">
                    User does not exist
                  </Text>
                )}
              </div>
            </Group>

            <Space h="md" />
            {!blockId && (
              <>
                <Card.Section>
                  {isLoadingStream ? (
                    <>
                      <Space h="md" />
                      <Center>
                        <Loader variant="dots" />
                      </Center>
                    </>
                  ) : streamPlaybackId ? (
                    <>
                      <Player
                        priority
                        controls
                        showPipButton
                        theme={{
                          colors: {
                            loading: '#3cdfff',
                          },
                        }}
                        playbackId={streamPlaybackId}
                        title={profile.ExtraData?.WavesStreamTitle || `${profile?.Username}'s Wave`}
                      />
                    </>
                  ) : (
                    <>
                      {profile.ExtraData?.TwitchURL ? (
                        <Group grow>
                          <TwitchEmbed
                            channel={extractTwitchUsername(profile.ExtraData?.TwitchURL)}
                            withChat
                            darkMode={true}
                            onVideoReady={handleReady}
                          />
                        </Group>
                      ) : (
                        <Divider
                          my="xs"
                          label={
                            <>
                              <Paper radius="sm" p="md" withBorder>
                                <Text c="dimmed" fw={500} fs="md">
                                  Not live right now.
                                </Text>
                              </Paper>
                            </>
                          }
                          labelPosition="center"
                        />
                      )}
                    </>
                  )}
                </Card.Section>
                <Space h="md" />
                <Group justify="space-between">
                  <Group>
                    <ActionIcon.Group>
                      <CopyButton
                        value={`https://desowaves.vercel.app/wave/${userName}`}
                        timeout={2000}
                      >
                        {({ copied, copy }) => (
                          <>
                            <Tooltip label={copied ? 'Copied' : `Copy Wave Link`}>
                              <ActionIcon
                                variant="default"
                                size="xl"
                                aria-label="Share Button"
                                onClick={copy}
                              >
                                {copied ? (
                                  <>
                                    <IconCheck style={{ width: rem(20) }} stroke={1.5} />
                                  </>
                                ) : (
                                  <>
                                    <IconScreenShare style={{ width: rem(20) }} stroke={1.5} />
                                  </>
                                )}
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}
                      </CopyButton>
                      {currentUser && (
                        <Tooltip label={`Promote ${profile?.Username}'s Wave Onchain`}>
                          <ActionIcon
                            onClick={postStreamToDeso}
                            variant="default"
                            size="xl"
                            aria-label="Launch"
                          >
                            <IconRocket style={{ width: rem(20) }} stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {currentUser &&
                        currentUser?.PublicKeyBase58Check !== profile.PublicKeyBase58Check &&
                        (isCloseFriend || didCloseFriendId ? (
                          <Tooltip label={`Remove ${profile?.Username}'s as Close Friend`}>
                            <ActionIcon
                              variant="default"
                              size="xl"
                              aria-label="Remove Close Friend"
                              onClick={() => handleRemoveCloseFriend()}
                            >
                              <FaUsersSlash style={{ width: rem(20) }} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip label={`Add ${profile?.Username}'s as Close Friend`}>
                            <ActionIcon
                              variant="default"
                              size="xl"
                              aria-label="Add Close Friend"
                              onClick={() => handleAddCloseFriend()}
                            >
                              <FaUsers style={{ width: rem(20) }} stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        ))}
                      {currentUser &&
                        currentUser?.PublicKeyBase58Check !== profile.PublicKeyBase58Check && (
                          <>
                            <Menu shadow="md" width={177}>
                              <Menu.Target>
                                <Tooltip label={`More`}>
                                  <ActionIcon
                                    variant="default"
                                    size="xl"
                                    aria-label="Add Close Friend"
                                  >
                                    <IconDotsVertical style={{ width: rem(20) }} stroke={1.5} />
                                  </ActionIcon>
                                </Tooltip>
                              </Menu.Target>

                              <Menu.Dropdown>
                                <Menu.Item
                                  color="red"
                                  onClick={handleBlock}
                                  leftSection={
                                    <GoBlocked style={{ width: rem(16), height: rem(16) }} />
                                  }
                                >
                                  Block
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </>
                        )}
                    </ActionIcon.Group>
                    <Text fw={555} size="xl">
                      {profile.ExtraData?.WavesStreamTitle || `${profile?.Username}'s Wave`}
                    </Text>
                  </Group>

                  <SubscriptionModal
                    publickey={profile.PublicKeyBase58Check}
                    username={profile?.Username}
                  />
                </Group>

                <Space h={55} />

                <Text
                  fz="sm"
                  style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'wrap',
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      profile && profile.Description
                        ? replaceURLs(profile.Description.replace(/\n/g, '<br>'))
                        : '',
                  }}
                />

                <Space h="md" />
                {profile.ExtraData?.FollowerGoal && (
                  <>
                    {profile.ExtraData?.FollowerGoal ===
                    JSON.stringify(followerInfo.followers?.NumFollowers) ? (
                      <>
                        <Text size="xs" ta="center">
                          Follower Goal Reached!
                        </Text>
                        <Center>
                          <RingProgress
                            sections={[
                              {
                                value: 100,
                                color: 'teal',
                                tooltip: `${profile.ExtraData?.FollowerGoal} Followers`,
                              },
                            ]}
                            size={144}
                            label={
                              <Center>
                                <ActionIcon color="teal" variant="light" radius="xl" size="xl">
                                  <IconCheck style={{ width: rem(22), height: rem(22) }} />
                                </ActionIcon>
                              </Center>
                            }
                          />
                        </Center>
                      </>
                    ) : (
                      <>
                        <Text size="xs" ta="center">
                          Follower Goal: {profile.ExtraData?.FollowerGoal}
                        </Text>
                        <Center>
                          <RingProgress
                            size={144}
                            roundCaps
                            label={
                              <Text size="sm" ta="center">
                                {(
                                  (followerInfo.followers?.NumFollowers /
                                    profile.ExtraData?.FollowerGoal) *
                                  100
                                ).toFixed(0)}
                                %
                              </Text>
                            }
                            sections={[
                              {
                                value:
                                  (followerInfo.followers?.NumFollowers /
                                    profile.ExtraData?.FollowerGoal) *
                                  100,
                                color: 'cyan',
                                tooltip: `${followerInfo.followers?.NumFollowers} Followers`,
                              },
                            ]}
                          />
                        </Center>
                      </>
                    )}
                  </>
                )}
                <Center>
                  {followerInfo.followers && followerInfo.followers.NumFollowers ? (
                    <Text fz="sm">Followers: {followerInfo.followers.NumFollowers}</Text>
                  ) : (
                    <Text fz="sm">Followers: 0</Text>
                  )}

                  <Space w="sm" />
                  <Divider size="sm" orientation="vertical" />
                  <Space w="sm" />
                  {followerInfo.following && followerInfo.following.NumFollowers ? (
                    <Text fz="sm">Following: {followerInfo.following.NumFollowers}</Text>
                  ) : (
                    <Text fz="sm">Following: 0</Text>
                  )}
                </Center>
                <Space h="md" />
              </>
            )}
            <Space h="md" />
            {currentUser ? (
              blockId ? (
                <Button
                  fullWidth
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'indigo' }}
                  radius="md"
                  onClick={handleUnblock}
                >
                  Unblock
                </Button>
              ) : isFollowingUser ? (
                <Group wrap="nowrap" gap={1}>
                  <Button
                    fullWidth
                    variant="gradient"
                    gradient={{ from: 'cyan', to: 'indigo' }}
                    className={classes.button}
                  >
                    Following
                  </Button>
                  <Tooltip label="Unfollow User" withArrow arrowPosition="center">
                    <ActionIcon color="indigo" size={36} onClick={unfollowUser}>
                      <RiUserUnfollowLine size="1rem" stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ) : (
                <Button
                  fullWidth
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'indigo' }}
                  radius="md"
                  onClick={followUser}
                >
                  Follow
                </Button>
              )
            ) : (
              <Button
                fullWidth
                variant="gradient"
                gradient={{ from: 'cyan', to: 'indigo' }}
                radius="md"
                onClick={() => identity.login()}
              >
                Sign In to Follow
              </Button>
            )}
          </Card>
          {!blockId && (
            <>
              <Space h="sm" />
              <Center>
                <Button variant="light" hiddenFrom="md" onClick={toggle}>
                  {openedChat ? <>Close Chat</> : <>Open Chat</>}
                </Button>
              </Center>
              <Group justify="center" hiddenFrom="md">
                <Collapse
                  transitionDuration={1000}
                  transitionTimingFunction="smooth"
                  in={openedChat}
                >
                  <Chat handle={profile?.Username || 'Anon'} />
                </Collapse>
              </Group>

              <Space h="xl" />

              <Tabs variant="default" defaultValue="first">
                <Tabs.List grow>
                  <Tabs.Tab value="first">
                    <Text fz="sm">Posts</Text>
                  </Tabs.Tab>

                  <Tabs.Tab value="second">
                    <Text fz="sm">NFTs</Text>
                  </Tabs.Tab>

                  <Tabs.Tab value="third">
                    <Text fz="sm">VODs</Text>
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="first">
                  {pinnedPost && (
                    <>
                      <Container size={777} px={0}>
                        <Paper shadow="xl" radius="md">
                          <ThemeIcon variant="light" radius="xs" size="md" color="red">
                            <TbPinned />
                          </ThemeIcon>

                          <Post post={pinnedPost} username={profile.Username} />
                        </Paper>
                      </Container>
                    </>
                  )}
                  {isLoadingPosts ? (
                    <>
                      <Space h="md" />
                      <Center>
                        <Loader variant="bars" />
                      </Center>
                    </>
                  ) : posts && posts.length > 0 ? (
                    <>
                      {posts.map((post, index) => (
                        <Container size={777} px={0} key={index}>
                          <Post post={post} username={profile?.Username} />
                        </Container>
                      ))}

                      {isLoadingMore ? (
                        <>
                          <Space h="md" />
                          <Group justify="center">
                            <Loader />
                          </Group>
                        </>
                      ) : (
                        <Center>
                          <Button onClick={fetchMorePosts}>Load More</Button>
                        </Center>
                      )}

                      <Space h={222} />
                    </>
                  ) : (
                    // If no NFTs, show the Badge
                    <>
                      <Space h="md" />
                      <Center>
                        <Badge
                          size="md"
                          radius="sm"
                          variant="gradient"
                          gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                        >
                          Post something to view them here!
                        </Badge>
                      </Center>
                    </>
                  )}

                  <Space h={222} />
                </Tabs.Panel>

                <Tabs.Panel value="third">
                  {isLoadingVODs ? (
                    <>
                      <Space h="md" />
                      <Center>
                        <Loader variant="bars" />
                      </Center>
                    </>
                  ) : // After loading, check if there are VODs to display
                  VODs && VODs.length > 0 ? (
                    VODs.map((vod, index) => {
                      return (
                        <>
                          <Container size={777} px={0} key={index}>
                            <Post post={vod} username={profile?.Username} />
                          </Container>
                          <Space h="xs" />
                        </>
                      );
                    })
                  ) : (
                    // If no VODs, show the Badge
                    <>
                      <Space h="md" />

                      <p>No VODs yet.</p>

                      <Space h={222} />
                    </>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="second">
                  {isLoadingNFTs ? (
                    <>
                      <Space h="md" />
                      <Center>
                        <Loader variant="bars" />
                      </Center>
                    </>
                  ) : // After loading, check if there are NFTs to display
                  NFTs && Object.keys(NFTs).length > 0 ? (
                    Object.keys(NFTs).map((key, index) => {
                      const nft = NFTs[key];
                      return (
                        <div key={index}>
                          <Post
                            post={nft.PostEntryResponse}
                            username={nft.PostEntryResponse.ProfileEntryResponse.Username}
                          />
                        </div>
                      );
                    })
                  ) : (
                    // If no NFTs, show the Badge
                    <>
                      <Space h="md" />
                      <Center>
                        <Badge
                          size="md"
                          radius="sm"
                          variant="gradient"
                          gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                        >
                          Mint something to view them here!
                        </Badge>
                      </Center>

                      <Space h={222} />
                    </>
                  )}
                </Tabs.Panel>
              </Tabs>
            </>
          )}
        </>
      ) : (
        <Container>
          <Paper shadow="xl" radius="md" p="md" withBorder>
            <Group justify="center">
              <Text fw={500} size="md">
                User Does Not Exist!
              </Text>
            </Group>
            <Space h="md" />
            <Group justify="center">
              <Button component={Link} href="/" radius="md">
                Go Home
              </Button>
            </Group>
          </Paper>
        </Container>
      )}

      <Modal opened={opened} onClose={close} size="auto" centered>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>
    </>
  );
}
