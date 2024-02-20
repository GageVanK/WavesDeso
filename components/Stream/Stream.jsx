import {
  Player,
  useCreateStream,
  useUpdateStream,
  Broadcast,
  useCreateClip,
  usePlaybackInfo,
  MediaControllerCallbackState,
} from '@livepeer/react';
import { useDisclosure } from '@mantine/hooks';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { updateProfile, submitPost } from 'deso-protocol';
import {
  Input,
  Paper,
  Stack,
  Group,
  Button,
  Space,
  Center,
  CopyButton,
  Tooltip,
  Loader,
  Text,
  Accordion,
  ActionIcon,
  PasswordInput,
  HoverCard,
  Container,
  Modal,
  TextInput,
  Switch,
  rem,
  Divider,
} from '@mantine/core';
import { TwitchEmbed } from 'react-twitch-embed';
import {
  IconRocket,
  IconCheck,
  IconKey,
  IconX,
  IconScreenShare,
  IconLink,
  IconPencil,
  IconQuestionMark,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { RiYoutubeLine } from 'react-icons/ri';
import { BsTwitch } from 'react-icons/bs';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { RiKickLine } from 'react-icons/ri';
import { AiOutlineLink } from 'react-icons/ai';
import { VscKey } from 'react-icons/vsc';
import { BiUserCircle } from 'react-icons/bi';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { HowTo } from '@/components/HowTo/HowTo';
import { db } from '../../firebase-config';

export const Stream = () => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [opened, { open, close }] = useDisclosure(false);
  const embed = useRef();
  const [streamId, setStreamId] = useState();
  const [streamPlaybackId, setStreamPlaybackId] = useState();
  const [streamKey, setStreamKey] = useState();
  const [streamTitle, setStreamTitle] = useState(
    currentUser.ProfileEntryResponse?.ExtraData?.WavesStreamTitle || ''
  );
  const [streamTitleInput, setStreamTitleInput] = useState('');
  const [kickStreamKey, setKickStreamKey] = useState('');
  const [kickStreamURL, setKickStreamURL] = useState('');
  const [twitchStreamKey, setTwitchStreamKey] = useState('');
  const [twitchInput, setTwitchInput] = useState('');
  const [ytStreamKey, setYTStreamKey] = useState('');
  const [ytStreamURL, setYTStreamURL] = useState('');
  const onError = useCallback((error) => console.log(error), []);
  const [isStreamToStore, setIsStreamToStore] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [openClip, setOpenClip] = useState(false);
  const timerRef = useRef(0);
  // For Twitch Embed
  const handleReady = (e) => {
    embed.current = e;
  };

  // Create Livepeer Stream + Record by default for VODs
  const userStream = useCreateStream({
    name: currentUser.ProfileEntryResponse?.Username,
    record: true,
  });

  // Trigger Create Stream function + Store stream info in firebase
  const handleCreateStream = async () => {
    try {
      // Create the stream
      userStream.mutate?.();
      console.log(userStream);
    } catch (error) {
      console.error('Error occurred creating and storing your initial stream.', error);
    }
  };

  // Trigger Create Stream function + Store stream info in firebase
  const handleStoreStream = async () => {
    try {
      // Set stream key, playback id, and id
      setStreamKey(userStream.data?.streamKey);
      setStreamPlaybackId(userStream.data?.playbackId);
      setStreamId(userStream.data?.id);

      // Store stream info in Firestore
      await setDoc(doc(db, 'streams', currentUser.ProfileEntryResponse?.Username), {
        streamId: userStream.data?.id,
        streamKey: userStream.data?.streamKey,
        playbackId: userStream.data?.playbackId,
      });
    } catch (error) {
      console.error('Error occurred creating and storing your initial stream.', error);
    }
  };

  // Get Stream Info
  const fetchStream = async () => {
    const docRef = doc(db, 'streams', currentUser?.ProfileEntryResponse.Username);
    const streamData = await getDoc(docRef);

    if (streamData.data()) {
      setStreamKey(streamData.data().streamKey);
      setStreamPlaybackId(streamData.data().playbackId);
      setStreamId(streamData.data().streamId);
    } else {
      handleCreateStream();
    }
  };

  // For 'Launch Wave' Button - Posts stream onchain making it accessible across all deso apps
  const postStreamToDeso = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: `${
            streamTitle || `${currentUser?.ProfileEntryResponse?.Username}'s Wave`
          }\nTo Subscribe and ensure the best viewing experience, visit: \nhttps://desowaves.vercel.app/wave/${
            currentUser.ProfileEntryResponse?.Username
          }`,
          VideoURLs: [`https://lvpr.tv/?v=${streamPlaybackId}`],
          ImageURLs: [],
        },
        PostExtraData: {
          WavesStreamTitle: streamTitle,
        },
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Your Wave has Launched to DeSo',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      console.log('something happened: ' + error);
    }
  };

  // Twitch Multistream Livepeer Hook
  const {
    mutate: twitchMultistream,
    error,
    isSuccess,
    status: twitchStatus,
  } = useUpdateStream({
    streamId,
    multistream: {
      targets: [
        {
          profile: 'source',
          spec: {
            name: 'Twitch',
            url: `rtmp://live.twitch.tv/app/${twitchStreamKey}`, // Use the RTMP URL entered by the user
          },
        },
      ],
    },
  });

  // Youtube Multistream Livepeer Hook
  const { mutate: youtubeMultistream, status: ytmulti } = useUpdateStream({
    streamId,
    multistream: {
      targets: [
        {
          profile: 'source',
          spec: {
            name: 'Youtube',
            url: `${ytStreamURL}/${ytStreamKey}`, // Use the RTMP URL entered by the user
          },
        },
      ],
    },
  });

  // Kick Multistream Livepeer Hook
  const { mutate: kickMultistream, error: kickmulti } = useUpdateStream({
    streamId,
    multistream: {
      targets: [
        {
          profile: 'source',
          spec: {
            name: 'Kick',
            url: `${kickStreamURL}/app/${kickStreamKey}`, // Use the RTMP URL entered by the user
          },
        },
      ],
    },
  });

  // Trigger Livepeer multistream function + Update Profile with Twitch to Embed Twitch to Dashboard for convienvence
  const handleEnableTwitchMultistream = async () => {
    twitchMultistream?.();
    if (!currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL) {
      const updateData = {
        UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: '',
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: '',
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          TwitchURL: `https://www.twitch.tv/${twitchInput}`,
        },
      };

      await updateProfile(updateData);
    }
  };

  // Trigger Youtube Multistream function
  const handleEnableYTMultistream = async () => {
    youtubeMultistream?.();
  };

  // Trigger Kick Multistream function
  const handleEnableKickMultistream = async () => {
    kickMultistream?.();
  };

  // Update Stream Title by adding to users profile
  const updateStreamTitle = async () => {
    try {
      setStreamTitle(streamTitleInput);
      const updateData = {
        UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: '',
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: '',
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamTitle: streamTitle,
        },
      };
      await updateProfile(updateData);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Title Updated',
      });

      close();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      console.log('something happened: ' + error);
    }
  };

  /*
  const playerProps = useMemo(
    () =>
      streamId
        ? {
            src: `${streamPlaybackId}/${streamId}/output.m3u8`,
          }
        : {
            playbackId: streamPlaybackId,
          },
    [streamId, streamPlaybackId]
  );

  const playbackStatusSelector = useCallback(
    (MediaControllerCallbackState) => ({
      progress: Number(state.progress.toFixed(1)),
      offset: Number(state.playbackOffsetMs?.toFixed(1) ?? 0),
    }),
    []
  );

  const onPlaybackStatusUpdate = useCallback(
    ({ progress, offset }) => setPlaybackStatus(state),
    []
  );

  const {
    data: clipAsset,
    mutate,
    isLoading,
  } = useCreateClip({
    sessionId: streamId,
    playbackId: streamPlaybackId,
    startTime: startTime?.unix ?? 0,
    endTime: endTime?.unix ?? 0,
  });

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const { data: clipPlaybackInfo } = usePlaybackInfo({
    playbackId: clipAsset?.playbackId ?? undefined,
    refetchInterval: (info) => (!info?.meta?.source?.some((s) => s.hrn === 'MP4') ? 2000 : false),
  });

  const mp4DownloadUrl = useMemo(
    () =>
      clipPlaybackInfo?.meta?.source
        ?.sort((a, b) => {
          const sizeA = a?.size ?? 0;
          const sizeB = b?.size ?? 0;

          return sizeB - sizeA;
        })
        ?.find((s) => s.hrn === 'MP4')?.url ?? null,
    [clipPlaybackInfo]
  );

  useEffect(() => {
    if (isLoading) {
      setOpenClip(false);
      window?.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setOpenClip(true);
      }, 100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (mp4DownloadUrl) {
      setOpenClip(false);
      window?.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setOpenClip(true);
      }, 100);
    }
  }, [mp4DownloadUrl]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  */

  // Fetch Stream Info on mount or when user changes
  useEffect(() => {
    if (currentUser.ProfileEntryResponse.Username) {
      fetchStream();
    }
  }, [currentUser, currentUser.ProfileEntryResponse?.Username]);

  // Fetch Stream Info on mount or when user changes
  useEffect(() => {
    if (userStream.isSuccess) {
      handleStoreStream();
    }
  }, [userStream, userStream.isSuccess]);

  return (
    <>
      <Modal opened={opened} onClose={close} centered>
        <TextInput
          variant="filled"
          radius="xl"
          label="Change Title"
          placeholder={streamTitle || `${currentUser?.ProfileEntryResponse?.Username}'s Wave`}
          value={streamTitleInput}
          onChange={(event) => setStreamTitleInput(event.currentTarget.value)}
          rightSection={
            streamTitleInput && (
              <ActionIcon
                onClick={() => {
                  setStreamTitleInput('');
                }}
                size={32}
                radius="xl"
                variant="subtle"
              >
                <IconX size="1.1rem" />
              </ActionIcon>
            )
          }
          rightSectionWidth={42}
        />

        <Space h="md" />

        <Group justify="right">
          <Button size="xs" onClick={updateStreamTitle}>
            Update
          </Button>
        </Group>
      </Modal>

      {streamId && (
        <>
          <Group>
            <Text fs="italic" ml={77} fw={700} size="xl">
              {streamTitle ||
                currentUser?.ProfileEntryResponse?.ExtraData?.WavesStreamTitle ||
                `${currentUser?.ProfileEntryResponse?.Username}'s Wave`}
            </Text>

            <Tooltip label="Edit Title">
              <ActionIcon size="sm" variant="subtle" onClick={open}>
                <IconPencil style={{ width: rem(18) }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Space h="xs" />

          <Group>
            <ActionIcon.Group orientation="vertical">
              <HoverCard width={280} closeDelay={700} shadow="md">
                <HoverCard.Target>
                  <ActionIcon radius="xl" size="xl" variant="outline">
                    <TiInfoLargeOutline />
                  </ActionIcon>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Group>
                    <IconRocket style={{ width: rem(15) }} stroke={1.5} />
                    <Text size="xs">Promote your Wave by posting to DeSo.</Text>
                  </Group>

                  <Space h="xs" />
                  <Divider />
                  <Space h="xs" />

                  <Group>
                    <IconPencil style={{ width: rem(15) }} stroke={1.5} />
                    <Text size="xs">Edit the title of your Wave.</Text>
                  </Group>

                  <Space h="xs" />
                  <Divider />
                  <Space h="xs" />

                  <Group>
                    <IconScreenShare style={{ width: rem(15) }} stroke={1.5} />
                    <Text size="xs">Share the link to your Wave.</Text>
                  </Group>

                  <Space h="xs" />
                  <Divider />
                  <Space h="xs" />

                  <Group>
                    <IconKey style={{ width: rem(15) }} stroke={1.5} />
                    <Text size="xs">Paste in your Stream Key/URL to go Live.</Text>
                  </Group>

                  <Space h="xs" />
                  <Divider />
                  <Space h="xs" />

                  <Group>
                    <IconQuestionMark style={{ width: rem(15) }} stroke={1.5} />
                    <Text size="xs">Any more questions? Check our tutorial.</Text>
                  </Group>
                </HoverCard.Dropdown>
              </HoverCard>

              <Tooltip label="Promote Wave Onchain">
                <ActionIcon
                  onClick={postStreamToDeso}
                  variant="default"
                  size="xl"
                  aria-label="Launch"
                >
                  <IconRocket style={{ width: rem(20) }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Edit Title">
                <ActionIcon size="xl" variant="default" onClick={open}>
                  <IconPencil style={{ width: rem(20) }} stroke={1.5} />
                </ActionIcon>
              </Tooltip>

              <CopyButton
                value={`https://desowaves.vercel.app/wave/${currentUser.ProfileEntryResponse.Username}`}
                timeout={2000}
              >
                {({ copied, copy }) => (
                  <>
                    <Tooltip label={copied ? 'Copied' : 'Share Wave Link'}>
                      <ActionIcon
                        variant="default"
                        size="xl"
                        aria-label="Share Button"
                        onClick={copy}
                      >
                        {copied ? (
                          <>
                            <IconCheck style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        ) : (
                          <>
                            <IconScreenShare style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </CopyButton>

              <CopyButton value={streamKey} timeout={2000}>
                {({ copied, copy }) => (
                  <>
                    <Tooltip label={copied ? 'Copied' : 'Stream Key'}>
                      <ActionIcon
                        variant="default"
                        size="xl"
                        aria-label="StreamKey"
                        color={copied ? 'teal' : 'blue'}
                        onClick={copy}
                      >
                        {copied ? (
                          <>
                            <IconCheck style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        ) : (
                          <>
                            <IconKey style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </CopyButton>

              <CopyButton value="rtmp://rtmp.livepeer.com/live" timeout={2000}>
                {({ copied, copy }) => (
                  <>
                    <Tooltip label={copied ? 'Copied' : 'Stream URL'}>
                      <ActionIcon variant="default" size="xl" aria-label="StreamURL" onClick={copy}>
                        {copied ? (
                          <>
                            <IconCheck style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        ) : (
                          <>
                            <IconLink style={{ width: rem(20) }} stroke={1.5} />
                          </>
                        )}
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </CopyButton>

              <HowTo />
            </ActionIcon.Group>

            <Player
              priority
              controls
              showPipButton
              theme={{
                colors: {
                  loading: '#3cdfff',
                },
              }}
              title={
                streamTitle ||
                currentUser?.ProfileEntryResponse?.ExtraData?.WavesStreamTitle ||
                `${currentUser?.ProfileEntryResponse?.Username}'s Wave`
              }
              playbackId={streamPlaybackId}
            />
          </Group>

          <Space h="md" />

          <Container w="100%">
            <Stack>
              <Group>
                <Text fw={666} fz="lg">
                  Multistream
                </Text>

                <HoverCard width={280} closeDelay={700} shadow="md">
                  <HoverCard.Target>
                    <ActionIcon radius="xl" size="sm" variant="outline">
                      <TiInfoLargeOutline />
                    </ActionIcon>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text fw={500} size="xs">
                      Broadcast your Stream to multiple platforms with Multistreaming!
                    </Text>
                    <Space h="xs" />
                    <Text fw={500} size="xs">
                      Just paste in the necessary information and click the Launch button.
                    </Text>
                    <Space h="xs" />
                    <Text fw={500} size="xs">
                      It is recommended to have separate tabs open of your Multistreams to ensure
                      everything is working!
                    </Text>
                    <Space h="xs" />
                    <Text fw={500} size="xs">
                      Be sure to set the Stream Title, Category, etc in the apps you are
                      multistreaming to.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>

              <Accordion variant="separated" radius="md">
                <Accordion.Item value="Twitch">
                  <Accordion.Control
                    icon={<BsTwitch size={'1.5rem'} color={'rgba(145, 70, 255)'} />}
                  >
                    <Text c="dimmed" fw={500}>
                      Twitch
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {!currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL && (
                      <Input
                        icon={<BiUserCircle />}
                        placeholder="Enter Your Twitch Username"
                        radius="md"
                        value={twitchInput}
                        onChange={(e) => setTwitchInput(e.target.value)}
                      />
                    )}

                    <Space h="md" />
                    <PasswordInput
                      icon={<VscKey />}
                      placeholder="Enter Your Twitch Stream Key"
                      radius="md"
                      value={twitchStreamKey}
                      onChange={(e) => setTwitchStreamKey(e.target.value)}
                    />
                    <Space h="md" />
                    <Group justify="right">
                      <Button
                        rightSection={<IconRocket size="1rem" />}
                        variant="light"
                        size="xs"
                        onClick={handleEnableTwitchMultistream}
                        disabled={
                          !twitchStreamKey ||
                          (!twitchInput && !currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL)
                        }
                      >
                        Launch
                      </Button>
                      {error && <div>{error.message}</div>}
                    </Group>

                    {twitchInput && !currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL && (
                      <>
                        <Space h="md" />
                        <Group grow>
                          <TwitchEmbed channel={twitchInput} muted onReady={handleReady} />
                        </Group>
                      </>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="Youtube">
                  <Accordion.Control icon={<RiYoutubeLine size={'1.5rem'} color="red" />}>
                    <Text c="dimmed" fw={500}>
                      Youtube
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Input
                      icon={<BiUserCircle />}
                      placeholder="Enter Your Youtube Stream URL"
                      radius="md"
                      value={ytStreamURL}
                      onChange={(e) => setYTStreamURL(e.target.value)}
                    />
                    <Space h="md" />
                    <PasswordInput
                      icon={<AiOutlineLink />}
                      placeholder="Enter Your Youtube Stream Key"
                      radius="md"
                      value={ytStreamKey}
                      onChange={(e) => setYTStreamKey(e.target.value)}
                    />
                    <Space h="md" />
                    <Group justify="right">
                      <Button
                        rightSection={<IconRocket size="1rem" />}
                        variant="light"
                        size="xs"
                        onClick={handleEnableYTMultistream}
                      >
                        Launch
                      </Button>
                      {ytmulti && <div>{ytmulti.message}</div>}
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="Kick">
                  <Accordion.Control icon={<RiKickLine size={'1.5rem'} color="green" />}>
                    {' '}
                    <Text c="dimmed" fw={500}>
                      Kick
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Input
                      icon={<AiOutlineLink />}
                      placeholder="Enter Kick Stream URL"
                      radius="md"
                      value={kickStreamURL}
                      onChange={(e) => setKickStreamURL(e.target.value)}
                    />
                    <Space h="md" />
                    <PasswordInput
                      icon={<VscKey />}
                      placeholder="Enter Kick Stream Key"
                      radius="md"
                      value={kickStreamKey}
                      onChange={(e) => setKickStreamKey(e.target.value)}
                    />{' '}
                    <Space h="md" />
                    <Group justify="right">
                      <Button
                        onClick={handleEnableKickMultistream}
                        rightSection={<IconRocket size="1rem" />}
                        variant="light"
                        size="xs"
                      >
                        Launch
                      </Button>
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Stack>
          </Container>
        </>
      )}
    </>
  );
};
