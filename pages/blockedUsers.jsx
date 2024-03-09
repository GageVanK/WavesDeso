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

export default function BlockList() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [blockList, setBlockList] = useState([]);
  const theme = useMantineTheme();

  const getBlockList = async () => {
    try {
      const didBlock = await getUserAssociations({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'BLOCK',
        AssociationValue: 'BLOCK',
        IncludeTargetUserProfile: true,
      });

      // Initialize an array to store matched associations with related profiles
      const matchedAssociations =
        didBlock.Associations && didBlock.Associations.length > 0
          ? didBlock.Associations.map((association) => {
              try {
                const associationPubKey = association.TargetUserPublicKeyBase58Check;
                const associationId = association.AssociationID;

                // Check if PublicKeyToProfileEntryResponse is an object
                if (didBlock.PublicKeyToProfileEntryResponse) {
                  // Find the profile entry using the public key
                  const matchingProfile = Object.values(
                    didBlock.PublicKeyToProfileEntryResponse
                  ).find((profile) => profile.PublicKeyBase58Check === associationPubKey);

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

      setBlockList(matchedAssociations);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getBlockList();
    }
  }, [currentUser]);

  // Remove Bookmark Post
  const handleUnblock = async (id, pubkey, username) => {
    try {
      await deleteUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: pubkey,
        AssociationID: id,
        AssociationType: 'BLOCK',
        AssociationValue: 'BLOCK',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: `${username} removed from block list!`,
      });

      getBlockList();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      console.error('Error removing block:', error);
    }
  };
  return (
    <>
      <Divider
        my="xs"
        label={
          <>
            <Title order={3}>Block List</Title>
          </>
        }
        labelPosition="center"
      />

      <Space h="lg" />
      <Container>
        {!currentUser ? (
          <>
            <Space h="xl" />
            <Container size="30rem" px={0}>
              <Paper shadow="xl" p="lg" withBorder>
                <Center>
                  <Text c="dimmed" fw={700}>
                    Please Sign Up or Sign In to view your Block List.
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
            <Center>
              <Container w={444}>
                {blockList && blockList.length > 0 ? (
                  // Render close friends' information
                  blockList.map((block) => (
                    <>
                      <Paper
                        shadow="xl"
                        radius="md"
                        withBorder
                        p="sm"
                        key={block.matchingProfile.AssociationID}
                      >
                        <Group justify="space-between">
                          <UnstyledButton
                            component={Link}
                            href={`/wave/${block.matchingProfile.Username}`}
                          >
                            <Group style={{ width: '100%', flexGrow: 1 }}>
                              <Avatar
                                size="lg"
                                radius="sm"
                                src={
                                  block.matchingProfile.ExtraData?.NFTProfilePictureUrl ||
                                  block.matchingProfile.ExtraData?.LargeProfilePicURL ||
                                  `https://node.deso.org/api/v0/get-single-profile-picture/${block.matchingProfile.PublicKeyBase58Check}` ||
                                  null
                                }
                              />
                              <div>
                                <Box maw={222}>
                                  <Text fw={500} size="sm" truncate="end">
                                    {block.matchingProfile.ExtraData?.DisplayName ||
                                      block.matchingProfile.Username ||
                                      'Anon'}
                                  </Text>
                                </Box>
                                <Text fw={500} size="xs">
                                  @{block.matchingProfile.Username || 'Anon'}
                                </Text>
                              </div>
                            </Group>
                          </UnstyledButton>

                          <></>

                          <ActionIcon
                            onClick={() =>
                              handleUnblock(
                                block.matchingProfile.AssociationID,
                                block.matchingProfile.PublicKeyBase58Check,
                                block.matchingProfile.Username
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
                    No Blocked Users
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
