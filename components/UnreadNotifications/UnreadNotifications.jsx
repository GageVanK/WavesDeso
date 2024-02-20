import { useContext, useEffect, useState } from 'react';
import { getUnreadNotificationsCount, setNotificationMetadata } from 'deso-protocol';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { Text } from '@mantine/core';

export default function UnreadNotifications () {
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const { currentUser } =
    useContext(DeSoIdentityContext);

    const fetchUnreadNotifications = async () => {
        const notifData = await getUnreadNotificationsCount({
          PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        });
    
      
        setUnreadNotifs(notifData.NotificationsCount)
      };
    
      const resetUnreadNotifications = async () => {
       
        const notifData = await getUnreadNotificationsCount({
          PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        });
        await setNotificationMetadata({
          PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
          UnreadNotifications: 0,
          LastUnreadNotificationIndex:  notifData.LastUnreadNotificationIndex
        });
    
        setUnreadNotifs(0)
    
      };
    
      // Fetch the followingPosts when the currentUser changes
      useEffect(() => {
        if (currentUser) {
         
          fetchUnreadNotifications();
        }
      }, [currentUser]);

    return (
<>
<Text fw={500} size="xs">{unreadNotifs}</Text>
</>


    )
}