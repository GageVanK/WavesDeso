import {
  ActionIcon,
  Modal,
  Code,
  Title,
  Text,
  Image,
  Divider,
  Space,
  Center,
  Paper,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { FaQuestion } from 'react-icons/fa';

export function HowTo() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Tooltip label="How To Stream with OBS">
        <ActionIcon radius="xl" size="xl" variant="default" onClick={open}>
          <FaQuestion size="1.3rem" />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        title={<Title order={1}>How To Stream with OBS</Title>}
        centered
        size="xl"
      >
        <Divider />
        <Space h="md" />
        <Title order={2}>Start Wave</Title>
        <Space h="xs" />
        <Text fw={500} size="md" c="dimmed">
          1. Set Stream Title
        </Text>
        <Text fw={500} size="md" c="dimmed">
          2. Click the &rsquo;Create Wave&rsquo; Button
        </Text>

        <Space h="md" />

        <Title order={2}>Configure OBS</Title>
        <Space h="xs" />
        <Title order={3}>Open OBS and create source</Title>
        <Space h="xs" />
        <Text fw={500} size="md" c="dimmed">
          1. Click the + icon under sources and select Video Capture Device if you&rsquo;d like to
          stream using a camera or webcam. If you&rsquo;d like to stream a browser window, select
          Window Capture.
        </Text>

        <Space h="xs" />
        <Image src="https://mintlify.s3-us-west-1.amazonaws.com/na-36/images/obs/OBS1.png" />
        <Space h="xs" />
        <Center>
          <Image src="https://mintlify.s3-us-west-1.amazonaws.com/na-36/images/obs/OBS2.png" />
        </Center>
        <Space h="xs" />
        <Image src="https://mintlify.s3-us-west-1.amazonaws.com/na-36/images/obs/OBS3.png" />
        <Space h="xs" />

        <Title order={2}>Update OBS Stream Settings</Title>
        <Space h="xs" />
        <Text fw={500} size="md" c="dimmed">
          1. Select Stream settings.
        </Text>
        <Text fw={500} size="md" c="dimmed">
          2. Select Show All… and then Livepeer Studio for the service.
        </Text>
        <Text fw={500} size="md" c="dimmed">
          3. Keep the Default Server and paste the Stream Key provided by Livepeer Studio into the
          OBS &rsquo;Stream Key&rsquo; fields.
        </Text>
        <Text fw={500} size="md" c="dimmed">
          4. Apply Settings & select &rsquo;Ok&rsquo;.
        </Text>
        <Text fw={500} size="md" c="dimmed">
          5. Select &rsquo;Start Streaming&rsquo; Button.
        </Text>

        <Space h="xs" />
        <Image src="https://mintlify.s3-us-west-1.amazonaws.com/na-36/images/obs/OBS4.png" />
        <Space h="xs" />
        <Image src="https://mintlify.s3-us-west-1.amazonaws.com/na-36/images/obs/OBS3.png" />
        <Space h="xs" />

        <Title order={2}>Launch your Stream to DeSo</Title>
        <Space h="xs" />
        <Text fw={500} size="md" c="dimmed">
          1. On your Waves Profile, click &rsquo;Launch Wave&rsquo; button.
        </Text>
        <Text fw={500} size="md" c="dimmed">
          2. Your now livestreaming onchain. Your Wave will be accessible across every deso app!
        </Text>
        <Text fw={500} size="md" c="dimmed">
          3. Streams are currently 1-time use and leaving the profile during a livestream will cause
          you to have to make a new stream. This has to do with not being able to privately store
          sensitive stream data on your DeSo profile. Waves is still in Beta and will work to
          improve this flow.
        </Text>

        <Space h="md" />

        <Title order={2}>Recommended OBS Settings</Title>
        <Space h="xs" />

        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            Low latency, High quality
          </Text>
          <Code>
            Rate Control: CRF CRF: 25 Keyframe Interval: 1 CPU Usage Preset: Very fast Profile: High
            Tune: None x264 options: bframes=0 Resolution: 1080p
          </Code>
        </Paper>

        <Space h="xs" />
        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            Low latency for bad connections
          </Text>
          <Code>
            Rate Control: CBR Bit Rate: 1200 Keyframe Interval: 1 CPU Usage Preset: Very fast
            Profile: High Tune: None x264 options: bframes=0 Resolution: 720p
          </Code>
        </Paper>
        <Space h="xs" />
        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            Balanced High Quality
          </Text>
          <Code>
            Rate Control: CRF CRF: 25 Keyframe Interval: 2 CPU Usage Preset: Very fast Profile: High
            Tune: None No additional x264 options Resolution: Any
          </Code>
        </Paper>
        <Space h="xs" />
        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            Balanced for bad connections
          </Text>
          <Code>
            Rate Control: CBR Bit Rate: 2000 Keyframe Interval: 2 CPU Usage Preset: Very fast
            Profile: High Tune: None No additional x264 options Resolution: Up to 1080p
          </Code>
        </Paper>
        <Space h="xs" />
        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            High quality, High latency
          </Text>

          <Code>
            Rate Control: CRF CRF: 27 Keyframe Interval: 10 CPU Usage Preset: Very fast Profile:
            High Tune: None x264 options: bframes=3 Resolution: 1080p
          </Code>
        </Paper>
        <Space h="xs" />
        <Paper shadow="xl" radius="xl" withBorder p="xl">
          <Text td="underline" fw={500} size="md">
            Low bandwidth, High latency
          </Text>
          <Code>
            Rate Control: CBR Bit Rate: 700 Keyframe Interval: 10 CPU Usage Preset: Very fast
            Profile: High Tune: None x264 options: bframes=3 Resolution: 720p or lower
          </Code>
        </Paper>
      </Modal>
    </>
  );
}
