import {
  createUserAssociation,
  deleteUserAssociation,
  getUserAssociations,
  getProfiles,
  identity,
} from 'deso-protocol';
import { useEffect, useState, useContext, useRef } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import {
  Text,
  Paper,
  Center,
  Space,
  Container,
  Button,
  Group,
  Box,
  Avatar,
  UnstyledButton,
  ActionIcon,
  TextInput,
  useMantineTheme,
  Modal,
  Divider,
  Title,
} from '@mantine/core';
import { GiWaveCrest } from 'react-icons/gi';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { IconX, IconCheck, IconPlus, IconSearch } from '@tabler/icons-react';
import { BiSearchAlt } from 'react-icons/bi';
import classes from '@/components/Spotlight/Spotlight.module.css';
import { useDisclosure } from '@mantine/hooks';
import { HiMiniUserPlus } from 'react-icons/hi2';

export default function CloseFriendsList() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [closeFriends, setCloseFriends] = useState([]);
  const [value, setValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();

  const SearchUser = async () => {
    const request = {
      UsernamePrefix: value,
      NumToFetch: 10,
    };

    const response = await getProfiles(request);
    setSearchResults(response.ProfilesFound);
  };

  const handleInputChange = (event) => {
    setValue(event.currentTarget.value);
    SearchUser();
  };

  const getCloseFriends = async () => {
    try {
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

      setCloseFriends(matchedAssociations);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getCloseFriends();
    }
  }, [currentUser]);

  // Add Close Friend
  const handleAddCloseFriend = async (pubkey, username) => {
    try {
      await createUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: pubkey,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: `${username} added to Close Friends!`,
      });

      getCloseFriends();
      close();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      console.error('Error submitting heart:', error);
    }
  };

  // Remove Bookmark Post
  const handleRemoveCloseFriend = async (id, pubkey, username) => {
    try {
      await deleteUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: pubkey,
        AssociationID: id,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: `${username} removed from Close Friends!`,
      });

      getCloseFriends();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      console.error('Error submitting heart:', error);
    }
  };
  return (
    <>
      <Center>
        <Title order={3}>Close Friends</Title>
      </Center>
      <Divider />

      <Space h="lg" />
      <Modal opened={opened} onClose={close} title="Add Close Friends">
        <Container>
          <TextInput
            value={value}
            onChange={handleInputChange}
            radius="md"
            size="md"
            placeholder="Search"
            leftSection={<BiSearchAlt size="1.2rem" />}
            rightSection={
              value && (
                <ActionIcon
                  onClick={() => {
                    setValue('');
                  }}
                  size={32}
                  radius="xl"
                  color={theme.primaryColor}
                  variant="light"
                >
                  <IconX size="1.1rem" />
                </ActionIcon>
              )
            }
            rightSectionWidth={42}
          />
        </Container>
        <Space h="md" />

        {value && searchResults.length > 0 && (
          <div>
            {searchResults.map((profile) => (
              <UnstyledButton
                className={classes.user}
                onClick={() => {
                  handleAddCloseFriend(profile.PublicKeyBase58Check, profile.Username);
                }}
              >
                <Group>
                  <Avatar
                    src={
                      `https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
                      null
                    }
                    radius="xl"
                  />

                  <div>
                    <Text size="sm" fw={500}>
                      {profile?.ExtraData?.DisplayName || profile.Username}
                    </Text>

                    <Text c="dimmed" size="xs">
                      @{profile.Username}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            ))}
          </div>
        )}
      </Modal>

      <Container>
        {!currentUser ? (
          <>
            <Space h="xl" />
            <Container size="30rem" px={0}>
              <Paper shadow="xl" p="lg" withBorder>
                <Center>
                  <Text c="dimmed" fw={700}>
                    Please Sign Up or Sign In to view your Close Friends.
                  </Text>
                </Center>
                <Space h="md" />
                <Center>
                  <Button
                    fullWidth
                    leftSection={<GiWaveCrest size="1rem" />}
                    variant="gradient"
                    gradient={{ from: 'cyan', to: 'indigo' }}
                    onClick={() => identity.login()}
                  >
                    Sign Up
                  </Button>
                  <Space w="xs" />
                  <Button fullWidth variant="default" onClick={() => identity.login()}>
                    Sign In
                  </Button>
                </Center>
              </Paper>
            </Container>
          </>
        ) : (
          <>
            <Group justify="right">
              <ActionIcon onClick={open} variant="light" size="xl" radius="xl">
                <HiMiniUserPlus size="1.5rem" />
              </ActionIcon>
            </Group>
            <Center>
              <Container w={444}>
                {closeFriends && closeFriends.length > 0 ? (
                  // Render close friends' information
                  closeFriends.map((friend) => (
                    <>
                      <Paper
                        shadow="xl"
                        radius="md"
                        withBorder
                        p="sm"
                        key={friend.matchingProfile.AssociationID}
                      >
                        <Group justify="space-between">
                          <UnstyledButton
                            component={Link}
                            href={`/wave/${friend.matchingProfile.Username}`}
                          >
                            <Group style={{ width: '100%', flexGrow: 1 }}>
                              <Avatar
                                size="lg"
                                radius="sm"
                                src={
                                  friend.matchingProfile.ExtraData?.NFTProfilePictureUrl ||
                                  friend.matchingProfile.ExtraData?.LargeProfilePicURL ||
                                  `https://node.deso.org/api/v0/get-single-profile-picture/${friend.matchingProfile.PublicKeyBase58Check}` ||
                                  null
                                }
                              />
                              <div>
                                <Box maw={222}>
                                  <Text fw={500} size="sm" truncate="end">
                                    {friend.matchingProfile.ExtraData?.DisplayName ||
                                      friend.matchingProfile.Username ||
                                      'Anon'}
                                  </Text>
                                </Box>
                                <Text fw={500} size="xs">
                                  @{friend.matchingProfile.Username || 'Anon'}
                                </Text>
                              </div>
                            </Group>
                          </UnstyledButton>

                          <></>

                          <ActionIcon
                            onClick={() =>
                              handleRemoveCloseFriend(
                                friend.matchingProfile.AssociationID,
                                friend.matchingProfile.PublicKeyBase58Check,
                                friend.matchingProfile.Username
                              )
                            }
                            size="md"
                            variant="light"
                            color="red"
                          >
                            <IconX />
                          </ActionIcon>
                        </Group>
                      </Paper>
                      <Space h="xs" />
                    </>
                  ))
                ) : (
                  <Text ta="center" fw={500} size="sm">
                    Add some close friends!
                  </Text>
                )}
              </Container>
            </Center>
          </>
        )}
      </Container>
    </>
  );
}
