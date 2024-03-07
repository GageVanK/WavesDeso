import React, { useState, useEffect, useRef, useContext } from 'react';
import { db } from '../firebase-config';
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { DeSoIdentityContext } from 'react-deso-protocol';
import {
  TextInput,
  Button,
  Group,
  Paper,
  Space,
  Text,
  Avatar,
  ScrollArea,
  ActionIcon,
  Menu,
  Center,
  Loader,
  UnstyledButton,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { BiSolidDownArrow } from 'react-icons/bi';
import { identity, getPostAssociations, getSinglePost } from 'deso-protocol';
import { GrEmoji } from 'react-icons/gr';

export const Chat = ({ handle }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = collection(db, 'messages');
  const { currentUser } = useContext(DeSoIdentityContext);
  const [isLoadingEmotes, setIsLoadingEmotes] = useState(false);
  const [opened, setOpened] = useState(false);
  const [emotes, setEmotes] = useState();
  const viewport = useRef(null);

  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const q = query(messagesRef, where('room', '==', handle), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });

      setMessages(messages);
    });

    return () => unsubscribe;
  }, [handle]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === '') return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: currentUser.ProfileEntryResponse.Username,
      photoURL:
        `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser.PublicKeyBase58Check}` ||
        null,
      room: handle,
    });

    scrollToBottom();
    setNewMessage('');
  };

  // Get Emotes for user
  const getEmotes = async () => {
    try {
      setIsLoadingEmotes(true);
      const res = await getPostAssociations({
        AssociationType: 'EMOTE',
        AssociationValue: `${handle}'s Emote`,
      });

      const newEmotes = [];

      for (const association of res.Associations) {
        const postHash = association.PostHashHex;
        const response = await getSinglePost({ PostHashHex: postHash });
        newEmotes.push(response.PostFound);
      }

      console.log(newEmotes);
      setEmotes(newEmotes);
      setIsLoadingEmotes(false);
    } catch (error) {
      console.error('Error getting Emotes:', error);
      setIsLoadingEmotes(false);
    }
  };

  const handleEmoteClick = async (emote) => {
    try {
      await addDoc(messagesRef, {
        text: emote.ImageURLs[0], // Assuming emote.ImageURLs[0] contains the image URL of the emote
        createdAt: serverTimestamp(),
        user: currentUser.ProfileEntryResponse.Username,
        photoURL:
          `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser.PublicKeyBase58Check}` ||
          null,
        room: handle,
      });

      setOpened(false);
    } catch (error) {
      console.error('Error sending emote:', error);
    }
  };

  useEffect(() => {
    getEmotes();
  }, []);

  return (
    <Paper p="sm" className="chat-app">
      <Text fw={777} size="xl" ta="center">
        {handle}&apos;s Chat
      </Text>
      <Space h="md" />
      <ScrollArea h={666} scrollbarSize={6} scrollHideDelay={1500} viewportRef={viewport}>
        <div style={{ height: '666px', maxHeight: '666px', width: '244px' }} className="messages">
          {messages.map((message) => (
            <>
              <Group key={message.id} className="message">
                <Avatar variant="default" radius="xl" size="sm" src={message.photoURL} />
                <Text size="sm" fw={555} truncate="end">
                  {message.user}:
                </Text>

                {message.text.includes('https://images.deso.org/') ? (
                  <Avatar radius="md" src={message.text} />
                ) : (
                  <Text
                    size="sm"
                    style={{
                      maxWidth: '100%', // Ensure message text does not overflow
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal', // Allow text to wrap
                      wordWrap: 'break-word', // Allow long words to break
                    }}
                  >
                    {message.text}
                  </Text>
                )}
              </Group>

              <Space h="xs" />
            </>
          ))}
        </div>
      </ScrollArea>

      <Group justify="right" mb={11}>
        <ActionIcon
          variant="light"
          size="md"
          radius="xl"
          onClick={() => scrollToBottom()}
          style={{
            position: 'fixed',
          }}
        >
          <BiSolidDownArrow />
        </ActionIcon>
      </Group>

      <Space h="sm" />

      <Group justify="center">
        {!currentUser ? (
          <>
            <Button
              fullWidth
              variant="gradient"
              gradient={{ from: 'cyan', to: 'indigo' }}
              onClick={() => {
                identity
                  .login({
                    getFreeDeso: true,
                  })
                  .catch((err) => {
                    if (err?.type === ERROR_TYPES.NO_MONEY) {
                      alert('You need DESO in order to post!');
                    } else {
                      alert(err);
                    }
                  });
              }}
            >
              Sign In to Chat
            </Button>
          </>
        ) : (
          <>
            <Space h="sm" />

            <form onSubmit={handleSubmit} className="new-message-form">
              <Group gap="xs">
                <TextInput
                  rightSection={
                    <>
                      {emotes && emotes.length > 0 && (
                        <>
                          <Menu shadow="md" width={222} opened={opened} onChange={setOpened}>
                            <Menu.Target>
                              <ActionIcon radius="xl" type="button">
                                <GrEmoji />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              {isLoadingEmotes ? (
                                <>
                                  <Space h="md" />
                                  <Center>
                                    <Loader variant="bars" />
                                  </Center>
                                </>
                              ) : (
                                <Group>
                                  {emotes.map((emote, index) => (
                                    <div key={index}>
                                      <UnstyledButton onClick={() => handleEmoteClick(emote)}>
                                        <Avatar radius="md" src={emote.ImageURLs[0]} />
                                      </UnstyledButton>
                                    </div>
                                  ))}
                                </Group>
                              )}
                            </Menu.Dropdown>
                          </Menu>
                        </>
                      )}
                    </>
                  }
                  variant="filled"
                  radius="xl"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  className="new-message-input"
                  placeholder="Enter Message"
                />

                <Button
                  variant="filled"
                  size="xs"
                  radius="xl"
                  type="submit"
                  className="send-button"
                >
                  Send
                </Button>
              </Group>
            </form>
          </>
        )}
      </Group>
    </Paper>
  );
};
