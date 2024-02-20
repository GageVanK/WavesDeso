import { getPostsForUser, getUserAssociations } from 'deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { Loader, Center, Text, Paper, Space, Container } from '@mantine/core';
import Post from '@/components/Post';

export default function CloseFriendFeed() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [closeFriendsFeed, setCloseFriendsFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCloseFriendsFeed = async () => {
    try {
      setIsLoading(true);
      const didCF = await getUserAssociations({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        IncludeTargetUserProfile: true,
      });

      // Initialize an array to store matched associations with related profiles
      const matchedAssociations =
        didCF.Associations && didCF.Associations.length > 0
          ? didCF.Associations.map((association) => {
              try {
                const associationPubKey = association.TargetUserPublicKeyBase58Check;
                const associationId = association.AssociationID;

                // Check if PublicKeyToProfileEntryResponse is an object
                if (didCF.PublicKeyToProfileEntryResponse) {
                  // Find the profile entry using the public key
                  const matchingProfile = Object.values(didCF.PublicKeyToProfileEntryResponse).find(
                    (profile) => profile.PublicKeyBase58Check === associationPubKey
                  );

                  // Check if a matching profile was found
                  if (matchingProfile) {
                    // Add the associationId to the matching profile
                    matchingProfile.AssociationID = associationId;

                    return { matchingProfile };
                  }
                }
              } catch (error) {
                console.error('Error processing association:', association);
                console.error('Error details:', error);
              }

              return null; // Return null for associations that couldn't be processed
            }).filter(Boolean) // Filter out null values
          : [];

      // Iterate through matchedAssociations
      // Fetch posts for all users concurrently
      const fetchPostsPromises = matchedAssociations.map(async ({ matchingProfile }) => {
        try {
          // Fetch posts for the user
          const postData = await getPostsForUser({
            Username: matchingProfile?.Username,
            NumToFetch: 10,
          });

          // Replace existing ProfileEntryResponse with matchingProfile
          const postsWithProfile = postData.Posts.map((post) => {
            post.ProfileEntryResponse = matchingProfile;
            return post;
          });

          return postsWithProfile;
        } catch (error) {
          console.error('Error fetching posts for user:', matchingProfile?.Username);
          console.error('Error details:', error);
          return []; // Return empty array in case of error
        }
      });

      // Wait for all fetch operations to complete
      try {
        const closeFriendsPostsArrays = await Promise.all(fetchPostsPromises);

        // Flatten the array of arrays into a single array of posts
        const closeFriendsPosts = closeFriendsPostsArrays.flat();

        // Sort the posts based on TimestampNanos in descending order (latest to oldest)
        closeFriendsPosts.sort((postA, postB) => postB.TimestampNanos - postA.TimestampNanos);
        // Set the state with closeFriendsPosts
        setCloseFriendsFeed(closeFriendsPosts);

        setIsLoading(false);

        // Now you have all the posts for close friends with updated profiles
        console.log('Close friends posts:', closeFriendsPosts);
      } catch (error) {
        console.error('Error fetching posts for close friends:', error);
      }
    } catch (error) {
      console.error('Error fetching close friends feed:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getCloseFriendsFeed();
    }
  }, [currentUser]);

  return (
    <>
      {isLoading ? (
        <Center>
          <Loader size="sm" />
        </Center>
      ) : (
        <>
          {currentUser && closeFriendsFeed.length > 0 ? (
            closeFriendsFeed.map((post, index) => (
              // Render each post here
              <Post
                post={post}
                key={index}
                username={post.ProfileEntryResponse?.Username || 'Anon'}
              />
            ))
          ) : (
            <>
              <Space h="md" />
              <Container size="30rem" px={0}>
                <Paper shadow="xl" p="lg" withBorder>
                  <Center>
                    <Text size="md" fw={400}>
                      Add Close Friends to View Your Close Friends Feed.
                    </Text>
                  </Center>
                </Paper>
              </Container>
              <Space h={222} />
            </>
          )}
        </>
      )}
    </>
  );
}
