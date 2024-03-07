import { getPostsStateless } from 'deso-protocol';
import { useEffect, useState } from 'react';
import { Container, Space, Loader, Text, Center } from '@mantine/core';
import Post from '@/components/Post';

export const WavesFeed = () => {
  const [wavesFeed, setWavesFeed] = useState([]);
  const [isLoadingWaves, setIsLoadingWaves] = useState(false);

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

        const followerFeedData = await getPostsStateless({
          ReaderPublicKeyBase58Check: 'BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6',
          NumToFetch: 25,
          GetPostsForFollowFeed: true,
        });

        // Iterate through posts and filter based on conditions
        const filteredPosts = filterUniqueUsernames(
          followerFeedData.PostsFound.filter((post) => post.PostExtraData.WavesStreamTitle)
        );

        setWavesFeed(filteredPosts);
        setIsLoadingWaves(false);
      } catch (error) {
        console.log('Something went wrong:', error);
        setIsLoadingWaves(false);
      }
    };

    fetchWavesFeed();
  }, []);

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

      {wavesFeed.length === 0 && (
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
        <div key={index}>
          <Post post={post} username={post.ProfileEntryResponse.Username} />
        </div>
      ))}
    </>
  );
};
