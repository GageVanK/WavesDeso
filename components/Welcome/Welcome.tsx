
import { ThemeIcon, Text, Title, Container, SimpleGrid, rem, Center, Button, Space, Paper } from '@mantine/core';
import { VscLink } from "react-icons/vsc";
import { BiWorld } from "react-icons/bi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { GiBigWave  } from "react-icons/gi";
import { RiDatabaseLine } from "react-icons/ri";
import { WiLightning } from "react-icons/wi";
import { RiCheckboxMultipleLine } from "react-icons/ri";
import { PiUsersThreeDuotone } from "react-icons/pi";
import classes from './Welcome.module.css';
import { Slide, Rotate} from 'react-awesome-reveal';


export const WAVESFEATURE = [
  {
    icon: GiBigWave,
    title: 'Why Waves?',
    description:
      'Waves is built on DeSo Protocol, serving as an open database. Empowering users to own their data. Traditional social platforms use private databases to own and sell user data.',
  },
 {
    icon: MdOutlineAttachMoney,
    title: 'Earn More',
    description:
      'Waves allows streamers to earn from their posts, streams, and in the future NFT Clips/Royalties.',
  },
  {
    icon: WiLightning,
    title: 'Instant Subscriptions',
    description:
      'Waves offers instant Fan-to-Creator Subscription payments. No more jumping through hoops to monetize your content.',
  },
  {
    icon: RiCheckboxMultipleLine,
    title: 'Multi-Platform Streaming',
    description:
      'Waves supports multi-streaming to YouTube, Kick, and Twitch. Additional platforms can be added upon request.',
  },
  {
    icon: BiWorld,
    title: 'Open Source',
    description:
      'Waves is open source and allows for Algorithm Audits, eliminating guesswork around the magic algorithm.',
  },
  {
    icon: PiUsersThreeDuotone,
    title: 'Community Oriented',
    description:
      'Waves prioritizes user experience and plans to use onchain voting to determine feature development and the platforms direction.',
  },
  
 
];

interface FeatureProps {
  icon: React.FC<any>;
  title: React.ReactNode;
  description: React.ReactNode;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
     <div>
      <ThemeIcon variant="light" size={44} radius="xl">
        <Icon style={{ width: rem(26), height: rem(26) }} stroke={1.5} />
      </ThemeIcon>
      <Text fw={500} mt="sm" mb={7}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.6}>
        {description}
      </Text>
    </div>
  );
}

export function Welcome() {
  const features = WAVESFEATURE.map((feature, index) => <Feature {...feature} key={index} />);

  return (
    <Container className={classes.wrapper}>
   
    
      <Text ta="center" fz={66} fw={900} fs="italic" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 176 }}>Why Waves</Text>
   

      <Container size={560} p={0}>
      <Center>
        <Text fw={700} size="md">
          Live-Streaming Platform
        </Text>
      </Center>
      </Container>
    
     
<Space h="xl"/>
 <SimpleGrid
        mt={60}
        cols={{ base: 1, sm: 1, md: 3 }}
        spacing={{ base: 'xl', md: 50 }}
        verticalSpacing={{ base: 'xl', md: 50 }}
      >
        <Slide>
        {features}
        </Slide>
      </SimpleGrid>

    </Container>
  );
}