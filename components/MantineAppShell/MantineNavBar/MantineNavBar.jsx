import { useContext, useEffect, useState } from 'react';
import {
  Text,
  UnstyledButton,
  Avatar,
  Group,
  Slider,
  rem,
  Paper,
  Menu,
  Center,
  Space,
  ActionIcon,
  Tooltip,
  Image,
  Box,
  Button,
  Textarea,
  Collapse,
  Modal,
  HoverCard,
  RingProgress,
  ScrollArea,
} from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { RxDotFilled } from 'react-icons/rx';
import { GiWaveSurfer } from 'react-icons/gi';
import { getPostsStateless, getIsFollowing, updateFollowingStatus } from 'deso-protocol';
import { DeSoIdentityContext } from 'react-deso-protocol';
import Link from 'next/link';
import { RiUserUnfollowLine, RiUserAddLine } from 'react-icons/ri';
import { notifications } from '@mantine/notifications';
import classes from './MantineNavBar.module.css';
import { SubscriptionModal } from '../../SubscriptionModal';
import { replaceURLs } from '../../../helpers/linkHelper';

export function MantineNavBar() {
  const [wavesFeed, setWavesFeed] = useState([]);
  const [followingWaves, setFollowingWaves] = useState([]);
  const [isFollowing, setIsFollowing] = useState();
  const { currentUser } = useContext(DeSoIdentityContext);

  // Function to filter out duplicate usernames from an array of posts
  const filterUniqueUsernames = (posts) => {
    const uniqueUsernames = [];
    const filteredPosts = posts.filter((post) => {
      const username = post.ProfileEntryResponse?.Username;
      if (!uniqueUsernames.includes(username)) {
        uniqueUsernames.push(username);
        return true;
      }
      return false;
    });
    return filteredPosts;
  };

  // Getting Waves Feed
  const fetchWavesFeed = async () => {
    try {
      const wavesFeedData = await getPostsStateless({
        ReaderPublicKeyBase58Check: 'BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6',
        NumToFetch: 20,
        GetPostsForFollowFeed: true,
      });

      // Iterate through posts and filter based on conditions
      const filteredPosts = filterUniqueUsernames(
        wavesFeedData.PostsFound.filter((post) => post.PostExtraData.WavesStreamTitle)
      );

      setWavesFeed(filteredPosts);
    } catch (error) {
      console.log('Something went wrong:', error);
    }
  };

  useEffect(() => {
    fetchWavesFeed();
  }, []);

  // Check if the current user is following the profiles in the waves feed
  const fetchFollowingWaves = async () => {
    const followingPosts = [];
    for (const post of wavesFeed) {
      const response = await getIsFollowing({
        PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: post.ProfileEntryResponse.PublicKeyBase58Check,
      });
      if (response.IsFollowing === true) {
        followingPosts.push(post);
      }
    }
    setFollowingWaves(followingPosts);
  };

  // Follow profile
  const followUser = async (publicKey, username) => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: false,
        FollowedPublicKeyBase58Check: publicKey,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });

      notifications.show({
        title: 'Success',
        icon: <RiUserAddLine size="1.1rem" />,
        color: 'blue',
        message: `You successfully followed ${username}`,
      });
      setIsFollowing(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
    }
  };

  // Unfollow profile
  const unfollowUser = async (publicKey, username) => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: true,
        FollowedPublicKeyBase58Check: publicKey,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });

      notifications.show({
        title: 'Success',
        icon: <RiUserUnfollowLine size="1.1rem" />,
        color: 'blue',
        message: `You successfully unfollowed ${username}`,
      });
      setIsFollowing(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
    }
  };

  // Fetch the followingPosts when the currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchFollowingWaves();
    }
  }, [currentUser, wavesFeed, isFollowing]);

  return (
    <nav>
      <div>
        <Space h="lg" />

        <Text fs="italic" size="md" fw={800} ta="center">
          Following
        </Text>
        <Space w={2} />

        <Space h="sm" />
        {currentUser ? (
          followingWaves && followingWaves.length > 0 ? (
            followingWaves.map((post, index) => (
              <HoverCard key={index} width={300} height={80} shadow="md" position="right">
                <HoverCard.Target>
                  <UnstyledButton
                    component={Link}
                    href={`/wave/${post.ProfileEntryResponse.Username}`}
                    className={classes.user}
                  >
                    <Group>
                      <Avatar
                        src={
                          post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL ||
                          `https://node.deso.org/api/v0/get-single-profile-picture/${post.ProfileEntryResponse.PublicKeyBase58Check}` ||
                          null
                        }
                        radius="xl"
                      />

                      <div style={{ flex: 1, maxWidth: 111 }}>
                        <Text size="sm" fw={500} truncate="end">
                          {post.ProfileEntryResponse?.ExtraData?.DisplayName ||
                            post.ProfileEntryResponse.Username}
                        </Text>
                        <Text size="xs" truncate="end">
                          @{post.ProfileEntryResponse.Username}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                </HoverCard.Target>

                <HoverCard.Dropdown width={280} shadow="md">
                  <Group justify="space-between">
                    <Avatar
                      radius="md"
                      size="xl"
                      src={
                        post.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                        `https://node.deso.org/api/v0/get-single-profile-picture/${
                          post.ProfileEntryResponse?.PublicKeyBase58Check ||
                          post.PosterPublicKeyBase58Check
                        }` ||
                        null
                      }
                    />

                    {currentUser &&
                    currentUser.ProfileEntryResponse?.Username !==
                      post?.ProfileEntryResponse?.Username ? (
                      <>
                        {followingWaves.some(
                          (followingPost) =>
                            followingPost.ProfileEntryResponse.PublicKeyBase58Check ===
                            post.ProfileEntryResponse.PublicKeyBase58Check
                        ) || isFollowing ? (
                          <Tooltip
                            label={`Unfollow @${post.ProfileEntryResponse.Username}`}
                            withArrow
                            arrowPosition="center"
                          >
                            <ActionIcon
                              variant="default"
                              size={36}
                              onClick={() =>
                                unfollowUser(
                                  post.ProfileEntryResponse.PublicKeyBase58Check,
                                  post.ProfileEntryResponse.Username
                                )
                              }
                              mb={22}
                            >
                              <RiUserUnfollowLine size="1.2rem" stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            label={`Follow @${post.ProfileEntryResponse.Username}`}
                            withArrow
                            arrowPosition="center"
                          >
                            <ActionIcon
                              variant="default"
                              size={36}
                              onClick={() =>
                                followUser(
                                  post.ProfileEntryResponse.PublicKeyBase58Check,
                                  post.ProfileEntryResponse.Username
                                )
                              }
                              mb={22}
                            >
                              <RiUserAddLine size="1.2rem" stroke={1.5} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </>
                    ) : null}
                  </Group>
                  <Space h="xs" />

                  <Box w={255}>
                    <Text fw={500} truncate="end">
                      {post.ProfileEntryResponse?.ExtraData?.DisplayName ||
                        post.ProfileEntryResponse.Username}
                    </Text>
                  </Box>
                  <Text size="xs" truncate="end">
                    @{post.ProfileEntryResponse.Username}
                  </Text>

                  <Space h="xl" />

                  <Text
                    fz="sm"
                    style={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'wrap',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post?.ProfileEntryResponse?.Description
                        ? replaceURLs(post.ProfileEntryResponse?.Description).replace(/\n/g, '<br>')
                        : '',
                    }}
                  />
                  <Space h="sm" />
                  <Group grow>
                    <SubscriptionModal
                      publickey={post.ProfileEntryResponse.PublicKeyBase58Check}
                      username={post.ProfileEntryResponse.Username}
                    />
                  </Group>
                </HoverCard.Dropdown>
              </HoverCard>
            ))
          ) : (
            <>
              <Space h="lg" />

              <Text ml={22} fz="xs" fw={500} lineClamp={2}>
                No Followers are Live.
              </Text>

              <Space h="lg" />
            </>
          )
        ) : (
          <>
            <Space h="lg" />

            <Text ml={22} fz="xs" fw={500} lineClamp={2}>
              Sign in to view your Following.
            </Text>

            <Space h="lg" />
          </>
        )}

        <Space h="lg" />

        <Text fs="italic" size="md" fw={800} ta="center">
          Recommended Waves
        </Text>

        <Space h="sm" />
        {wavesFeed && wavesFeed.length > 0 ? (
          wavesFeed.map((post) => (
            <HoverCard width={300} shadow="md" position="right">
              <HoverCard.Target>
                <UnstyledButton
                  component={Link}
                  href={`/wave/${post.ProfileEntryResponse.Username}`}
                  className={classes.user}
                >
                  <Group>
                    <Avatar
                      src={
                        post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL ||
                        `https://node.deso.org/api/v0/get-single-profile-picture/${post.ProfileEntryResponse.PublicKeyBase58Check}` ||
                        null
                      }
                      radius="xl"
                    />

                    <div style={{ flex: 1, maxWidth: 111 }}>
                      <Text size="sm" fw={500} truncate="end">
                        {post.ProfileEntryResponse?.ExtraData?.DisplayName ||
                          post.ProfileEntryResponse.Username}
                      </Text>
                      <Text size="xs" truncate="end">
                        @{post.ProfileEntryResponse.Username}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </HoverCard.Target>

              <HoverCard.Dropdown width={280} shadow="md">
                <Group justify="space-between">
                  <Avatar
                    radius="md"
                    size="xl"
                    src={
                      post.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                      `https://node.deso.org/api/v0/get-single-profile-picture/${
                        post.ProfileEntryResponse?.PublicKeyBase58Check ||
                        post.PosterPublicKeyBase58Check
                      }` ||
                      null
                    }
                  />

                  {currentUser &&
                  currentUser.ProfileEntryResponse?.Username !==
                    post?.ProfileEntryResponse?.Username ? (
                    <>
                      {followingWaves.some(
                        (followingPost) =>
                          followingPost.ProfileEntryResponse.PublicKeyBase58Check ===
                          post.ProfileEntryResponse.PublicKeyBase58Check
                      ) || isFollowing ? (
                        <Tooltip
                          label={`Unfollow @${post.ProfileEntryResponse.Username}`}
                          withArrow
                          arrowPosition="center"
                        >
                          <ActionIcon
                            variant="default"
                            size={36}
                            onClick={() => unfollowUser(post.ProfileEntryResponse.PostHashHex)}
                            mb={22}
                          >
                            <RiUserUnfollowLine size="1.2rem" stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          label={`Follow @${post.ProfileEntryResponse.Username}`}
                          withArrow
                          arrowPosition="center"
                        >
                          <ActionIcon
                            variant="default"
                            size={36}
                            onClick={() =>
                              followUser(
                                post.ProfileEntryResponse.PublicKeyBase58Check,
                                post.ProfileEntryResponse.Username
                              )
                            }
                            mb={22}
                          >
                            <RiUserAddLine size="1.2rem" stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </>
                  ) : null}
                </Group>
                <Space h="xs" />

                <Box w={255}>
                  <Text fw={500} truncate="end">
                    {post.ProfileEntryResponse?.ExtraData?.DisplayName ||
                      post.ProfileEntryResponse.Username}
                  </Text>
                </Box>
                <Text size="xs" truncate="end">
                  @{post.ProfileEntryResponse.Username}
                </Text>

                <Space h="xl" />

                <Text
                  fz="sm"
                  style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'wrap',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: post?.ProfileEntryResponse?.Description
                      ? replaceURLs(post.ProfileEntryResponse?.Description).replace(/\n/g, '<br>')
                      : '',
                  }}
                />
                <Space h="sm" />
                <Group grow>
                  <SubscriptionModal
                    publickey={post.ProfileEntryResponse.PublicKeyBase58Check}
                    username={post.ProfileEntryResponse.Username}
                  />
                </Group>
              </HoverCard.Dropdown>
            </HoverCard>
          ))
        ) : (
          <>
            <Space h="lg" />

            <Text ml={22} fz="xs" fw={500} lineClamp={1}>
              No Waves Right Now.
            </Text>
          </>
        )}

        <Space h="lg" />
      </div>
    </nav>
  );
}
