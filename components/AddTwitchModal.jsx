import {
    getSingleProfile,
    getFollowersForUser,
    getPostsForUser,
    getNFTsForUser,
    updateProfile,
    identity,
  } from "deso-protocol";
import { useDisclosure } from "@mantine/hooks";
import { useState, useContext, useRef } from "react";
import { DeSoIdentityContext } from "react-deso-protocol";
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
    TypographyStylesProvider,
    Container,
    createStyles,
    ActionIcon,
    Collapse,
    Button,
    Modal,
    Loader,
    TextInput,
    Badge,
    rem,
  } from "@mantine/core";
  import { notifications } from "@mantine/notifications";
  import { TwitchPlayer } from "react-twitch-embed";
  import { extractTwitchUsername } from "@/helpers/linkHelper";
  import { TbTrashXFilled } from "react-icons/tb";
  import {
    IconCopy,
    IconRocket,
    IconCheck,
    IconScreenShare,
    IconAt,
    IconBrandYoutube,
    IconBrandTwitch,
    IconKey,
    IconUser,
    IconX,
  } from '@tabler/icons-react';
  import { useRouter } from 'next/router';

export function AddTwitch() {
    const { currentUser } = useContext(DeSoIdentityContext);
    const [opened, { open, close }] = useDisclosure(false);
    const [twitch, setTwitch] = useState('');
    const router = useRouter();
    const embed = useRef(); 
  
    const handleReady = (e) => {
      embed.current = e;
    };

    const handleAddTwitch = async () => {
        try {
          const updateData = {
            UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
            ProfilePublicKeyBase58Check: "",
            NewUsername: "",
            MinFeeRateNanosPerKB: 1000,
            NewCreatorBasisPoints: 100,
            NewDescription: "",
            NewStakeMultipleBasisPoints: 12500,
            ExtraData: {
                TwitchURL: `https://www.twitch.tv/${twitch}`,
            },
          };
          
          await updateProfile(updateData);
          
          notifications.show({
            title: "Success",
            icon: <IconCheck size="1.1rem" />,
            color: "green",
            message: "Twitch Profile Added! Go tell your followers!",
          }); 

          close();

          window.location.reload();
        } catch (error) {
            notifications.show({
                title: "Error Updating Profile",
                icon: <IconX size="1.1rem" />,
                color: "red",
                message: {Error},
              });
          
        }
      };

      const handleRemoveTwitch = async () => {
        try {
          const updateData = {
            UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
            ProfilePublicKeyBase58Check: "",
            NewUsername: "",
            MinFeeRateNanosPerKB: 1000,
            NewCreatorBasisPoints: 100,
            NewDescription: "",
            NewStakeMultipleBasisPoints: 12500,
            ExtraData: {
                TwitchURL: "",
            },
          };
          
          await updateProfile(updateData);
          
          notifications.show({
            title: "Success",
            icon: <IconCheck size="1.1rem" />,
            color: "green",
            message: "Twitch Profile has been removed!",
          }); 

          window.location.reload();
        } catch (error) {
            notifications.show({
                title: "Error Updating Profile",
                icon: <IconX size="1.1rem" />,
                color: "red",
                message: {Error},
              });
          
        }
    
       
      };


    return(
        <>
        <Modal 
        opened={opened} 
        onClose={close} 
        title={
            <Group>
        <Avatar radius="xl" size="lg" src="https://pbs.twimg.com/profile_images/1328847897933320197/7w2ufMZn_400x400.png" />
           <Text fw={555}>
                Add Twitch
            </Text>
        </Group>
        } 
        centered
        >

{currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL ? (
    <>
    <Space h="md"/>
    <Center>
    <ActionIcon onClick={handleRemoveTwitch} size="xl" color="red" variant="light">
        <TbTrashXFilled size="1.3rem"/>
    </ActionIcon>
    </Center>
    <Space h="md"/>
   <Group grow>
    <TwitchPlayer channel={extractTwitchUsername(currentUser.ProfileEntryResponse?.ExtraData?.TwitchURL)} darkMode={true} onVideoReady={handleReady} />
   </Group>
    </>

) : (
<>
    <TextInput
           
    description="Add a Twitch Profile to Your Wave!"
    placeholder="Twitch Username..."
        value={twitch}
        onChange={(event) => setTwitch(event.currentTarget.value)}
    />

    {twitch && (
        <>
           <Space h="md"/>
        <Center>
        <TwitchPlayer darkMode={true} channel={twitch} autoplay muted onReady={handleReady} />
        </Center>
        </>
    )}
    <Space h="md"/>
    <Group justify="right">
    <Button onClick={handleAddTwitch} disabled={!twitch} color={"rgba(145, 70, 255)"}>Add</Button>
    </Group>
</>
)}
          
         </Modal>


        <ActionIcon onClick={open}>
        <Avatar radius="xl" size="lg" src="https://pbs.twimg.com/profile_images/1328847897933320197/7w2ufMZn_400x400.png" />
        </ActionIcon>

        </>
    )
}