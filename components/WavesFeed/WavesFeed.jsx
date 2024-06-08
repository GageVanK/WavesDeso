import { getPostsStateless, getUserAssociations } from 'deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { Container, Space, Loader, Text, Center } from '@mantine/core';
import Post from '@/components/Post';
import { DeSoIdentityContext } from 'react-deso-protocol';
export const WavesFeed = () => {
  const [wavesFeed, setWavesFeed] = useState([]);
  const [isLoadingWaves, setIsLoadingWaves] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);
  // Function to filter out duplicate usernames from the waves feed
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

  useEffect(() => {
    const fetchWavesFeed = async () => {
      try {
        setIsLoadingWaves(true);
        const wavesFeedData = await getPostsStateless({
          ReaderPublicKeyBase58Check: 'BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6',
          NumToFetch: 20,
          GetPostsForFollowFeed: true,
        });

        // Iterate through posts and filter based on conditions
        const filteredPosts = filterUniqueUsernames(
          wavesFeedData.PostsFound.filter((post) => post.PostExtraData.WavesStreamTitle)
        );

        // Check if currentUser exists
        if (currentUser) {
          // Check if each poster is blocked
          const postsWithoutBlocked = await Promise.all(
            filteredPosts.map(async (post) => {
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
          setIsLoadingWaves(false);
          setWavesFeed(filteredAndCleanedPosts);
        } else {
          // If currentUser doesn't exist, set the waves feed without applying block filter
          setWavesFeed(filteredPosts);
          setIsLoadingWaves(false);
        }
      } catch (error) {
        console.log('Something went wrong:', error);
        setIsLoadingWaves(false);
      }
    };

    fetchWavesFeed();
  }, [currentUser]);

  return (
    <>
      {isLoadingWaves && (
        <>
          <Space h="md" />
          <Center>
            <Loader variant="bars" />
          </Center>
        </>
      )}

      {!isLoadingWaves && wavesFeed.length === 0 && (
        <>
          <Space h="md" />
          <Container size="30rem" px={0}>
            <Center>
              <Text size="md" fw={400}>
                No Waves Right Now.
              </Text>
            </Center>
          </Container>
          <Space h={222} />
        </>
      )}

      {wavesFeed.map((post, index) => (
        <Container size={1111} px={0} key={index}>
          <Post post={post} username={post.ProfileEntryResponse.Username} />
        </Container>
      ))}
    </>
  );
};
