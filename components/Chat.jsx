import React, { useState, useEffect, useRef, useContext } from "react";
import { db } from "../firebase-config";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit 
} from "firebase/firestore";
import { DeSoIdentityContext } from "react-deso-protocol";
import { TextInput, Button, Group, Paper, Space, Text, Avatar, ScrollArea, ActionIcon} from '@mantine/core';
import { useRouter } from "next/router";
import { BiSolidDownArrow } from "react-icons/bi";
import {
   identity
  } from "deso-protocol";
  
export const Chat = ({ handle }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");
  const { currentUser } = useContext(DeSoIdentityContext);

  const viewport = useRef(null);
  
  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  };

  
  useEffect(() => {
    const q = query(
      messagesRef,
      where("room", "==", handle),
      orderBy("createdAt"),
    );
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

    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: currentUser.ProfileEntryResponse.Username,
      photoURL: `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser.PublicKeyBase58Check}` || null,
      room: handle,
    });

    scrollToBottom();
    setNewMessage("");
  };

  return (
    <Paper p="sm" className="chat-app">
      <Text fw={777} size="xl" ta="center">{handle}&apos;s Chat</Text>
      <Space h="md"/>
      <ScrollArea h={666} scrollbarSize={6} scrollHideDelay={1500} viewportRef={viewport}>
      <div style={{ height: "666px", maxHeight: "666px", width: "244px"}} className="messages">
        {messages.map((message) => (
          <>
          <Group key={message.id} className="message">

<Avatar variant="default" radius="xl" size="sm" src={message.photoURL} />
<Text size="sm" fw={555} truncate="end">
  {message.user}:
</Text>

      <Text size="sm" style={{
            maxWidth: "100%",  // Ensure message text does not overflow
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",  // Allow text to wrap
            wordWrap: "break-word",  // Allow long words to break
          }}>{message.text}
      </Text>
      
</Group>

  <Space h="xs" />
  </>
        ))}

        
      </div>
      </ScrollArea>
       
<Group justify="right" mb={11}>
<ActionIcon variant="light" size="md" radius="xl" 
      onClick={() => scrollToBottom()}
      style={{
        position: "fixed",
        
      }}
    >
      <BiSolidDownArrow />
    </ActionIcon>

</Group>
        
<Space h="sm"/>

   <Group justify="center">
    {!currentUser ? (
      <>
  <Button
                    fullWidth
                    variant="gradient"
                gradient={{ from: "cyan", to: "indigo" }}
                onClick={() => {
                  identity
                    .login({
                      getFreeDeso: true,
                    })
                    .catch((err) => {
                      if (err?.type === ERROR_TYPES.NO_MONEY) {
                        alert("You need DESO in order to post!");
                      } else {
                        alert(err);
                      }
                    });
                }}
                  >
                    Sign In to Chat
                  </Button>
      </>
    ):(
      <>
      <Space h="sm"/>
      <form onSubmit={handleSubmit} className="new-message-form">
        <Group >
        <TextInput
          variant="filled"
          radius="xl"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="new-message-input"
          placeholder="Type your message here..."
        />
        
        <Button variant="filled" size="xs" radius="xl" type="submit" className="send-button">
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