import { getPostsStateless } from 'deso-protocol';
import { useEffect, useState } from 'react';
import { Center, Space, Loader, Button } from '@mantine/core';
import Post from '@/components/Post';

export const HotFeed = () => {
  const [newFeed, setNewFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeenPostHash, setLastSeenPostHash] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNewFeed = async () => {
    try {
      setIsLoading(true);
      const newFeedData = await getPostsStateless({
        NumToFetch: 25,
        OrderBy: 'newest',
      });

      setNewFeed(newFeedData.PostsFound);
      setLastSeenPostHash(newFeedData.PostsFound[newFeedData.PostsFound.length - 1].PostHashHex);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user newFeedData:', error);
    }
  };

  const fetchMoreNewFeed = async () => {
    try {
      setIsLoadingMore(true);
      const morePostsData = await getPostsStateless({
        NumToFetch: 25,
        PostHashHex: lastSeenPostHash,
        OrderBy: 'newest',
      });
      if (morePostsData.PostsFound.length > 0) {
        setNewFeed((prevPosts) => [...prevPosts, ...morePostsData.PostsFound]);
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
            {newFeed
              .filter((post) => post.ProfileEntryResponse?.Username !== 'BirthBlockNFT')
              .map((post) => (
                <Post
                  post={post}
                  username={post.ProfileEntryResponse?.Username}
                  key={post.PostHashHex}
                />
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
