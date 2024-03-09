import {
  getPostsStateless,
  getFollowersForUser,
  getUserAssociations,
  identity,
} from 'deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import Link from 'next/link';
import {
  Text,
  Avatar,
  Group,
  Paper,
  Center,
  Space,
  UnstyledButton,
  Container,
  Loader,
  Button,
  Checkbox,
} from '@mantine/core';
import { GiWaveCrest } from 'react-icons/gi';
import { LiaUsersSolid } from 'react-icons/lia';
import Post from '@/components/Post';
import CloseFriendFeed from '@/components/CloseFriendFeed';

export const FollowerFeed = () => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [followerFeed, setFollowerFeed] = useState([]);
  const userPublicKey = currentUser?.PublicKeyBase58Check;
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState();

  const fetchFollowerFeed = async () => {
    try {
      setIsLoading(true);
      const followerFeedData = await getPostsStateless({
        ReaderPublicKeyBase58Check: userPublicKey,
        NumToFetch: 25,
        GetPostsForFollowFeed: true,
      });

      // Check if each poster is blocked
      const postsWithoutBlocked = await Promise.all(
        followerFeedData.PostsFound.map(async (post) => {
          const didBlock = await getUserAssociations({
            TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
            TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
            AssociationType: 'BLOCK',
            AssociationValue: 'BLOCK',
          });

          if (!didBlock.Associations[0]?.AssociationID) {
            return post;
          } else {
            return null; // If blocked, return null to filter it out
          }
        })
      );

      // Filter out null values (blocked posts)
      const filteredAndCleanedPosts = postsWithoutBlocked.filter((post) => post !== null);

      setFollowerFeed(filteredAndCleanedPosts);

      setLastSeenPostHash(
        followerFeedData.PostsFound[followerFeedData.PostsFound.length - 1].PostHashHex
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching user hotFeed:', error);
    }
  };

  const fetchMoreFollowingFeed = async () => {
    try {
      setIsLoadingMore(true);
      const morePostsData = await getPostsStateless({
        ReaderPublicKeyBase58Check: userPublicKey,
        NumToFetch: 25,
        GetPostsForFollowFeed: true,
        PostHashHex: lastSeenPostHash,
      });

      if (morePostsData.PostsFound.length > 0) {
        // Check if each poster is blocked
        const postsWithoutBlocked = await Promise.all(
          morePostsData.PostsFound.map(async (post) => {
            const didBlock = await getUserAssociations({
              TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
              TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
              AssociationType: 'BLOCK',
              AssociationValue: 'BLOCK',
            });

            if (!didBlock.Associations[0]?.AssociationID) {
              return post;
            } else {
              return null; // If blocked, return null to filter it out
            }
          })
        );

        // Filter out null values (blocked posts)
        const filteredAndCleanedPosts = postsWithoutBlocked.filter((post) => post !== null);

        setFollowerFeed((prevPosts) => [...prevPosts, ...filteredAndCleanedPosts]);
        setLastSeenPostHash(
          morePostsData.PostsFound[morePostsData.PostsFound.length - 1].PostHashHex
        );
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.error('Error fetching more hotFeed:', error);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFollowerFeed();
    }
  }, [currentUser]);

  return (
    <>
      <div>
        {currentUser ? (
          <>
            <Space h="md" />
            <Checkbox
              ml={11}
              label={
                <UnstyledButton component={Link} href="/closeFriends">
                  <Group gap="xs">
                    <LiaUsersSolid size="1.5rem" />
                    <Text fw={500} size="xs">
                      Close Friends
                    </Text>
                  </Group>
                </UnstyledButton>
              }
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
            />

            {checked ? (
              <CloseFriendFeed />
            ) : (
              <>
                {followerFeed && followerFeed.length > 0 ? (
                  <>
                    {followerFeed.map((post, index) => (
                      <div key={index}>
                        <Post post={post} username={post.ProfileEntryResponse?.Username} />
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
                        <Button onClick={fetchMoreFollowingFeed}>Load More</Button>
                      </Center>
                    )}

                    <Space h={222} />
                  </>
                ) : (
                  <>
                    {isLoading ? (
                      <>
                        <Space h="md" />
                        <Group justify="center">
                          <Loader />
                        </Group>
                      </>
                    ) : (
                      <>
                        <Space h="md" />
                        <Container size="30rem" px={0}>
                          <Center>
                            <Text size="md" fw={400}>
                              Follow Some Creators To View Your Following Feed.
                            </Text>
                          </Center>
                        </Container>
                        <Space h={222} />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Space h="md" />
            <Container size="30rem" px={0}>
              <Paper shadow="xl" p="lg" withBorder>
                <Center>
                  <Text size="md" fw={400}>
                    Sign In to view your Following Feed.
                  </Text>
                </Center>
                <Space h="md" />

                <Button
                  fullWidth
                  leftSection={<GiWaveCrest size="1rem" />}
                  variant="gradient"
                  gradient={{ from: 'cyan', to: 'indigo' }}
                  onClick={() => {
                    identity();
                  }}
                >
                  Sign In
                </Button>
              </Paper>
            </Container>
          </>
        )}
      </div>
    </>
  );
};
