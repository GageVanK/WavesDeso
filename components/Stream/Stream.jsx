import {
  Player,
  useCreateStream,
  useUpdateStream,
  Broadcast,
  useStreamSession,
} from '@livepeer/react';
import { useMemo, useState, useContext, useEffect, useRef } from 'react';
import { useDisclosure, useInterval } from '@mantine/hooks';
import {
  updateProfile,
  getIsFollowing,
  updateFollowingStatus,
  submitPost,
  getSingleProfile,
} from 'deso-protocol';
import {
  Title,
  Input,
  Paper,
  Textarea,
  Group,
  Button,
  Space,
  Center,
  CopyButton,
  Tabs,
  Tooltip,
  Card,
  Badge,
  Loader,
  Text,
  Progress,
  Divider,
  Accordion,
  useMantineTheme,
  Collapse,
  ActionIcon,
  PasswordInput,
  rgba,
  HoverCard,
  Blockquote,
  Container,
} from '@mantine/core';
import { TwitchEmbed } from 'react-twitch-embed';
import { IconRocket, IconCheck, IconKey, IconX, IconScreenShare } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { RiYoutubeLine } from 'react-icons/ri';
import { BsTwitch } from 'react-icons/bs';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { RiKickLine } from 'react-icons/ri';
import { AiOutlineLink } from 'react-icons/ai';
import { VscKey } from 'react-icons/vsc';
import { BiUserCircle } from 'react-icons/bi';
import { TiInfoLargeOutline } from 'react-icons/ti';
import classes from './Stream.module.css';
import { HowTo } from '@/components/HowTo/HowTo';
import { BsExclamationCircle } from 'react-icons/bs';

export const Stream = () => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [obsStreamName, setObsStreamName] = useState('');
  const [browserStreamName, setBrowserStreamName] = useState('');
  const [isFollowingWaves, setisFollowingWaves] = useState(false);
  const [disable, { toggle }] = useDisclosure(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [openedMulti, { toggle: toggleMulti }] = useDisclosure(true);
  const embed = useRef();
  const [didLaunch, setDidLaunch] = useState(false);
  const theme = useMantineTheme();

  const handleReady = (e) => {
    embed.current = e;
  };

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  const obs = useCreateStream(obsStreamName ? { name: obsStreamName } : null);
  const browser = useCreateStream(browserStreamName ? { name: browserStreamName } : null);

  const isLoading = useMemo(
    () => obs.status === 'loading' || browser.status === 'loading',
    [obs.status, browser.status]
  );

  const obsStreamId = obs.data?.id;
  const browserStreamId = browser.data?.id;

  const [twitchStreamKey, setTwitchStreamKey] = useState('');
  const [twitchUsername, setTwitchUsername] = useState('');
  const [twitchInput, setTwitchInput] = useState('');
  const {
    mutate: twitchMultistream,
    error,
    isSuccess,
    status: twitchStatus,
  } = useUpdateStream({
    obsStreamId,
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

  const handleEnableTwitchMultistream = async () => {
    // If user multistreams to Twitch and hasnt added their Twitch URL we add it to their profile
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

    // cast stream to twitch
    twitchMultistream?.();
  };

  const [ytStreamKey, setYTStreamKey] = useState('');
  const [ytStreamURL, setYTStreamURL] = useState('');
  const { mutate: youtubeMultistream, status: ytmulti } = useUpdateStream({
    obsStreamId,
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

  const handleEnableYTMultistream = async () => {
    youtubeMultistream?.();
  };

  const [kickStreamKey, setKickStreamKey] = useState('');
  const [kickStreamURL, setKickStreamURL] = useState('');
  const { mutate: kickMultistream, error: kickmulti } = useUpdateStream({
    obsStreamId,
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

  const handleEnableKickMultistream = async () => {
    kickMultistream?.();
  };

  // Checking to see if Waves_Streams Account Follows the Streamer
  useEffect(() => {
    const isFollowingPublicKey = async () => {
      try {
        const result = await getIsFollowing({
          PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          IsFollowingPublicKeyBase58Check:
            'BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6',
        });

        setisFollowingWaves(result.IsFollowing);
      } catch (error) {
        console.log('Something went wrong:', error);
      }
    };

    isFollowingPublicKey();
  }, [currentUser]);

  const postStreamToDeso = async () => {
    try {
      !interval.active && interval.start();
      // Streamer follows the Waves_Streams Account
      // Waves_Streams follows Streamers back
      // Will be using the Waves_Streams Following Feed to display the livestreams on the Waves Feed
      // Lazy way of moderating the Waves Feed
      if (isFollowingWaves === false) {
        await updateFollowingStatus({
          MinFeeRateNanosPerKB: 1000,
          IsUnfollow: false,
          FollowedPublicKeyBase58Check: 'BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6',
          FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        });
      }

      // Posts stream onchain making it accessible across all deso apps
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: `${
            obsStreamName || browserStreamName
          }\nTo Subscribe and ensure the best viewing experience, visit: \nhttps://desowaves.vercel.app/wave/${
            currentUser.ProfileEntryResponse.Username
          }`,
          VideoURLs: [`https://lvpr.tv/?v=${obs.data?.playbackId || browser.data?.playbackId}`],
          ImageURLs: [],
        },
        PostExtraData: {
          WavesStreamTitle: obsStreamName || browserStreamName,
        },
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Your Wave has Launched to DeSo',
      });

      setDidLaunch(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      console.log('something happened: ' + error);
      setDidLaunch(false);
      setLoaded(false);
      setProgress(0);
    }
  };

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Group justify="space-between">
        <HoverCard width={280} closeDelay={700} shadow="md">
          <HoverCard.Target>
            <ActionIcon radius="xl" size="sm" variant="outline">
              <TiInfoLargeOutline />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text fw={500} size="xs">
              Be sure to install OBS Studio or Stream via your Webcam (Mobile Friendly)
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>

        <CopyButton
          value={`https://desowaves.vercel.app/wave/${currentUser.ProfileEntryResponse.Username}`}
          timeout={2000}
        >
          {({ copied, copy }) => (
            <>
              <Tooltip label={copied ? 'Wave Copied' : 'Share your Wave'}>
                <Button
                  radius="sm"
                  size="compact-md"
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                >
                  {copied ? (
                    <>
                      <IconCheck size={16} />
                    </>
                  ) : (
                    <>
                      <IconScreenShare size={16} />
                    </>
                  )}
                </Button>
              </Tooltip>
            </>
          )}
        </CopyButton>
      </Group>

      <Space h="md" />

      <Tabs variant="pills" radius="md" defaultValue="first">
        <Tabs.List grow justify="center">
          <Tabs.Tab value="first" disabled={obsStreamName || browserStreamName}>
            Stream via OBS/StreamLabs
          </Tabs.Tab>
          <Tabs.Tab value="second" disabled={obsStreamName || browserStreamName}>
            Stream via Webcam (Mobile Friendly)
          </Tabs.Tab>
        </Tabs.List>

        <Space h="md" />

        <Tabs.Panel value="first">
          <Center>
            <Text fz="lg" fw={777} c="dimmed" truncate="end">
              Start Streaming
            </Text>
          </Center>
          <Space h="md" />
          <Textarea
            placeholder="Enter Stream Title"
            variant="filled"
            radius="md"
            disabled={disable}
            onChange={(e) => setObsStreamName(e.target.value)}
          />
          <Space h="xl" />

          {obs.status === 'success' && (
            <>
              {obsStreamName ? (
                <>
                  <Container>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                      <Group justify="right">
                        <HowTo />
                      </Group>
                      <Blockquote
                        color="blue"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          1. Select Livepeer Studio in your OBS Stream Settings and paste in your
                          1-time use Stream Key.
                        </Text>
                        <Space h="xs" />
                        <Text fw={400} fs="italic">
                          2. Once your stream is Active, Click 'Launch Wave' to bring your broadcast
                          to Waves & all DeSo Apps!
                        </Text>
                        <Space h="xs" />
                        <Text fw={400} fs="italic">
                          - If you leave the dashboard mid-stream, your viewers can still watch the
                          stream, but you won't have access to the stream key or be able to start a
                          multistream until you create a new one.
                        </Text>
                      </Blockquote>

                      <Space h="md" />
                      <Group justify="center">
                        <Title order={1}>
                          <Text radius="sm" fw={700} fz="lg">
                            {obsStreamName}
                          </Text>{' '}
                        </Title>
                      </Group>

                      <Divider my="sm" />

                      <Space h="md" />
                      <Group justify="center">
                        <CopyButton value={obs.data?.streamKey} timeout={2000}>
                          {({ copied, copy }) => (
                            <Button fullWidth color={copied ? 'teal' : 'blue'} onClick={copy}>
                              {copied ? (
                                <>
                                  <Center>
                                    <h4>Stream Key</h4>
                                    <Space w="xs" />
                                    <IconCheck size={16} />
                                  </Center>
                                </>
                              ) : (
                                <>
                                  <Center>
                                    <h4>Stream Key</h4>
                                    <Space w="xs" />
                                    <IconKey size={16} />
                                  </Center>
                                </>
                              )}
                            </Button>
                          )}
                        </CopyButton>

                        <Button
                          rightSection={<IconRocket size="1rem" />}
                          fullWidth
                          className={classes.button}
                          onClick={() => {
                            postStreamToDeso();
                          }}
                          color={loaded ? 'teal' : theme.primaryColor}
                          disabled={didLaunch}
                        >
                          <div className={classes.label}>
                            {progress !== 0
                              ? 'Launching Waves'
                              : loaded
                              ? 'Wave Launched'
                              : 'Launch Wave'}
                          </div>
                          {progress !== 0 && (
                            <Progress
                              value={progress}
                              className={classes.progress}
                              color={rgba(theme.colors.blue[0], 0.35)}
                              radius="sm"
                            />
                          )}
                        </Button>
                      </Group>
                      <Space h="md" />
                    </Card>
                  </Container>
                  <Space h="md" />

                  <Center>
                    <Group style={{ width: '500px' }}>
                      <Tooltip label="Stream to Multiple Platforms">
                        <Button
                          fullWidth
                          variant="gradient"
                          gradient={{ from: 'indigo', to: 'cyan' }}
                          radius="lg"
                          size="md"
                          onClick={toggleMulti}
                        >
                          {' '}
                          <Text fw={700} fz="lg">
                            Multistream
                          </Text>
                        </Button>
                      </Tooltip>
                    </Group>
                  </Center>

                  <Collapse in={openedMulti}>
                    <Divider my="sm" />
                    <Paper shadow="md" radius="md" p="lg" withBorder>
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
                            It is recommended to have separate tabs open of your Multistreams to
                            ensure everything is working!
                          </Text>
                          <Space h="xs" />
                          <Text fw={500} size="xs">
                            Be sure to set the Stream Title, Category, etc in the apps you are
                            multistreaming to.
                          </Text>
                        </HoverCard.Dropdown>
                      </HoverCard>
                      <Space h="xs" />
                      <Accordion variant="separated" radius="md" defaultValue="Twitch">
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
                                rightSectioncon={<IconRocket size="1rem" />}
                                variant="light"
                                size="xs"
                                onClick={handleEnableTwitchMultistream}
                                disabled={
                                  !twitchStreamKey ||
                                  (!twitchInput &&
                                    !currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL)
                                }
                              >
                                Launch
                              </Button>
                              {error && <div>{error.message}</div>}
                            </Group>

                            {twitchInput &&
                              !currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL && (
                                <>
                                  <Space h="md" />
                                  <Group grow>
                                    <TwitchEmbed
                                      channel={twitchInput}
                                      muted
                                      onReady={handleReady}
                                    />
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
                                rightSectioncon={<IconRocket size="1rem" />}
                                variant="light"
                                size="xs"
                              >
                                Launch
                              </Button>
                            </Group>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Paper>
                  </Collapse>

                  <Space h="md" />
                  {!didLaunch ? (
                    <>
                      <Blockquote
                        color="red"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          This stream playback is not public. Please click Launch Wave to make it
                          accessible across all DeSo Apps.
                        </Text>
                      </Blockquote>
                      <Space h="md" />
                    </>
                  ) : (
                    <>
                      <Blockquote
                        color="blue"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          Yay! Your wave is available on Waves and all DeSo Apps!
                        </Text>
                      </Blockquote>
                      <Space h="md" />
                    </>
                  )}
                  <Group justify="center">
                    <Player
                      priority
                      controls={{ autohide: 0, hotkeys: false, defaultVolume: 0.6 }}
                      showPipButton
                      theme={{
                        colors: {
                          loading: '#3cdfff',
                        },
                      }}
                      title={obs.data?.name}
                      playbackId={obs.data?.playbackId}
                      muted
                    />
                  </Group>
                </>
              ) : (
                <Group justify="center">
                  <p>Wave suspended. Refresh to create a new Wave.</p>
                </Group>
              )}
            </>
          )}
          {obs.status === 'loading' && (
            <Group justify="center">
              <Loader size="sm" />
            </Group>
          )}
          {obs.status === 'error' && (
            <Group justify="center">
              <p>Error occurred while creating your wave.</p>
            </Group>
          )}
          <Space h="md" />
          {!obs.data && (
            <Group justify="center">
              <Button
                radius="xl"
                onClick={() => {
                  toggle();
                  obs.mutate?.(); // Create the stream and store the result
                }}
                disabled={isLoading || !obs.mutate}
              >
                Create Wave
              </Button>
            </Group>
          )}
          <Space h="md" />
        </Tabs.Panel>

        <Tabs.Panel value="second">
          <Center>
            <Text fz="lg" fw={777} c="dimmed" truncate="end">
              Start Streaming
            </Text>
          </Center>
          <Space h="md" />
          <Textarea
            placeholder="Enter Stream Title"
            variant="filled"
            radius="md"
            disabled={disable}
            onChange={(e) => setBrowserStreamName(e.target.value)}
          />
          <Space h="xl" />

          {browser.status === 'success' && (
            <>
              {browserStreamName ? (
                <>
                  <Container>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                      <Blockquote
                        color="blue"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          1. Allow Access to your Webcam & Microphone.
                        </Text>
                        <Space h="xs" />
                        <Text fw={400} fs="italic">
                          2. Once your stream is Active, Click 'Launch Wave' to bring your broadcast
                          to Waves & all DeSo Apps!
                        </Text>
                      </Blockquote>
                      <Space h="md" />
                      <Group justify="center">
                        <Title order={1}>
                          <Text radius="sm" fw={700} fz="lg">
                            {browserStreamName}
                          </Text>{' '}
                        </Title>
                      </Group>

                      <Divider my="sm" />

                      <Space h="md" />
                      <Group justify="center">
                        <Button
                          rightSection={<IconRocket size="1rem" />}
                          fullWidth
                          className={classes.button}
                          onClick={() => {
                            postStreamToDeso();
                          }}
                          color={loaded ? 'teal' : theme.primaryColor}
                          disabled={didLaunch}
                        >
                          <div className={classes.label}>
                            {progress !== 0
                              ? 'Launching Waves'
                              : loaded
                              ? 'Wave Launched'
                              : 'Launch Wave'}
                          </div>
                          {progress !== 0 && (
                            <Progress
                              value={progress}
                              className={classes.progress}
                              color={rgba(theme.colors.blue[0], 0.35)}
                              radius="sm"
                            />
                          )}
                        </Button>
                      </Group>
                      <Space h="md" />
                    </Card>
                  </Container>

                  <Space h="md" />
                  {!didLaunch ? (
                    <>
                      <Blockquote
                        color="red"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          This stream playback is not public. Please click Launch Wave to make it
                          accessible across all DeSo Apps.
                        </Text>
                      </Blockquote>
                      <Space h="md" />
                    </>
                  ) : (
                    <>
                      <Blockquote
                        color="blue"
                        radius="xl"
                        iconSize={30}
                        icon={<BsExclamationCircle size="1.2rem" />}
                        mt="xl"
                      >
                        <Text fw={400} fs="italic">
                          Yay! Your wave is available on Waves and all DeSo Apps!
                        </Text>
                      </Blockquote>
                      <Space h="md" />
                    </>
                  )}
                  <Group justify="center">
                    <Broadcast
                      title={browser.data?.name}
                      playbackId={browser.data?.playbackId}
                      muted
                    />
                  </Group>
                </>
              ) : (
                <Group justify="center">
                  <p>Wave suspended. Refresh to create a new Wave.</p>
                </Group>
              )}
            </>
          )}
          {browser.status === 'loading' && (
            <Group justify="center">
              <Loader size="sm" />
            </Group>
          )}
          {browser.status === 'error' && (
            <Group justify="center">
              <p>Error occurred while creating your wave.</p>
            </Group>
          )}
          <Space h="md" />
          {!browser.data && (
            <Group justify="center">
              <Button
                radius="xl"
                onClick={() => {
                  toggle();
                  browser.mutate?.(); // Create the stream and store the result
                }}
                disabled={isLoading || !browser.mutate}
              >
                Create Wave
              </Button>
            </Group>
          )}
          <Space h="md" />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};
