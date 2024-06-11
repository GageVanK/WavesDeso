import { getPostsStateless, getUserAssociations, getHotFeed } from 'deso-protocol';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { Center, Space, Loader, Button, Container } from '@mantine/core';
import Post from '@/components/Post';

export const HotFeed = () => {
  const [hotFeed, setHotFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);

  const fetchHotFeed = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params = {
        ResponseLimit: 30,
        SeenPosts: loadMore ? hotFeed.map((post) => post.PostHashHex) : [],
      };

      const newFeedData = await getHotFeed(params);

      console.log('newFeedData', newFeedData);

      let postsToSet = newFeedData.HotFeedPage;

      if (currentUser) {
        const postsWithoutBlocked = await Promise.all(
          postsToSet.map(async (post) => {
            const didBlock = await getUserAssociations({
              TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
              TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
              AssociationType: 'BLOCK',
              AssociationValue: 'BLOCK',
            });

            if (!didBlock.Associations[0]?.AssociationID) {
              return post;
            } else {
              return null;
            }
          })
        );

        const filteredAndCleanedPosts = postsWithoutBlocked.filter((post) => post !== null);

        if (filteredAndCleanedPosts.length === 0) {
          postsToSet = newFeedData.HotFeedPage;
        } else {
          postsToSet = filteredAndCleanedPosts;
        }
      }

      if (loadMore) {
        setHotFeed((prevPosts) => [...prevPosts, ...postsToSet]);
      } else {
        setHotFeed(postsToSet);
      }

      if (postsToSet.length > 0) {
        setLastSeenPostHash(postsToSet[postsToSet.length - 1].PostHashHex);
      } else {
        setLastSeenPostHash(null);
      }

      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user hotFeedData:', error);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHotFeed();
  }, []);

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
            {hotFeed?.map((post, index) => (
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
                <Button onClick={fetchHotFeed}>Load More</Button>
              </Center>
            )}
          </>
        )}

        <Space h={222} />
      </div>
    </>
  );
};
