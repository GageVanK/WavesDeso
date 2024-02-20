import { ActionIcon, UnstyledButton, Group, TextInput, Avatar, useMantineTheme, Text } from "@mantine/core";
import { useState } from "react";
import { getProfiles } from "deso-protocol";
import { useRouter } from 'next/router';
import { IconX } from "@tabler/icons-react";
import { BiSearchAlt } from 'react-icons/bi';
import classes from "./Spotlight/Spotlight.module.css";

export const Search = ({close}) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const [value, setValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const SearchUser = async () => {
    const request = {
      UsernamePrefix: value,
      NumToFetch: 10,
      OrderBy: "newest_last_post",
    };

    const response = await getProfiles(request);
    setSearchResults(response.ProfilesFound);
  
  };

  const handleInputChange = (event) => {
    setValue(event.currentTarget.value);
    SearchUser();
  };

  return (
    <>
      
        <TextInput
          ml={2}
          value={value}
          onChange={handleInputChange}
          radius="md"
          size="md"
          placeholder="Search"
          variant="filled"
          withAsterisk
          leftSection={<BiSearchAlt size="1.2rem" />}
          rightSection={
            value && (
              <ActionIcon onClick={() => { setValue(""); }} size={32} radius="xl" color={theme.primaryColor} variant="light">
              <IconX size="1.1rem"/>
              </ActionIcon>
            ) 
          }
          rightSectionWidth={42}
         
        />

        {value && searchResults.length > 0 && (
              <div>
                  {searchResults.map((profile) => (
                    <UnstyledButton
                    onClick={() => {router.push(`/wave/${profile.Username}`); close && close();}}
                    className={classes.user}
                  >
                    <Group>
                      <Avatar
                        src={`https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
                        null}
                        radius="xl"
                      />
          
                      <div style={{ flex: 1 }}>
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
              
              </div>
            )}
   
    </>
  );
};