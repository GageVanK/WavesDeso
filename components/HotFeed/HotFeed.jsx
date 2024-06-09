import { getPostsStateless, getUserAssociations, getHotFeed } from 'deso-protocol';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { Center, Space, Loader, Button, Container } from '@mantine/core';
import Post from '@/components/Post';

export const HotFeed = () => {
  const [newFeed, setNewFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);

  const fetchNewFeed = async () => {
    try {
      setIsLoading(true);
      const newFeedData = await getHotFeed({
        ResponseLimit: 30,
      });

      setNewFeed(newFeedData.HotFeedPage);

      if (currentUser) {
        // Check if each poster is blocked
        const postsWithoutBlocked = await Promise.all(
          newFeedData.PostsFound.map(async (post) => {
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

        setNewFeed(filteredAndCleanedPosts);
        setIsLoading(false);
      } else {
        setNewFeed(newFeedData.PostsFound);
        setIsLoading(false);
      }
      setLastSeenPostHash(newFeedData.PostsFound[newFeedData.PostsFound.length - 1].PostHashHex);
    } catch (error) {
      console.error('Error fetching user newFeedData:', error);
      setIsLoading(false);
    }
  };

  const fetchMoreNewFeed = async () => {
    try {
      setIsLoadingMore(true);
      const morePostsData = await getPostsStateless({
        NumToFetch: 25,
        PostHashHex: lastSeenPostHash,
        MediaRequired: true,
      });
      if (morePostsData.PostsFound.length > 0) {
        if (currentUser) {
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
          setNewFeed((prevPosts) => [...prevPosts, ...filteredAndCleanedPosts]);

          setIsLoading(false);
        } else {
          setNewFeed((prevPosts) => [...prevPosts, ...morePostsData.PostsFound]);
          setIsLoading(false);
        }

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
    fetchNewFeed();
  }, [currentUser]);

  return (
    <>
      <div>
        {isLoading ? (
          <>
            <Space h="md" />
            <Center>
              <Loader variant="bars" />
            </Center>
          </>
        ) : (
          <>
            {newFeed
              ?.filter((post) => post.ProfileEntryResponse?.Username !== 'BirthBlockNFT')
              .map((post, index) => (
                <Container size={777} px={0} key={index}>
                  <Post post={post} username={post.ProfileEntryResponse?.Username} />
                </Container>
              ))}

            {isLoadingMore ? (
              <>
                <Space h="md" />
                <Center>
                  <Loader />
                </Center>
              </>
            ) : (
              <Center>
                <Button onClick={fetchMoreNewFeed}>Load More</Button>
              </Center>
            )}
          </>
        )}

        <Space h={222} />
      </div>
    </>
  );
};
