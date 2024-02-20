import { getPostsStateless } from 'deso-protocol';
import { useEffect, useState } from 'react';
import { Container, Space, Paper, Text, Center } from '@mantine/core';
import Post from '@/components/Post';

//Waves Tab Feed Component thats displays all current livestreams
export const WavesFeed = () => {
  const [wavesFeed, setWavesFeed] = useState([]);

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

  useEffect(() => {
    const fetchWavesFeed = async () => {
      try {
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
      } catch (error) {
        console.log('Something went wrong:', error);
      }
    };

    fetchWavesFeed();
  }, []);

  return (
    <>
      {wavesFeed.map((post, index) => (
        <div key={index}>
        <Post post={post} username={post.ProfileEntryResponse.Username} />
        </div>
      ))}

      {wavesFeed.length === 0 && (
        <>
          <Space h="md" />
          <Container size="30rem" px={0}>
            <Paper shadow="xl" p="lg" withBorder>
              <Center>
                <Text size="md" fw={400}>
                  No Waves Right Now.
                </Text>
              </Center>
            </Paper>
          </Container>
          <Space h={222} />
        </>
      )}
    </>
  );
};
