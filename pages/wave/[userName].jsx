import { useEffect, useState, useContext, useRef } from 'react';
import Link from 'next/link';
import { Player } from '@livepeer/react';
import { IconScreenShare, IconCheck, IconHeartHandshake, IconX } from '@tabler/icons-react';
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSingleProfile,
  updateFollowingStatus,
  getIsFollowing,
  identity,
  getSinglePost,
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
import { TbPinned, TbPinnedOff } from 'react-icons/tb';

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
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [openedChat, { toggle }] = useDisclosure(true);
  const [livestreamPost, setLivestreamPost] = useState(null);
  const [isLoadingLivestream, setIsLoadingLivestream] = useState(false);
  const [pinnedPost, setPinnedPost] = useState();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState();

  const embed = useRef();

  const handleReady = (e) => {
    embed.current = e;
  };

  const extractPlaybackId = (url) => {
    const match = url.match(/https:\/\/lvpr\.tv\/\?v=(.*)/);
    const playbackId = match ? match[1] : null;
    return playbackId;
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

  // Function to Follow userName
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

  // Function to Unfollow userName
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

  // Getting userName's most recent Wave livestream
  const fetchLivestreamPost = async () => {
    try {
      setIsLoadingLivestream(true);

      const postData = await getPostsForUser({
        Username: profile?.Username,
        NumToFetch: 20,
      });

      const livestreamPost = postData.Posts.find(
        (post) => post.PostExtraData?.WavesStreamTitle && livestreamPost?.VideoURLs[0]
      );

      setLivestreamPost(livestreamPost);

      setIsLoadingLivestream(false);
    } catch (error) {
      console.error('Error fetching livestream post:', error);
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

  useEffect(() => {
    if (userName) {
      fetchProfile();
    }
  }, [userName]);

  useEffect(() => {
    if (profile) {
      fetchNFTs(25);
      fetchFollowerInfo();
      fetchPosts();
      fetchLivestreamPost();
    }
    if (profile?.ExtraData?.PinnedPostHashHex) {
      fetchPinnedPost();
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.PublicKeyBase58Check && currentUser?.PublicKeyBase58Check) {
      getIsFollowingData();
    }
  }, [currentUser?.PublicKeyBase58Check, profile?.PublicKeyBase58Check]);

  return (
    <>
      {profile ? (
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
            <Card.Section>
              {livestreamPost ? (
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
                    playbackId={extractPlaybackId(livestreamPost?.VideoURLs[0])}
                    title={livestreamPost.ExtraData?.WavesStreamTitle}
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

            <Space h="md" />

            <Paper shadow="xl" radius="md" p="xl">
              <Group>
                <CopyButton value={`https://desowaves.vercel.app/wave/${userName}`} timeout={2000}>
                  {({ copied, copy }) => (
                    <>
                      <Tooltip label={copied ? 'Wave Copied' : `Share ${userName}'s Wave`}>
                        <Button
                          radius="sm"
                          size="sm"
                          color={copied ? 'teal' : 'blue'}
                          onClick={copy}
                        >
                          {copied ? (
                            <>
                              <IconCheck size={16} />
                            </>
                          ) : (
                            <>
                              <IconScreenShare size={16} />
                            </>
                          )}
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </CopyButton>

                <SubscriptionModal
                  publickey={profile.PublicKeyBase58Check}
                  username={profile?.Username}
                />
              </Group>
              <Space h="sm" />
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
            </Paper>

            <Space h="sm" />

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
            <Space h="md" />
            {currentUser ? (
              isFollowingUser ? (
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
                    <ActionIcon variant="filled" color="indigo" size={36} onClick={unfollowUser}>
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

          <Space h="sm" />
          <Center>
            <Button variant="light" hiddenFrom="md" onClick={toggle}>
              {openedChat ? <>Close Chat</> : <>Open Chat</>}
            </Button>
          </Center>
          <Group justify="center" hiddenFrom="md">
            <Collapse transitionDuration={1000} transitionTimingFunction="smooth" in={openedChat}>
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
            </Tabs.List>

            <Tabs.Panel value="first">
              {pinnedPost && (
                <>
                  <Paper shadow="xl" radius="md">
                    <ThemeIcon variant="light" radius="xs" size="md" color="red">
                      <TbPinned />
                    </ThemeIcon>

                    <Post post={pinnedPost} username={profile.Username} />
                  </Paper>
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
                  {posts.map((post) => (
                    <Post post={post} username={profile?.Username} key={post.PostHashHex} />
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
                    <Post
                      post={nft.PostEntryResponse}
                      username={nft.PostEntryResponse.ProfileEntryResponse.Username}
                      key={nft.PostEntryResponse.PostHashHex}
                    />
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
                </>
              )}
            </Tabs.Panel>
          </Tabs>
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
