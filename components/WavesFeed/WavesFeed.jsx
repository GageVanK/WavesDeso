import { getPostsStateless } from 'deso-protocol';
import { useEffect, useState } from 'react';
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
        <Post post={post} key={index} username={post.ProfileEntryResponse.Username} />
      ))}
    </>
  );
};
