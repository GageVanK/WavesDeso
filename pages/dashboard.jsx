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
  Container,
  Collapse,
  Button,
  Loader,
  ThemeIcon,
  Badge,
  Title,
  Tooltip,
  ActionIcon,
  rem,
  Modal,
  Switch,
  useMantineTheme,
  NumberInput,
  HoverCard,
  TextInput,
  Textarea,
  Stack,
  UnstyledButton,
  Box,
  RingProgress,
} from '@mantine/core';
import { GiWaveCrest } from 'react-icons/gi';
import { TbPinned, TbDownload } from 'react-icons/tb';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { useState, useContext, useEffect, useRef } from 'react';
import { Player } from '@livepeer/react';
import { doc, getDoc } from 'firebase/firestore';
import { DeSoIdentityContext } from 'react-deso-protocol';
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSinglePost,
  identity,
  getPostAssociations,
  getAppState,
  createNFT,
  getProfiles,
  submitPost,
  createPostAssociation,
} from 'deso-protocol';
import { useStreamSessions } from '@livepeer/react';
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
import { MdBookmarks, MdDeleteForever } from 'react-icons/md';
import { db } from '../firebase-config';
import { formatVODDate } from '@/formatDate';
import { IconDotsVertical, IconCheck, IconX } from '@tabler/icons-react';
import { MdPostAdd } from 'react-icons/md';
import { BiSearchAlt } from 'react-icons/bi';
import { notifications } from '@mantine/notifications';

export default function ProfilePage() {
  const theme = useMantineTheme();
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
  const [streamId, setStreamId] = useState();
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [checkedNft, setCheckedNft] = useState(false);
  const [nftCopies, setNftCopies] = useState(1);
  const [creatorRoyaltyPercentage, setCreatorRoyaltyPercentage] = useState(0);
  const [coinHolderRoyaltyPercentage, setCoinHolderRoyaltyPercentage] = useState(0);
  const [checked, setChecked] = useState(false);
  const [price, setPrice] = useState();
  const [extraCreatorRoyalties, setExtraCreatorRoyalties] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [value, setValue] = useState('');
  const [desoUSD, setDesoUSD] = useState();
  const embed = useRef();

  // For Twitch Embed
  const handleReady = (e) => {
    embed.current = e;
  };

  //Get Follower/Following Counts
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

  // Load more posts
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

  // Get Bookmarked Posts
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

  // Get StreamId for VODs
  const fetchStreamId = async () => {
    const docRef = doc(db, 'streams', currentUser?.ProfileEntryResponse?.Username);
    const streamData = await getDoc(docRef);

    if (streamData.data()) {
      setStreamId(streamData.data().streamId);
    } else {
      setStreamId(undefined);
    }
  };

  // Fetching VODs
  const { data: streamSessions } = useStreamSessions({ streamId });

  // Get Deso USD Value for Conversion/UI during minting
  const getDesoUSD = async () => {
    try {
      const appState = await getAppState({
        PublicKeyBase58Check: 'BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD',
      });
      const desoUSDValue = appState.USDCentsPerDeSoCoinbase / 100;

      setDesoUSD(desoUSDValue);
    } catch (error) {
      console.error('Error in getData:', error);
    }
  };

  // Convert percentage user input to basis points for minting
  const convertToBasisPoints = (percentage) => {
    const basisPoints = percentage * 100;
    return basisPoints;
  };

  // Convert DESO to nanos for minting
  const convertDESOToNanos = (deso) => {
    const nanoToDeso = 0.000000001;
    const nanos = Math.round(deso / nanoToDeso);
    return Number(nanos);
  };

  // Convert DESO to USD for minting
  const convertDESOToUSD = (deso) => {
    let usdValue = deso * desoUSD;

    if (usdValue < 0.01) {
      usdValue = 0.01;
    }

    return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Search for users to add for royalties
  const SearchUser = async () => {
    const request = {
      UsernamePrefix: value,
      NumToFetch: 10,
    };

    const response = await getProfiles(request);
    setSearchResults(response.ProfilesFound);
  };

  // Handle input change during search
  const handleInputChange = (event) => {
    setValue(event.currentTarget.value);
    SearchUser();
  };

  // Add selected creator
  const handleAddCreator = (publicKey) => {
    // Add selected creator with default percentage
    setExtraCreatorRoyalties((prevState) => ({
      ...prevState,
      [publicKey]: convertToBasisPoints(0), // Convert default percentage to basis points
    }));
    // Clear search results and value
    setSearchResults([]);
    setValue('');
  };

  // Handle creator percentage for added creators
  const handleCreatorPercentageChange = (publicKey, updatedPercentage) => {
    setExtraCreatorRoyalties((prevState) => {
      const updatedMap = {
        ...prevState,
        [publicKey]: convertToBasisPoints(updatedPercentage), // Convert updated percentage to basis points
      };

      return updatedMap;
    });
  };

  // Delete creator from royalties
  const deleteExtraCreator = (publicKey) => {
    setExtraCreatorRoyalties((prevState) => {
      const newOptions = { ...prevState };
      delete newOptions[publicKey];
      return newOptions;
    });
  };

  // Post function for VODs: Post onchain + Minting + Wave VOD Post Association
  // Post Association: Type = 'Wave VOD' | Value = 'username's VOD'
  // Going to use to create Feed of all VODs + to filter between private/public VODs
  const handleCreateVODPost = async (videoUrl) => {
    try {
      setIsLoadingPost(true);

      if (
        !identity.hasPermissions({
          TransactionCountLimitMap: {
            SUBMIT_POST: 1,
          },
        })
      ) {
        identity.requestPermissions({
          GlobalDESOLimit: 10000000, // 0.01 DESO
          TransactionCountLimitMap: {
            SUBMIT_POST: 3,
          },
        });
        return;
      }

      const resp = await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: bodyText || `${currentUser.ProfileEntryResponse?.Username}'s VOD`,
          VideoURLs: [videoUrl],
        },
      });

      if (resp?.submittedTransactionResponse?.PostEntryResponse) {
        await createPostAssociation({
          TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          PostHashHex: resp?.submittedTransactionResponse?.PostEntryResponse?.PostHashHex,
          AssociationType: 'Wave VOD',
          AssociationValue: `${currentUser.ProfileEntryResponse?.Username}'s VOD`,
          MinFeeRateNanosPerKB: 1000,
        });
      }

      if (checkedNft && resp?.submittedTransactionResponse?.PostEntryResponse) {
        const request = {
          UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          NFTPostHashHex: resp?.submittedTransactionResponse?.PostEntryResponse?.PostHashHex,
          NumCopies: nftCopies,
          NFTRoyaltyToCreatorBasisPoints: convertToBasisPoints(creatorRoyaltyPercentage),
          NFTRoyaltyToCoinBasisPoints: convertToBasisPoints(coinHolderRoyaltyPercentage),
          MinBidAmountNanos: convertDESOToNanos(price),
          BuyNowPriceNanos: (checked && convertDESOToNanos(price)) || undefined,
          IsBuyNow: checked,
          AdditionalDESORoyaltiesMap: extraCreatorRoyalties || undefined,
          HasUnlockable: false,
          IsForSale: true,
          MinFeeRateNanosPerKB: 1000,
        };

        await createNFT(request);
      }

      setIsLoadingPost(false);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Post was successfully submitted!',
      });

      setBodyText('');

      if (checkedNft) {
        setCheckedNft(false);
        setNftCopies(1);
        setCreatorRoyaltyPercentage(0);
        setCoinHolderRoyaltyPercentage(0);
        setExtraCreatorRoyalties({});
        setPrice(undefined);
      }

      if (checked) {
        checked(false);
      }

      close();
    } catch (err) {
      console.log(`something happened: ${err}`);
    }
  };

  // On mount or when current user changes call functions
  useEffect(() => {
    if (currentUser) {
      getFollowers();
      getPosts();
      getNFTs();
      getBookmarkPosts();
      fetchStreamId();
      console.log(currentUser);
    }

    // Get pinned post
    if (currentUser?.ProfileEntryResponse?.ExtraData?.PinnedPostHashHex) {
      getPinnedPost();
    }
  }, [currentUser]);

  // Get Deso USD Value on mount
  useEffect(() => {
    getDesoUSD();
  }, []);

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
                __html: currentUser.ProfileEntryResponse?.Description
                  ? replaceURLs(
                      currentUser.ProfileEntryResponse?.Description.replace(/\n/g, '<br>')
                    )
                  : '',
              }}
            />
            <Space h="sm" />
            {currentUser.ProfileEntryResponse?.ExtraData?.FollowerGoal &&
            currentUser?.ProfileEntryResponse?.ExtraData?.FollowerGoal ===
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
                        tooltip: `${currentUser?.ProfileEntryResponse?.ExtraData?.FollowerGoal} Followers`,
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
                  Follower Goal: {currentUser?.ProfileEntryResponse?.ExtraData?.FollowerGoal}
                </Text>
                <Center>
                  <RingProgress
                    size={144}
                    roundCaps
                    label={
                      <Text size="sm" ta="center">
                        {(
                          (followerInfo.followers?.NumFollowers /
                            currentUser?.ProfileEntryResponse?.ExtraData?.FollowerGoal) *
                          100
                        ).toFixed(0)}
                        %
                      </Text>
                    }
                    sections={[
                      {
                        value:
                          (followerInfo.followers?.NumFollowers /
                            currentUser?.ProfileEntryResponse?.ExtraData?.FollowerGoal) *
                          100,
                        color: 'cyan',
                        tooltip: `${followerInfo.followers?.NumFollowers} Followers`,
                      },
                    ]}
                  />
                </Center>
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
                <Text fz="sm">VODs</Text>
              </Tabs.Tab>

              <Tabs.Tab value="fourth">
                <MdBookmarks size="1.3rem" />
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
                  {posts.map((post, index) => (
                    <div key={index}>
                      <Post post={post} username={currentUser.ProfileEntryResponse?.Username} />
                    </div>
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
                </>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="third">
              <>
                <Space h="md" />
                {!streamSessions || streamSessions?.length === 0 ? (
                  <p>Stream to view your VODs here.</p>
                ) : (
                  streamSessions?.map((vod, index) => (
                    <>
                      <Modal opened={opened} onClose={close} centered size="xl">
                        <Space h="sm" />
                        <Textarea
                          name="body"
                          radius="md"
                          placeholder="Give your VOD post a Title."
                          autosize
                          variant="filled"
                          size="md"
                          value={bodyText}
                          onChange={(event) => setBodyText(event.currentTarget.value)}
                        />
                        <Space h="sm" />
                        <Player
                          controls
                          showPipButton
                          theme={{
                            colors: {
                              loading: '#3cdfff',
                            },
                          }}
                          src={vod.mp4Url}
                        />
                        <Space h="sm" />
                        <Group position="left">
                          <Button
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'indigo' }}
                            raduis="sm"
                            loading={isLoadingPost}
                            disabled={
                              isLoadingPost ||
                              (checkedNft && !price) ||
                              creatorRoyaltyPercentage +
                                coinHolderRoyaltyPercentage +
                                (Object.keys(extraCreatorRoyalties).length > 0
                                  ? Object.values(extraCreatorRoyalties).reduce(
                                      (acc, cur) => acc + cur / 100,
                                      0
                                    )
                                  : 0) >
                                100
                            }
                            onClick={() => handleCreateVODPost(vod.mp4Url)}
                          >
                            Create
                          </Button>

                          <Switch
                            checked={checkedNft}
                            onChange={(event) => setCheckedNft(event.currentTarget.checked)}
                            color="teal"
                            size="sm"
                            label={
                              <Text fw={500} size="xs">
                                Mint
                              </Text>
                            }
                            thumbIcon={
                              checkedNft ? (
                                <IconCheck
                                  style={{ width: rem(12), height: rem(12) }}
                                  color={theme.colors.teal[6]}
                                  stroke={3}
                                />
                              ) : (
                                <></>
                              )
                            }
                          />
                        </Group>

                        {creatorRoyaltyPercentage +
                          coinHolderRoyaltyPercentage +
                          (Object.keys(extraCreatorRoyalties).length > 0
                            ? Object.values(extraCreatorRoyalties).reduce(
                                (acc, cur) => acc + cur / 100,
                                0
                              )
                            : 0) >
                          100 && (
                          <>
                            <Space h="xs" />
                            <Text size="xs" c="red">
                              Royalty Percentages Exceed 100%
                            </Text>
                          </>
                        )}

                        {checkedNft && (
                          <>
                            <Space h="xs" />
                            <NumberInput
                              variant="filled"
                              label="NFT Copies"
                              description="Sell Single or Multiple Copies."
                              defaultValue={1}
                              min={1}
                              allowDecimal={false}
                              allowNegative={false}
                              value={nftCopies}
                              onChange={setNftCopies}
                              thousandSeparator=","
                            />
                            <Space h="lg" />
                            <Divider />
                            <Space h="lg" />
                            <Group justify="right">
                              <Switch
                                checked={checked}
                                onChange={(event) => setChecked(event.currentTarget.checked)}
                                labelPosition="left"
                                label="Set as Buy Now"
                              />
                            </Group>
                            <Space h="xs" />
                            {checked ? (
                              <>
                                <NumberInput
                                  variant="filled"
                                  label="Buy Now Price"
                                  description="Set the buy now price for your NFT."
                                  placeholder="Enter Amount in $DESO"
                                  allowNegative={false}
                                  hideControls
                                  prefix="$DESO "
                                  value={price}
                                  onChange={setPrice}
                                  thousandSeparator=","
                                />
                                {checked && price && <> ≈ {convertDESOToUSD(price)}</>}
                                <Space h="xs" />
                              </>
                            ) : (
                              <>
                                <NumberInput
                                  variant="filled"
                                  label="Minimum Bid"
                                  description="Set the minimum bid price for your NFT."
                                  placeholder="Enter Amount in $DESO"
                                  allowNegative={false}
                                  hideControls
                                  prefix="$DESO "
                                  value={price}
                                  onChange={setPrice}
                                  thousandSeparator=","
                                />
                                {price && <> ≈ {convertDESOToUSD(price)}</>}
                              </>
                            )}

                            <Space h="lg" />
                            <Divider />
                            <Space h="lg" />

                            <NumberInput
                              variant="filled"
                              label="Your Royalty Percentage"
                              description="This goes directly to you for secondary sales."
                              placeholder="Percents"
                              suffix="%"
                              defaultValue={0}
                              allowNegative={false}
                              value={creatorRoyaltyPercentage}
                              onChange={setCreatorRoyaltyPercentage}
                              min={0}
                              max={100}
                              error={
                                creatorRoyaltyPercentage > 100 && 'Cannot be greater than 100%'
                              }
                            />
                            <Space h="lg" />
                            <NumberInput
                              variant="filled"
                              label="Coin Holder Royalty Percentage"
                              description="This will be distributed to your Creator Coin Holders."
                              defaultValue={0}
                              placeholder="Percents"
                              suffix="%"
                              allowNegative={false}
                              min={0}
                              max={100}
                              value={coinHolderRoyaltyPercentage}
                              onChange={setCoinHolderRoyaltyPercentage}
                              error={
                                coinHolderRoyaltyPercentage > 100 && 'Cannot be greater than 100%'
                              }
                            />

                            <Space h="lg" />
                            <Group>
                              <Text fw={500} size="sm">
                                Add More Creator Royalties
                              </Text>
                              <HoverCard width={280} closeDelay={700} shadow="md">
                                <HoverCard.Target>
                                  <ActionIcon radius="xl" size="xs" variant="subtle">
                                    <TiInfoLargeOutline />
                                  </ActionIcon>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                  <Text fw={500} size="xs">
                                    Set up royalties for specific Creators. This enables partnered
                                    content for NFT Sales.
                                  </Text>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            </Group>
                            <Space h="xs" />

                            <TextInput
                              leftSection={<BiSearchAlt size="1.2rem" />}
                              variant="filled"
                              placeholder="Search for a creator by username"
                              value={value}
                              onChange={handleInputChange}
                            />

                            <Space h="xs" />
                            {value && searchResults.length > 0 && (
                              <Stack>
                                {searchResults.map((profile) => (
                                  <UnstyledButton
                                    key={profile.PublicKeyBase58Check}
                                    onClick={() => handleAddCreator(profile.PublicKeyBase58Check)}
                                  >
                                    <Group>
                                      <Avatar
                                        src={
                                          `https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
                                          null
                                        }
                                        radius="xl"
                                      />
                                      <div>
                                        <Text size="sm" fw={500}>
                                          {profile?.ExtraData?.DisplayName || profile.Username}
                                        </Text>
                                        <Text c="dimmed" size="xs">
                                          @{profile.Username}
                                        </Text>
                                      </div>
                                    </Group>
                                  </UnstyledButton>
                                ))}
                              </Stack>
                            )}

                            <Space h="xs" />
                            {Object.entries(extraCreatorRoyalties).map(
                              ([publicKey, percentage], index) => (
                                <>
                                  <Group key={index}>
                                    <Group grow>
                                      <Group>
                                        <Avatar
                                          src={
                                            `https://node.deso.org/api/v0/get-single-profile-picture/${publicKey}` ||
                                            null
                                          }
                                          radius="xl"
                                        />
                                        <Box w={111}>
                                          <Text size="sm" fw={500} truncate="end">
                                            {publicKey}
                                          </Text>
                                        </Box>
                                      </Group>

                                      <NumberInput
                                        variant="filled"
                                        defaultValue={percentage}
                                        placeholder="Percents"
                                        suffix="%"
                                        min={0}
                                        max={100}
                                        allowNegative={false}
                                        onChange={(updatedValue) =>
                                          handleCreatorPercentageChange(publicKey, updatedValue)
                                        }
                                        error={
                                          percentage / 100 > 100 && 'Cannot be greater than 100%'
                                        }
                                      />
                                    </Group>
                                    <ActionIcon
                                      radius="xl"
                                      size="sm"
                                      color="red"
                                      variant="subtle"
                                      type="button"
                                      onClick={() => deleteExtraCreator(publicKey)}
                                    >
                                      <MdDeleteForever />
                                    </ActionIcon>
                                  </Group>
                                  <Space h="xs" />
                                </>
                              )
                            )}
                          </>
                        )}
                      </Modal>

                      <Paper withBorder shadow="xl" radius="md" key={index}>
                        <Space h="md" />
                        <Group justify="space-between">
                          {vod.recordingStatus === 'waiting' ? (
                            <div>
                              <Text ml={11} size="xs">
                                Uploading
                              </Text>
                              <Center>
                                <Loader ml={11} size="xs" type="dots" />
                              </Center>
                            </div>
                          ) : (
                            <Tooltip label="Post VOD Onchain">
                              <Button radius="xl" ml={11} size="xs" onClick={open}>
                                Post
                              </Button>
                            </Tooltip>
                          )}

                          <Group>
                            <Text size="xs" fw={500}>
                              Created On: {formatVODDate(vod.createdAt)}
                            </Text>
                            <Tooltip label="Download VOD">
                              <ActionIcon
                                mr={11}
                                size="md"
                                variant="default"
                                onClick={() => window.open(vod.mp4Url, '_blank')}
                              >
                                <TbDownload style={{ width: rem(16), height: rem(16) }} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <Space h="xs" />
                        {vod.recordingStatus === 'waiting' ? (
                          <></>
                        ) : (
                          <>
                            <Player
                              controls
                              showPipButton
                              theme={{
                                colors: {
                                  loading: '#3cdfff',
                                },
                              }}
                              src={vod.mp4Url}
                            />

                            <Space h="xs" />
                          </>
                        )}
                      </Paper>
                    </>
                  ))
                )}
              </>
            </Tabs.Panel>

            <Tabs.Panel value="fourth">
              <>
                {bookmarks?.length === 0 ? (
                  <p>No bookmarks found</p>
                ) : (
                  bookmarks.map((bookmark, index) => (
                    <div key={index}>
                      <Post post={bookmark} username={bookmark.ProfileEntryResponse.Username} />
                    </div>
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
