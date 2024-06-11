import { useContext, useEffect, useState } from 'react';
import { Container, Loader, Center, Button, Space } from '@mantine/core';
import { getPostsStateless, getUserAssociations } from 'deso-protocol';
import { DeSoIdentityContext } from 'react-deso-protocol';
import Post from '../Post'; // Adjust the import according to your file structure

export const NewFeed = () => {
  const [newFeed, setNewFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);

  const fetchNewFeed = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params = {
        NumToFetch: 30,
        MediaRequired: true,
        ReaderPublicKeyBase58Check: currentUser ? currentUser.PublicKeyBase58Check : '',
        PostHashHex: loadMore ? lastSeenPostHash : '',
      };

      const newFeedData = await getPostsStateless(params);

      console.log('newFeedData', newFeedData);

      let postsToSet = newFeedData.PostsFound;

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
          postsToSet = newFeedData.PostsFound;
        } else {
          postsToSet = filteredAndCleanedPosts;
        }
      }

      if (loadMore) {
        setNewFeed((prevPosts) => [...prevPosts, ...postsToSet]);
      } else {
        setNewFeed(postsToSet);
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
      console.error('Error fetching newFeed:', error);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNewFeed();
  }, []);

  return (
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
          {newFeed?.map((post, index) => (
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
              <Button onClick={() => fetchNewFeed(true)}>Load More</Button>
            </Center>
          )}
        </>
      )}

      <Space h={222} />
    </div>
  );
};
