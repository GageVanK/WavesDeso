import {
  Avatar,
  Paper,
  Group,
  Text,
  Card,
  Space,
  Center,
  Divider,
  Image,
  Tabs,
  TypographyStylesProvider,
  Container,
  createStyles,
  ActionIcon,
  Collapse,
  Button,
  Modal,
  Loader,
  ThemeIcon,
  Badge,
  Title,
} from '@mantine/core';
import { GiWaveCrest } from 'react-icons/gi';
import { TbPinned, TbPinnedOff } from 'react-icons/tb';
import { useState, useContext, useEffect, useRef } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import {
  getSingleProfile,
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSinglePost,
  identity,
  GetPost,
  getPostAssociations,
} from 'deso-protocol';
import { Stream } from '../components/Stream/Stream';
import { useDisclosure } from '@mantine/hooks';
import classes from './wave/wave.module.css';
import Post from '@/components/Post';
import { Chat } from '@/components/Chat';
import { UpdateProfile } from '../components/UpdateProfile';
import { replaceURLs } from '../helpers/linkHelper';
import { TwitchEmbed } from 'react-twitch-embed';
import { extractTwitchUsername } from '@/helpers/linkHelper';
import { AddTwitch } from '@/components/AddTwitchModal';
import { MdBookmarks } from 'react-icons/md';

export default function ProfilePage() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [posts, setPosts] = useState([]);
  const [NFTs, setNFTs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [followerInfo, setFollowers] = useState({ followers: 0, following: 0 });
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [openedChat, { toggle }] = useDisclosure(true);
  const [pinnedPost, setPinnedPost] = useState();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState();
  const embed = useRef();

  const handleReady = (e) => {
    embed.current = e;
  };

  const getFollowers = async () => {
    try {
      const following = await getFollowersForUser({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });
      const followers = await getFollowersForUser({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        GetEntriesFollowingUsername: true,
      });

      setFollowers({ following, followers });
    } catch (error) {
      console.error('Error fetching follower data:', error);
    }
  };

  //Get Posts for User
  const getPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const postData = await getPostsForUser({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        NumToFetch: 25,
      });

      setPosts(postData.Posts);
      setLastSeenPostHash(postData.Posts[postData.Posts.length - 1].PostHashHex);
      setIsLoadingPosts(false);
    } catch (error) {
      console.error('Error fetching user profile posts:', error);
      setIsLoadingPosts(false);
    }
  };

  const fetchMorePosts = async () => {
    try {
      setIsLoadingMore(true);
      const morePostsData = await getPostsForUser({
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
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

  // Get Pinned Post For User
  const getPinnedPost = async () => {
    try {
      const postData = await getSinglePost({
        PostHashHex: currentUser?.ProfileEntryResponse?.ExtraData?.PinnedPostHashHex,
      });
      setPinnedPost(postData.PostFound);
    } catch (error) {
      console.error('Error fetching livestream post:', error);
    }
  };

  //Get NFTs For User
  const getNFTs = async () => {
    try {
      setIsLoadingNFTs(true);
      const nftData = await getNFTsForUser({
        UserPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });

      setNFTs(nftData.NFTsMap);
      setIsLoadingNFTs(false);
    } catch (error) {
      console.error('Error fetching user nfts:', error);
      setIsLoadingNFTs(false);
    }
  };

  // Get Bookmark Posts
  const getBookmarkPosts = async () => {
    try {
      const res = await getPostAssociations({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'BOOKMARK',
        AssociationValue: 'BOOKMARK',
      });

      const newBookmarks = [];

      for (const association of res.Associations) {
        const postHash = association.PostHashHex;
        const response = await getSinglePost({ PostHashHex: postHash });

        newBookmarks.push(response.PostFound);
      }

      setBookmarks(newBookmarks);
    } catch (error) {
      console.error('Error submitting heart:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getFollowers();
      getPosts();
      getNFTs();
      getBookmarkPosts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.ProfileEntryResponse?.ExtraData?.PinnedPostHashHex) {
      getPinnedPost();
    }
  }, [currentUser]);

  return (
    <>
      <Divider
        my="xs"
        label={
          <>
            <Title order={3}>Dashboard</Title>
          </>
        }
        labelPosition="center"
      />

      <Space h="lg" />

      {currentUser ? (
        <>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={currentUser.ProfileEntryResponse?.ExtraData?.FeaturedImageURL || null}
                height={321}
                fallbackSrc="https://images.deso.org/4903a46ab3761c5d8bd57416ff411ff98b24b35fcf5480dde039eb9bae6eebe0.webp"
              />
            </Card.Section>
            <Group justify="space-between">
              <Group>
                <Avatar
                  size={123}
                  radius="md"
                  mt={-55}
                  className={classes.avatar}
                  src={
                    currentUser.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                    `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser?.PublicKeyBase58Check}` ||
                    null
                  }
                  alt="Profile Picture"
                />

                <div>
                  <Text fw={500} truncate="end">
                    {currentUser.ProfileEntryResponse?.ExtraData?.DisplayName ||
                      currentUser.ProfileEntryResponse?.Username ||
                      currentUser.PublicKeyBase58Check}
                  </Text>
                  <Text size="xs" fw={500} tt="lowercase">
                    @
                    {currentUser.ProfileEntryResponse?.Username || currentUser.PublicKeyBase58Check}
                  </Text>
                </div>
              </Group>

              <Group>
                <AddTwitch />
                <Space w={1} />
                <UpdateProfile />
                <Space w={1} />
              </Group>
            </Group>

            <Space h="md" />
            {currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL && (
              <Group grow>
                <TwitchEmbed
                  channel={extractTwitchUsername(
                    currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL
                  )}
                  withChat
                  darkMode={true}
                  onVideoReady={handleReady}
                />
              </Group>
            )}
            <Space h="sm" />

            {currentUser.ProfileEntryResponse === null ? (
              <>
                <Divider my="sm" />
                <Space h="sm" />
                <Center>
                  <Badge
                    size="md"
                    radius="sm"
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                  >
                    Go To Settings and Create A Username to Stream
                  </Badge>
                </Center>
                <Space h="sm" />
                <Divider my="sm" />
              </>
            ) : (
              <>
                <Stream />
              </>
            )}
            <Space h="sm" />

            <Paper shadow="xl" radius="md" p="xl">
              <Text
                fz="sm"
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'wrap',
                }}
                dangerouslySetInnerHTML={{
                  __html: currentUser.ProfileEntryResponse?.Description
                    ? replaceURLs(
                        currentUser.ProfileEntryResponse?.Description.replace(/\n/g, '<br>')
                      )
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
          </Card>

          <Space h="sm" />
          <Center>
            <Button variant="light" hiddenFrom="md" onClick={toggle}>
              {openedChat ? <>Close Chat</> : <>Open Chat</>}
            </Button>
          </Center>
          <Group justify="center" hiddenFrom="md">
            <Collapse transitionDuration={1000} transitionTimingFunction="smooth" in={openedChat}>
              <Chat handle={currentUser?.ProfileEntryResponse?.Username || 'Anon'} />
            </Collapse>
          </Group>

          <Space h="xl" />

          <Tabs radius="sm" defaultValue="first">
            <Tabs.List grow position="center">
              <Tabs.Tab value="first">
                <Text fz="sm">Posts</Text>
              </Tabs.Tab>

              <Tabs.Tab value="second">
                <Text fz="sm">NFTs</Text>
              </Tabs.Tab>

              <Tabs.Tab value="third">
                <Text fz="sm">
                  <MdBookmarks size="1.3rem" />
                </Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="first">
              {pinnedPost && (
                <>
                  <Paper shadow="xl" radius="md" p="xl">
                    <ThemeIcon variant="light" radius="xs" size="md" color="red">
                      <TbPinned />
                    </ThemeIcon>

                    <Post
                      post={pinnedPost}
                      username={currentUser?.ProfileEntryResponse?.Username}
                    />
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
                    <Post
                      post={post}
                      username={currentUser.ProfileEntryResponse?.Username}
                      key={post.PostHashHex}
                    />
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

            <Tabs.Panel value="third">
              <>
                {bookmarks?.length === 0 ? (
                  <p>No bookmarks found</p>
                ) : (
                  bookmarks.map((bookmark) => (
                    <Post
                      key={bookmark?.PostHashHex}
                      post={bookmark}
                      username={bookmark.ProfileEntryResponse.Username}
                    />
                  ))
                )}
              </>
            </Tabs.Panel>
          </Tabs>
          <Space h={222} />
        </>
      ) : (
        <>
          <Container size="30rem" px={0}>
            <Paper shadow="xl" p="lg" withBorder>
              <Center>
                <Text c="dimmed" fw={700}>
                  Please Sign Up or Sign In to view your Profile.
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
    </>
  );
}
