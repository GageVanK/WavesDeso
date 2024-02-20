import {
  Avatar,
  Paper,
  Group,
  Text,
  Card,
  Space,
  Center,
  Divider,
  Image,
  Tabs,
  Tooltip,
  Container,
  createStyles,
  ActionIcon,
  Collapse,
  Button,
  Modal,
  FileButton,
  TextInput,
  Textarea,
  rem,
  Stack,
} from '@mantine/core';
import { useState, useContext, useEffect } from 'react';
import { getSingleProfile, updateProfile, uploadImage } from 'deso-protocol';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconSettings, IconWorldWww, IconX } from '@tabler/icons-react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import classes from '../pages/wave/wave.module.css';
import { notifications } from '@mantine/notifications';

function validateTwitchURL(url) {
  const twitchURLPattern = /^(https?:\/\/)?(www\.)?twitch\.tv\/[a-zA-Z0-9_]+$/;
  const isValid = twitchURLPattern.test(url);
  return isValid ? url : setTwitchURL('');
}

function validateYtURL(url) {
  const youtubeURLPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/@([a-zA-Z0-9_]+)$/;
  const isValid = youtubeURLPattern.test(url);
  return isValid ? url : setYtURL('');
}

function validateIgURL(url) {
  const instagramURLPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_]+$/;
  const isValid = instagramURLPattern.test(url);
  return isValid ? url : setIgURL('');
}

function validateXURL(url) {
  const xURLPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+$/;
  const isValid = xURLPattern.test(url);
  return isValid ? url : setXURL('');
}

export function UpdateProfile() {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [xURL, setXURL] = useState('');
  const [ytURL, setYtURL] = useState('');
  const [igURL, setIgURL] = useState('');
  const [twitchURL, setTwitchURL] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImageURL, setCoverImageURL] = useState('');
  const [uploadCover, setUploadCover] = useState(false);

  const handleUploadCoverImage = async () => {
    if (uploadCover) {
      return; // Exit if upload has already been initiated
    }
    setUploadCover(true);

    try {
      const response = await uploadImage({
        UserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        file: coverImageFile,
      });

      setCoverImageURL(response.ImageURL);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Uploaded!',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.log('Something happened: ' + error);
    }
  };

  useEffect(() => {
    if (coverImageFile) {
      handleUploadCoverImage();
    }
  }, [coverImageFile]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarURL, setAvatarURL] = useState('');
  const [uploadAvatar, setUploadAvatar] = useState(false);

  const handleUploadAvatar = async () => {
    if (uploadAvatar) {
      return; // Exit if upload has already been initiated
    }
    setUploadAvatar(true);

    try {
      const response = await uploadImage({
        UserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        file: avatarFile,
      });

      setAvatarURL(response.ImageURL);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Uploaded!',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.log('Something happened: ' + error);
    }
  };

  useEffect(() => {
    if (avatarFile) {
      handleUploadAvatar();
    }
  }, [avatarFile]);

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: newUsername ? newUsername : '',
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: newBio ? newBio : '',
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {},
      };

      if (avatarURL) updateData.ExtraData.LargeProfilePicURL = avatarURL;
      if (coverImageURL) updateData.ExtraData.FeaturedImageURL = coverImageURL;
      if (displayName) updateData.ExtraData.DisplayName = displayName;
      if (location) updateData.ExtraData.Location = location;
      if (xURL) updateData.ExtraData.XURL = validateXURL(xURL);
      if (ytURL) updateData.ExtraData.YoutubeURL = validateYtURL(ytURL);
      if (igURL) updateData.ExtraData.InstagramURL = validateIgURL(igURL);
      if (twitchURL) updateData.ExtraData.TwitchURL = validateTwitchURL(twitchURL);

      await updateProfile(updateData);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Profile Updated! Refresh to see changes!',
      });

      window.location.reload();
    } catch (error) {
      notifications.show({
        title: 'Error Updating Profile',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: { Error },
      });
    }
  };

  return (
    <>
      <Button variant="subtle" size="compact-sm" onClick={open}>
        <IconSettings />
      </Button>

      <Modal
        centered
        opened={opened}
        onClose={close}
        title={
          <Text fw={777} size="lg">
            Update Profile
          </Text>
        }
      >
        <Paper radius="sm">
          <Text fw={555} size="sm">
            Cover Photo
          </Text>
          <FileButton
            onChange={setCoverImageFile}
            accept="image/png,image/jpeg,image/png,image.gif,image/webp"
            type="button"
          >
            {(props) => (
              <Tooltip position="bottom-start" label="Upload New Cover Photo" zIndex={1111111}>
                <Image
                  alt="Cover Image"
                  src={
                    coverImageURL ||
                    currentUser.ProfileEntryResponse?.ExtraData?.FeaturedImageURL ||
                    null
                  }
                  height={100}
                  fallbackSrc="https://images.deso.org/4903a46ab3761c5d8bd57416ff411ff98b24b35fcf5480dde039eb9bae6eebe0.webp"
                  {...props}
                />
              </Tooltip>
            )}
          </FileButton>

          <Space h="md" />

          <Text fw={555} size="sm">
            Profile Picture
          </Text>
          <Center>
            <FileButton
              onChange={setAvatarFile}
              accept="image/png,image/jpeg,image/png,image.gif,image/webp"
              type="button"
            >
              {(props) => (
                <Tooltip position="bottom" label="Upload New Avatar">
                  <Avatar
                    mx="auto"
                    className={classes.avatar}
                    size={80}
                    radius={80}
                    src={
                      avatarURL ||
                      currentUser.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                      null
                    }
                    alt="Profile Picture"
                    {...props}
                  />
                </Tooltip>
              )}
            </FileButton>
          </Center>

          <Stack>
            <TextInput
              type="text"
              label="Username"
              value={newUsername}
              placeholder="New username"
              onChange={async (e) => {
                setNewUsername(e.target.value);
                e.preventDefault();

                let regex = /^[a-zA-Z0-9_]*$/;
                if (!regex.test(e.target.value)) {
                  setErrorMessage('Username cannot contain special characters');
                  setIsButtonDisabled(true);
                } else {
                  setErrorMessage('');

                  try {
                    const request = {
                      PublicKeyBase58Check: '',
                      Username: e.target.value,
                      NoErrorOnMissing: true,
                    };

                    try {
                      const userFound = await getSingleProfile(request);

                      if (userFound === null) {
                        setErrorMessage('');
                        setIsButtonDisabled(false);
                      } else {
                        setErrorMessage('Username is not available');
                        setIsButtonDisabled(true);
                      }
                    } catch (error) {
                      setIsButtonDisabled(true);
                      setErrorMessage('');
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              }}
              error={errorMessage}
            />

            <TextInput
              type="text"
              label="Display Name"
              placeholder="New display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.currentTarget.value)}
            />

            <Textarea
              type="text"
              label="Bio"
              placeholder="Whats your wave?"
              autosize
              value={newBio}
              onChange={(event) => setNewBio(event.currentTarget.value)}
            />

            <TextInput
              type="text"
              label="Location"
              placeholder="Where are you from?"
              value={location}
              onChange={(event) => setLocation(event.currentTarget.value)}
            />

            <TextInput
              type="text"
              label="Twitch"
              leftSection={
                <Avatar
                  radius="sm"
                  size="sm"
                  src="https://pbs.twimg.com/profile_images/1328847897933320197/7w2ufMZn_400x400.png"
                />
              }
              value={twitchURL}
              onChange={(event) => setTwitchURL(event.currentTarget.value)}
            />

            <TextInput
              type="text"
              label="Youtube"
              leftSection={
                <Avatar
                  radius="sm"
                  size="sm"
                  src="https://pbs.twimg.com/profile_images/1427292844612595720/RC1YSvuT_400x400.jpg"
                />
              }
              value={ytURL}
              onChange={(event) => setYtURL(event.currentTarget.value)}
            />

            <TextInput
              type="text"
              label="X"
              leftSection={
                <Avatar
                  radius="sm"
                  size="sm"
                  src="https://pbs.twimg.com/profile_images/1683899100922511378/5lY42eHs_400x400.jpg"
                />
              }
              value={xURL}
              onChange={(event) => setXURL(event.currentTarget.value)}
            />

            <TextInput
              type="text"
              label="Instagram"
              leftSection={
                <Avatar
                  radius="sm"
                  size="sm"
                  src="https://pbs.twimg.com/profile_images/1526231349354303489/3Bg-2ZsT_400x400.jpg"
                />
              }
              value={igURL}
              onChange={(event) => setIgURL(event.currentTarget.value)}
            />
          </Stack>

          <Space h="md" />

          <Group justify="right">
            <Button onClick={handleUpdateProfile}>Update</Button>
          </Group>
        </Paper>
      </Modal>
    </>
  );
}
