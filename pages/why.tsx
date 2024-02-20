import { Text, Space, List, Paper, ThemeIcon, Center, rem, Stepper } from '@mantine/core';
import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { TbProgressBolt } from 'react-icons/tb';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { Fade } from 'react-awesome-reveal';
import classes from '../pagestyles/MilestoneStepper.module.css';
import { HowItWorks } from '@/components/HowItWorks/HowItWorks';
import { Welcome } from '@/components/Welcome/Welcome';

export default function Why() {
  return (
    <>
      <Space h={111} />
      <Welcome />
      <HowItWorks />
      <Space h={70} />
      <Text
        ta="center"
        fz={50}
        fw={800}
        fs="italic"
        variant="gradient"
        gradient={{ from: 'blue', to: 'cyan', deg: 176 }}
      >
        Roadmap
      </Text>

      <Space h="md" />
      <Center>
        <Stepper
          active={1}
          orientation="vertical"
          size="xl"
          classNames={classes}
          completedIcon={<IoMdCheckmarkCircleOutline size="1.7rem" />}
        >
          <Stepper.Step
            loading
            description={
              <>
                <Paper shadow="sm" radius="md" withBorder p="xl">
                  <List
                    spacing="sm"
                    size="md"
                    center
                    icon={
                      <ThemeIcon color="blue" variant="light" size={24} radius="xl">
                        <IconCircleDashed style={{ width: rem(16), height: rem(16) }} />
                      </ThemeIcon>
                    }
                  >
                    <Fade>
                      <List.Item>Notification UI Rework</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>NFT Post + Clips</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Hide + Edit + Pin + Bookmark Posts</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Follower + Earnings + Subscriber Goals</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Feed Surf</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Subscription Enhancements</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Migrate Chat to DCP</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Openfund Launch</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>UI Buffs</List.Item>
                    </Fade>
                    <Space h="xs" />
                    <Fade>
                      <List.Item>Much More!</List.Item>
                    </Fade>
                  </List>
                </Paper>
              </>
            }
          />
        </Stepper>
      </Center>
      <Space h={111} />
    </>
  );
}
