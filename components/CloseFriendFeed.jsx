import { getPostsForUser, getUserAssociations } from 'deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { Loader, Center, Text } from '@mantine/core';
import Post from '@/components/Post';

export default function CloseFriendFeed() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [closeFriendsFeed, setCloseFriendsFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Function to shuffle an array (Fisher-Yates algorithm)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

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

      // Array to store close friends' posts
      const closeFriendsPosts = [];

      // Iterate through matchedAssociations

      // Iterate through matchedAssociations
      for (const { matchingProfile } of matchedAssociations) {
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

          // Add posts to the closeFriendsPosts array
          closeFriendsPosts.push(...postsWithProfile);
        } catch (error) {
          console.error('Error fetching posts for user:', matchingProfile?.Username);
          console.error('Error details:', error);
        }
      }

      // Randomize the order of posts in closeFriendsPosts
      shuffleArray(closeFriendsPosts);

      // Set the state with closeFriendsPosts
      setCloseFriendsFeed(closeFriendsPosts);

    
      setIsLoading(false);
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
            <Text ta="center" size="sm" fw={500}>
              Add some close friends to see their posts!
            </Text>
          )}
        </>
      )}
    </>
  );
}
