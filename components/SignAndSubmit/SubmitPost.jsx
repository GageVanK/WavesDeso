import {
  updateProfile,
  identity,
  submitPost,
  getSingleProfile,
  uploadImage,
  getProfiles,
  getAppState,
  createNFT,
  createPostAssociation,
} from 'deso-protocol';
import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import classes from './SubmitPost.module.css';
import { RiImageAddFill } from 'react-icons/ri';
import { TbVideoPlus } from 'react-icons/tb';
import {
  Switch,
  Stack,
  UnstyledButton,
  AspectRatio,
  Button,
  Center,
  Space,
  Divider,
  Text,
  Textarea,
  Group,
  HoverCard,
  Avatar,
  Container,
  Tooltip,
  Badge,
  TextInput,
  FileButton,
  ActionIcon,
  Image,
  NumberInput,
  rem,
  Notification,
  List,
  Box,
  useMantineTheme,
  Checkbox,
  SimpleGrid,
} from '@mantine/core';
import { GiWaveCrest } from 'react-icons/gi';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { Player, useCreateAsset } from '@livepeer/react';
import { ImEmbed } from 'react-icons/im';
import { IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { FaPoll } from 'react-icons/fa';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { MdDeleteForever } from 'react-icons/md';
import { CgPlayListAdd } from 'react-icons/cg';
import { BiSearchAlt } from 'react-icons/bi';
import {
  getEmbedHeight,
  getEmbedURL,
  getEmbedWidth,
  isValidEmbedURL,
} from '../../helpers/EmbedUrls';
import { Carousel } from '@mantine/carousel';

export const SignAndSubmitTx = ({ close }) => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState([]);
  const resetImageRef = useRef(null);
  const resetVideoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [bodyText, setBodyText] = useState('');
  const [poll, setPoll] = useState(false);
  const [embed, setEmbed] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [checkedNft, setCheckedNft] = useState(false);
  const [uploadInitiated, setUploadInitiated] = useState(false);
  const [checkedAutoPost, setCheckedAutoPost] = useState(false);
  const [emote, setEmote] = useState(false);
  const theme = useMantineTheme();
  // NFT Stuff
  const [nftCopies, setNftCopies] = useState(1);
  const [creatorRoyaltyPercentage, setCreatorRoyaltyPercentage] = useState(0);
  const [coinHolderRoyaltyPercentage, setCoinHolderRoyaltyPercentage] = useState(0);
  const [checked, setChecked] = useState(false);
  const [price, setPrice] = useState();
  const [extraCreatorRoyalties, setExtraCreatorRoyalties] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [value, setValue] = useState('');
  const [desoUSD, setDesoUSD] = useState();

  // Get Deso USD Value for Conversion/UI during minting
  const getDesoUSD = async () => {
    try {
      const appState = await getAppState({
        PublicKeyBase58Check: 'BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD',
      });
      const desoUSDValue = appState.USDCentsPerDeSoCoinbase / 100;

      setDesoUSD(desoUSDValue);
    } catch (error) {
      console.error('Error in getData:', error);
    }
  };

  // Call on mount
  useEffect(() => {
    getDesoUSD();
  }, []);

  // Convert percentage user input to basis points for minting
  const convertToBasisPoints = (percentage) => {
    const basisPoints = percentage * 100;
    return basisPoints;
  };

  // Convert DESO to nanos for minting
  const convertDESOToNanos = (deso) => {
    const nanoToDeso = 0.000000001;
    const nanos = Math.round(deso / nanoToDeso);
    return Number(nanos);
  };

  // Convert DESO to USD for minting
  const convertDESOToUSD = (deso) => {
    let usdValue = deso * desoUSD;
    if (usdValue < 0.01) {
      usdValue = 0.01;
    }

    return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Search for users to add for royalties
  const SearchUser = async () => {
    const request = {
      UsernamePrefix: value,
      NumToFetch: 10,
    };

    const response = await getProfiles(request);
    setSearchResults(response.ProfilesFound);
  };

  // Handle input change during search
  const handleInputChange = (event) => {
    setValue(event.currentTarget.value);
    SearchUser();
  };

  // Add selected creator
  const handleAddCreator = (publicKey) => {
    // Add selected creator with default percentage - 10%
    setExtraCreatorRoyalties((prevState) => ({
      ...prevState,
      [publicKey]: convertToBasisPoints(0), // Convert default percentage to basis points
    }));
    // Clear search results and value
    setSearchResults([]);
    setValue('');
  };

  // Handle creator percentage for added creators
  const handleCreatorPercentageChange = (publicKey, updatedPercentage) => {
    setExtraCreatorRoyalties((prevState) => {
      const updatedMap = {
        ...prevState,
        [publicKey]: convertToBasisPoints(updatedPercentage), // Convert updated percentage to basis points
      };

      return updatedMap;
    });
  };

  // Delete creator from royalties
  const deleteExtraCreator = (publicKey) => {
    setExtraCreatorRoyalties((prevState) => {
      const newOptions = { ...prevState };
      delete newOptions[publicKey];
      return newOptions;
    });
  };

  const handlePollOptions = (index, value) => {
    // Create a new array with the same values, but with the updated value at the specified index
    const newOptions = [...pollOptions];
    newOptions[index] = value;

    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']); // Add a new empty option
  };

  const deletePollOption = (index) => {
    const newOptions = pollOptions.filter((_, idx) => idx !== index);
    setPollOptions(newOptions);
  };

  const pollToggle = () => {
    if (poll) {
      setPoll(false);
    } else {
      setPoll(true);
    }
  };

  const embedToggle = () => {
    if (embed) {
      setEmbed(false);
    } else {
      setEmbed(true);
    }
  };

  const handleEmbedLink = (e) => {
    const link = e.target.value;

    if (link.trim().length > 0) {
      const response = getEmbedURL(link);
      const isValid = isValidEmbedURL(response);
      if (isValid) {
        setEmbedUrl(response);
      } else {
        setEmbedUrl(null);
      }
    }
  };

  const {
    mutate: createAsset,
    data: asset,
    status,
    progress,
    error,
  } = useCreateAsset(
    video
      ? {
          sources: [{ name: video.name, file: video }],
        }
      : null
  );

  const isVideoLoading = useMemo(
    () => status === 'loading' || (asset?.[0] && asset[0].status?.phase !== 'ready'),
    [status, asset]
  );

  const progressFormatted = useMemo(
    () =>
      progress?.[0].phase === 'failed'
        ? 'Failed to process video.'
        : progress?.[0].phase === 'waiting'
        ? 'Waiting...'
        : progress?.[0].phase === 'uploading'
        ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
        : progress?.[0].phase === 'processing'
        ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
        : null,
    [progress]
  );

  const handleUploadImage = async () => {
    if (uploadInitiated) {
      return; // Exit if upload has already been initiated
    }
    setUploadInitiated(true);

    try {
      setImageLoading(true);
      const response = await uploadImage({
        UserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        file: imageFile,
      });

      setImageURL((prevURLs) => [...prevURLs, response.ImageURL]); // Append new URL to array
      setImageLoading(false);
      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Uploaded!',
      });
    } catch (error) {
      setImageLoading(false);
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.log(`Something happened: ${error}`);
    } finally {
      setUploadInitiated(false);
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    setImageURL((prevURLs) => prevURLs.filter((url) => url !== urlToRemove));
  };

  useEffect(() => {
    if (imageFile) {
      handleUploadImage(); // Automatically trigger upload when imageFile is set
    }
  }, [imageFile]); // This effect runs whenever imageFile changes

  useEffect(() => {
    if (video) {
      createAsset(); // Call createAsset function when videoFile is set
    }
  }, [video]);

  const handleUpdateUsername = async () => {
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: newUsername,
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: '',
        NewStakeMultipleBasisPoints: 12500,
      });
    } catch (error) {
      console.log(`something happened: ${error}`);
    }

    window.location.reload();
  };

  const handleCreatePost = async () => {
    try {
      setIsLoadingPost(true);
      // check if the user can make a post
      if (
        !identity.hasPermissions({
          TransactionCountLimitMap: {
            SUBMIT_POST: 1,
          },
        })
      ) {
        // if the user doesn't have permissions, request them
        // and abort the submit
        identity.requestPermissions({
          GlobalDESOLimit: 10000000, // 0.01 DESO
          TransactionCountLimitMap: {
            SUBMIT_POST: 3,
          },
        });
        return;
      }

      // Filter out empty or whitespace-only options
      const validPollOptions = pollOptions.filter((option) => option.trim() !== '');

      const resp = await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: bodyText,
          ImageURLs: imageURL,
          VideoURLs:
            video && asset && asset[0]?.playbackId
              ? [`https://lvpr.tv/?v=${asset[0].playbackId}`]
              : [],
        },
        PostExtraData: {
          EmbedVideoURL: embedUrl || '',
          PollOptions: validPollOptions.length >= 2 ? JSON.stringify(validPollOptions) : null,
          PollWeightType: validPollOptions.length >= 2 ? 'unweighted' : null,
        },
      });

      if (checkedNft && resp?.submittedTransactionResponse?.PostEntryResponse) {
        const request = {
          UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          NFTPostHashHex: resp?.submittedTransactionResponse?.PostEntryResponse?.PostHashHex,
          NumCopies: nftCopies,
          NFTRoyaltyToCreatorBasisPoints: convertToBasisPoints(creatorRoyaltyPercentage),
          NFTRoyaltyToCoinBasisPoints: convertToBasisPoints(coinHolderRoyaltyPercentage),
          MinBidAmountNanos: convertDESOToNanos(price),
          BuyNowPriceNanos: checked ? convertDESOToNanos(price) : undefined,
          IsBuyNow: checked,
          AdditionalDESORoyaltiesMap: extraCreatorRoyalties || undefined,
          HasUnlockable: false,
          IsForSale: true,
          MinFeeRateNanosPerKB: 1000,
        };

        await createNFT(request);
      }

      if (emote && resp?.submittedTransactionResponse?.PostEntryResponse) {
        await createPostAssociation({
          TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          PostHashHex: resp?.submittedTransactionResponse?.PostEntryResponse?.PostHashHex,
          AssociationType: 'EMOTE',
          AssociationValue: `${currentUser.ProfileEntryResponse?.Username}'s Emote`,
          MinFeeRateNanosPerKB: 1000,
        });
      }

      setIsLoadingPost(false);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Post was successfully submitted!',
      });

      setBodyText('');
      if (imageURL) {
        setImageURL('');
        setImageFile(null);
        resetImageRef.current?.();
      }
      if (embedUrl) {
        setEmbedUrl('');
        setEmbed(false);
      }
      if (video) {
        setVideo(null);
        resetVideoRef.current?.();
      }

      if (pollOptions && pollOptions.length > 1) {
        setPollOptions(['', '']);
        setPoll(false);
      }

      if (checkedAutoPost) {
        setCheckedAutoPost(false);
      }

      if (checkedNft) {
        setCheckedNft(false);
        setNftCopies(1);
        setCreatorRoyaltyPercentage(0);
        setCoinHolderRoyaltyPercentage(0);
        setExtraCreatorRoyalties({});
        setPrice(undefined);
      }

      if (checked) {
        checked(false);
      }

      if (emote) {
        setEmote(false);
      }

      if (typeof close === 'function') {
        close();
      }
    } catch (err) {
      console.log(`something happened: ${err}`);
    }
  };

  const handleCreateAutoPost = async () => {
    try {
      const resp = await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: bodyText || `${currentUser.ProfileEntryResponse?.Username}'s Video`,
          VideoURLs:
            video && asset && asset[0]?.playbackId
              ? [`https://lvpr.tv/?v=${asset[0].playbackId}`]
              : [],
        },
      });

      if (checkedNft && resp?.submittedTransactionResponse?.PostEntryResponse) {
        const request = {
          UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          NFTPostHashHex: resp?.submittedTransactionResponse?.PostEntryResponse?.PostHashHex,
          NumCopies: nftCopies,
          NFTRoyaltyToCreatorBasisPoints: convertToBasisPoints(creatorRoyaltyPercentage),
          NFTRoyaltyToCoinBasisPoints: convertToBasisPoints(coinHolderRoyaltyPercentage),
          MinBidAmountNanos: convertDESOToNanos(price),
          BuyNowPriceNanos: checked ? convertDESOToNanos(price) : undefined,
          IsBuyNow: checked,
          AdditionalDESORoyaltiesMap: extraCreatorRoyalties || undefined,
          HasUnlockable: false,
          IsForSale: true,
          MinFeeRateNanosPerKB: 1000,
        };

        await createNFT(request);
      }

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Post was successfully submitted!',
      });

      setBodyText('');
      setCheckedAutoPost(false);

      if (video) {
        setVideo(null);
        resetVideoRef.current?.();
      }

      if (checkedNft) {
        setCheckedNft(false);
        setNftCopies(1);
        setCreatorRoyaltyPercentage(0);
        setCoinHolderRoyaltyPercentage(0);
        setExtraCreatorRoyalties({});
        setPrice(undefined);
      }

      if (checked) {
        checked(false);
      }
    } catch (err) {
      console.log(`something happened: ${err}`);
    }
  };

  useEffect(() => {
    if (checkedAutoPost && !isVideoLoading) {
      handleCreateAutoPost();
    }
  }, [checkedAutoPost, isVideoLoading]);

  if (!currentUser || !currentUser.BalanceNanos) {
    return (
      <>
        <Center>
          <Text
            fz={66}
            fw={900}
            fs="italic"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 176 }}
          >
            Waves
          </Text>
        </Center>
        <Container size={560} p={0}>
          <Center>
            <Text fw={700} size="md">
              Twitch Meets Twitter
            </Text>
          </Center>

          <Space h="xl" />
          <Button
            gradient={{ from: 'blue', to: 'cyan', deg: 354 }}
            fullWidth
            leftSection={<GiWaveCrest size="1rem" />}
            variant="gradient"
            radius="sm"
            onClick={() => identity.login()}
          >
            Sign Up
          </Button>
        </Container>
        <Space h="md" />

        <Group>
          <Avatar size="md" radius="xl" alt="Profile Picture" />
          <Text fz="lg" fw={777} variant="gradient" truncate="end" />
        </Group>
        <Space h="sm" />
        <Textarea
          disabled
          name="body"
          radius="md"
          autosize
          placeholder="Sign In or Sign Up to Create!"
          size="md"
        />
        <Space h="sm" />
        <Group postion="apart">
          <Tooltip label="Sign In or Sign Up to Create!">
            <Button
              raduis="sm"
              data-disabled
              sx={{ '&[data-disabled]': { pointerEvents: 'all' } }}
              onClick={(event) => event.preventDefault()}
            >
              Create
            </Button>
          </Tooltip>
        </Group>
      </>
    );
  }
  if (currentUser.ProfileEntryResponse === null) {
    return (
      <>
        <Center>
          <Badge
            size="md"
            radius="sm"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
          >
            Enter Username
          </Badge>

          <Space h="xs" />
        </Center>
        <Group justify="center" grow>
          <TextInput
            type="text"
            label="Username"
            value={newUsername}
            placeholder="New username"
            onChange={async (e) => {
              setNewUsername(e.target.value);
              e.preventDefault();

              const regex = /^[a-zA-Z0-9_]*$/;
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
                  } catch (err) {
                    setIsButtonDisabled(true);
                    setErrorMessage('');
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }}
            error={errorMessage}
          />
        </Group>

        <Space h="sm" />

        <Group justify="right">
          <Button disabled={isButtonDisabled} onClick={handleUpdateUsername}>
            Update
          </Button>
        </Group>
      </>
    );
  }
  return (
    <>
      <Group>
        <Avatar
          size="lg"
          radius="sm"
          src={`https://node.deso.org/api/v0/get-single-profile-picture/${currentUser?.PublicKeyBase58Check}`}
          alt="Profile Picture"
        />
        <Text fz="lg" fw={500} truncate="end">
          {currentUser.ProfileEntryResponse?.ExtraData?.DisplayName ||
            currentUser.ProfileEntryResponse?.Username ||
            currentUser.PublicKeyBase58Check}
        </Text>
      </Group>
      <Space h="sm" />
      <Textarea
        name="body"
        radius="md"
        placeholder="Announce your next Wave!"
        autosize
        minRows={2}
        value={bodyText}
        onChange={(event) => setBodyText(event.currentTarget.value)}
      />
      <Space h="sm" />
      {imageURL.length > 0 && (
        <div>
          <Group justify="space-between">
            <Checkbox
              checked={emote}
              onChange={(event) => setEmote(event.currentTarget.checked)}
              label="Post as Emote"
              size="xs"
              radius="xl"
            />
          </Group>
          <Space h="xs" />

          <Carousel
            withIndicators
            loop
            classNames={{
              root: classes.carousel,
              controls: classes.carouselControls,
              indicator: classes.carouselIndicator,
            }}
          >
            {imageURL?.map((url, index) => (
              <Carousel.Slide key={index}>
                <Box style={{ position: 'relative', width: '100%' }}>
                  <AspectRatio ratio={16 / 9} mx="auto">
                    <Image
                      src={url}
                      alt={`Uploaded Image ${index}`}
                      maw={240}
                      mx="auto"
                      radius="md"
                    />
                  </AspectRatio>

                  <Group
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                    }}
                  >
                    <ActionIcon
                      type="button"
                      onClick={() => {
                        handleRemoveImage(url);
                        setImageFile(null);
                        resetImageRef.current?.();
                      }}
                      size="xs"
                      color="red"
                    >
                      <IconX />
                    </ActionIcon>
                  </Group>
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      )}

      {error?.message && (
        <>
          <Notification
            withCloseButton={false}
            withBorder
            icon={<IconX size="1.1rem" />}
            color="red"
          >
            Trouble Uploading Video! {error.message}
          </Notification>
        </>
      )}

      {video && asset?.[0]?.playbackId && (
        <>
          <div>
            <ActionIcon
              type="button"
              onClick={() => {
                setVideo(null);

                resetVideoRef.current?.();
              }}
              size="xs"
              color="red"
            >
              <IconX />
            </ActionIcon>
          </div>
          <Player
            priority
            controls
            showPipButton
            theme={{
              colors: {
                loading: '#3cdfff',
              },
            }}
            title={asset[0].name}
            playbackId={asset[0].playbackId}
          />
          <Space h="xs" />
        </>
      )}

      {progressFormatted && (
        <>
          <Group>
            <Text fz="sm" c="dimmed">
              {progressFormatted}
            </Text>

            <Checkbox
              checked={checkedAutoPost}
              onChange={(event) => setCheckedAutoPost(event.currentTarget.checked)}
              description="Autopost"
              size="xs"
              radius="xl"
            />
          </Group>

          <Space h="xs" />
        </>
      )}

      {embedUrl && (
        <>
          <div>
            <ActionIcon type="button" onClick={() => setEmbedUrl('')} size="xs" color="red">
              <IconX />
            </ActionIcon>
          </div>

          <iframe
            title="extraembed-video"
            id="embed-iframe"
            className="w-full flex-shrink-0 feed-post__image"
            height={getEmbedHeight(embedUrl)}
            style={{ maxWidth: getEmbedWidth(embedUrl) }}
            src={embedUrl}
            frameBorder="0"
            allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;"
            allowFullScreen
          />

          <Space h="xs" />
        </>
      )}

      {embed && (
        <>
          <Space h="xs" />
          <Box w={222}>
            <TextInput
              leftSection={
                <>
                  <Tooltip
                    label={
                      <>
                        <Group justify="center">Supported</Group>

                        <Divider />

                        <List size="xs">
                          <List.Item>Twitch</List.Item>
                          <List.Item>Youtube</List.Item>
                          <List.Item>Spotify</List.Item>
                          <List.Item>Vimeo</List.Item>
                          <List.Item>Giphy</List.Item>
                          <List.Item>SoundCloud</List.Item>
                          <List.Item>Mousai</List.Item>
                          <List.Item>Request more in Global Chat!</List.Item>
                        </List>
                      </>
                    }
                    position="bottom"
                    withArrow
                  >
                    <ActionIcon type="button" size="xs" radius="xl" variant="default">
                      <TiInfoLargeOutline />
                    </ActionIcon>
                  </Tooltip>
                </>
              }
              rightSection={
                embedUrl && (
                  <ActionIcon
                    type="button"
                    onClick={() => setEmbedUrl('')}
                    color="red"
                    size="xs"
                    radius="xl"
                    variant="subtle"
                  >
                    <IconX />
                  </ActionIcon>
                )
              }
              value={embedUrl}
              onChange={handleEmbedLink}
              size="xs"
              radius="xl"
              placeholder="Add Link"
            />
          </Box>
          <Space h="xs" />
        </>
      )}

      {poll && (
        <>
          <Space h="xs" />

          <Container size="sm">
            <Group justify="right">
              <Tooltip label="Add Options">
                <ActionIcon type="button" onClick={addPollOption} size="sm">
                  <CgPlayListAdd size="1.1rem" />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Space h="md" />

            {pollOptions &&
              pollOptions?.map((option, index) => (
                <div key={index}>
                  <TextInput
                    placeholder={`Option ${index + 1}`}
                    radius="xl"
                    value={option}
                    onChange={(event) => handlePollOptions(index, event.currentTarget.value)}
                    rightSection={
                      index > 1 && (
                        <ActionIcon
                          radius="xl"
                          size="sm"
                          color="red"
                          variant="light"
                          type="button"
                          onClick={() => deletePollOption(index)}
                        >
                          <MdDeleteForever />
                        </ActionIcon>
                      )
                    }
                  />

                  <Space h="sm" />
                </div>
              ))}
          </Container>
          <Space h="xs" />
        </>
      )}

      <Space h="sm" />
      <Group postion="apart">
        <Space h="sm" />
        {checkedAutoPost ? (
          <></>
        ) : (
          <Button
            variant="gradient"
            gradient={{ from: 'cyan', to: 'indigo' }}
            raduis="sm"
            onClick={handleCreatePost}
            disabled={
              !(
                (emote || bodyText.trim()) && // Ensure there is either media or body text
                !isLoadingPost &&
                (!poll || pollOptions.filter((option) => option.trim() !== '').length >= 2) &&
                (!checkedNft || price) &&
                creatorRoyaltyPercentage +
                  coinHolderRoyaltyPercentage +
                  (Object.keys(extraCreatorRoyalties).length > 0
                    ? Object.values(extraCreatorRoyalties).reduce((acc, cur) => acc + cur / 100, 0)
                    : 0) <=
                  100
              )
            }
            loading={isLoadingPost}
          >
            Create
          </Button>
        )}

        <FileButton
          onChange={setImageFile}
          accept="image/png,image/jpeg,image/png,image/webp"
          resetRef={resetImageRef}
          type="button"
        >
          {(props) => (
            <Tooltip label="Upload Image">
              <ActionIcon
                color="blue"
                size="lg"
                variant="default"
                {...props}
                loading={uploadInitiated}
              >
                <RiImageAddFill size="1.2rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </FileButton>

        <FileButton
          resetRef={resetVideoRef}
          onChange={setVideo}
          accept="video/mp4,video/mov,video/mpeg,video/flv,video/mwv,video/m3u8"
          type="button"
        >
          {(props) => (
            <Tooltip label="Upload Video">
              <ActionIcon
                color="blue"
                size="lg"
                variant="default"
                {...props}
                loading={isVideoLoading}
              >
                <TbVideoPlus size="1.2rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </FileButton>

        <Tooltip label="Add Poll">
          <ActionIcon color="blue" size="lg" variant="default" onClick={pollToggle} type="button">
            <FaPoll size="1.2rem" />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Embed">
          <ActionIcon color="blue" size="lg" variant="default" onClick={embedToggle} type="button">
            <ImEmbed size="1.2rem" />
          </ActionIcon>
        </Tooltip>

        <Switch
          checked={checkedNft}
          onChange={(event) => setCheckedNft(event.currentTarget.checked)}
          color="teal"
          size="sm"
          label={
            <Text fw={500} size="xs">
              Mint
            </Text>
          }
          thumbIcon={
            checkedNft ? (
              <IconCheck
                style={{ width: rem(12), height: rem(12) }}
                color={theme.colors.teal[6]}
                stroke={3}
              />
            ) : (
              <></>
            )
          }
        />
      </Group>

      {creatorRoyaltyPercentage +
        coinHolderRoyaltyPercentage +
        (Object.keys(extraCreatorRoyalties).length > 0
          ? Object.values(extraCreatorRoyalties).reduce((acc, cur) => acc + cur / 100, 0)
          : 0) >
        100 && (
        <>
          <Space h="xs" />
          <Text size="xs" c="red">
            Royalty Percentages Exceed 100%
          </Text>
        </>
      )}

      {checkedNft && (
        <>
          <Space h="xs" />
          <NumberInput
            label="NFT Copies"
            description="Sell Single or Multiple Copies."
            defaultValue={1}
            min={1}
            allowDecimal={false}
            allowNegative={false}
            value={nftCopies}
            onChange={setNftCopies}
            thousandSeparator=","
          />
          <Space h="lg" />
          <Divider />
          <Space h="lg" />
          <Group justify="right">
            <Switch
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
              labelPosition="left"
              label="Set as Buy Now"
            />
          </Group>
          <Space h="xs" />
          {checked ? (
            <>
              <NumberInput
                label="Buy Now Price"
                description="Set the buy now price for your NFT."
                placeholder="Enter Amount in $DESO"
                allowNegative={false}
                hideControls
                prefix="$DESO "
                value={price}
                onChange={setPrice}
                thousandSeparator=","
              />
              {checked && price && <> ≈ {convertDESOToUSD(price)}</>}
              <Space h="xs" />
            </>
          ) : (
            <>
              <NumberInput
                label="Minimum Bid"
                description="Set the minimum bid price for your NFT."
                placeholder="Enter Amount in $DESO"
                allowNegative={false}
                hideControls
                prefix="$DESO "
                value={price}
                onChange={setPrice}
                thousandSeparator=","
              />
              {price && <> ≈ {convertDESOToUSD(price)}</>}
            </>
          )}

          <Space h="lg" />
          <Divider />
          <Space h="lg" />

          <NumberInput
            label="Your Royalty Percentage"
            description="This goes directly to you for secondary sales."
            placeholder="Percents"
            suffix="%"
            defaultValue={0}
            allowNegative={false}
            value={creatorRoyaltyPercentage}
            onChange={setCreatorRoyaltyPercentage}
            min={0}
            max={100}
            error={creatorRoyaltyPercentage > 100 && 'Cannot be greater than 100%'}
          />
          <Space h="lg" />
          <NumberInput
            label="Coin Holder Royalty Percentage"
            description="This will be distributed to your Creator Coin Holders."
            defaultValue={0}
            placeholder="Percents"
            suffix="%"
            allowNegative={false}
            min={0}
            max={100}
            value={coinHolderRoyaltyPercentage}
            onChange={setCoinHolderRoyaltyPercentage}
            error={coinHolderRoyaltyPercentage > 100 && 'Cannot be greater than 100%'}
          />

          <Space h="lg" />
          <Group>
            <Text fw={500} size="sm">
              Add More Creator Royalties
            </Text>
            <HoverCard width={280} closeDelay={700} shadow="md">
              <HoverCard.Target>
                <ActionIcon radius="xl" size="xs" variant="subtle">
                  <TiInfoLargeOutline />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text fw={500} size="xs">
                  Set up royalties for specific Creators. This enables partnered content for NFT
                  Sales.
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
          <Space h="xs" />

          <TextInput
            leftSection={<BiSearchAlt size="1.2rem" />}
            placeholder="Search for a creator by username"
            value={value}
            onChange={handleInputChange}
          />

          <Space h="xs" />
          {value && searchResults.length > 0 && (
            <Stack>
              {searchResults.map((profile) => (
                <UnstyledButton
                  key={profile.PublicKeyBase58Check}
                  onClick={() => handleAddCreator(profile.PublicKeyBase58Check)}
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
            </Stack>
          )}

          <Space h="xs" />
          {Object.entries(extraCreatorRoyalties).map(([publicKey, percentage], index) => (
            <>
              <Group key={index}>
                <Group grow>
                  <Group>
                    <Avatar
                      src={
                        `https://node.deso.org/api/v0/get-single-profile-picture/${publicKey}` ||
                        null
                      }
                      radius="xl"
                    />
                    <Box w={111}>
                      <Text size="sm" fw={500} truncate="end">
                        {publicKey}
                      </Text>
                    </Box>
                  </Group>

                  <NumberInput
                    defaultValue={percentage}
                    placeholder="Percents"
                    suffix="%"
                    min={0}
                    max={100}
                    allowNegative={false}
                    onChange={(updatedValue) =>
                      handleCreatorPercentageChange(publicKey, updatedValue)
                    }
                    error={percentage / 100 > 100 && 'Cannot be greater than 100%'}
                  />
                </Group>
                <ActionIcon
                  radius="xl"
                  size="sm"
                  color="red"
                  variant="subtle"
                  type="button"
                  onClick={() => deleteExtraCreator(publicKey)}
                >
                  <MdDeleteForever />
                </ActionIcon>
              </Group>
              <Space h="xs" />
            </>
          ))}
        </>
      )}
    </>
  );
};
