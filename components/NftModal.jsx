import { createNFT, getProfiles, getAppState } from 'deso-protocol';
import { useEffect, useState, useContext } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import { notifications } from '@mantine/notifications';
import {
  Text,
  Space,
  Button,
  Title,
  Divider,
  NumberInput,
  Avatar,
  rem,
  Group,
  HoverCard,
  ActionIcon,
  TextInput,
  Switch,
  UnstyledButton,
  Stack,
  Box,
} from '@mantine/core';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { MdDeleteForever } from 'react-icons/md';
import { BiSearchAlt } from 'react-icons/bi';

export function NftModal({ postHash }) {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [nftCopies, setNftCopies] = useState(1);
  const [creatorRoyaltyPercentage, setCreatorRoyaltyPercentage] = useState(0);
  const [coinHolderRoyaltyPercentage, setCoinHolderRoyaltyPercentage] = useState(0);
  const [checked, setChecked] = useState(false);
  const [buyNowPrice, setBuyNowPrice] = useState();
  const [minBidPrice, setMinBidPrice] = useState();
  const [extraCreatorRoyalties, setExtraCreatorRoyalties] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [value, setValue] = useState('');
  const [desoUSD, setDesoUSD] = useState();

  const getDesoUSD = async () => {
    try {
      const appState = await getAppState({
        PublicKeyBase58Check: 'BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD',
      });
      const desoUSDValue = appState.USDCentsPerDeSoCoinbase / 100;

      setDesoUSD(desoUSDValue);
    } catch (error) {
      console.error('Error in getData:', error);
    }
  };

  useEffect(() => {
    getDesoUSD();
  }),
    [];

  const convertToBasisPoints = (percentage) => {
    // Convert percentage to basis points
    const basisPoints = percentage * 100;
    return basisPoints;
  };

  const convertDESOToNanos = (deso) => {
    // Convert DESO to nanos
    const nanoToDeso = 0.000000001;
    const nanos = Math.round(deso / nanoToDeso); // Round to the nearest integer

    return Number(nanos); // Convert to BigInt
  };

  const convertDESOToUSD = (deso) => {
    let usdValue = deso * desoUSD;

    if (usdValue < 0.01) {
      usdValue = 0.01;
    }

    return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const SearchUser = async () => {
    const request = {
      UsernamePrefix: value,
      NumToFetch: 10,
    };

    const response = await getProfiles(request);
    setSearchResults(response.ProfilesFound);
  };

  const handleInputChange = (event) => {
    setValue(event.currentTarget.value);
    SearchUser();
  };

  const handleAddCreator = (publicKey) => {
    // Add selected creator with default percentage
    setExtraCreatorRoyalties((prevState) => {
     
      return {
        ...prevState,
        [publicKey]: convertToBasisPoints(0), // Convert default percentage to basis points
      };
    });
    // Clear search results and value
    setSearchResults([]);
    setValue('');
  };

  const handleCreatorPercentageChange = (publicKey, updatedPercentage) => {
  
    setExtraCreatorRoyalties((prevState) => {
      const updatedMap = {
        ...prevState,
        [publicKey]: convertToBasisPoints(updatedPercentage), // Convert updated percentage to basis points
      };
 
      return updatedMap;
    });
  };

  const deleteExtraCreator = (publicKey) => {
    setExtraCreatorRoyalties((prevState) => {
  
      const newOptions = { ...prevState };
      delete newOptions[publicKey];
      return newOptions;
    });
  };

  const handleMint = async () => {
    try {
      const request = {
        UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        NFTPostHashHex: postHash,
        NumCopies: nftCopies,
        NFTRoyaltyToCreatorBasisPoints: convertToBasisPoints(creatorRoyaltyPercentage),
        NFTRoyaltyToCoinBasisPoints: convertToBasisPoints(coinHolderRoyaltyPercentage),
        MinBidAmountNanos: convertDESOToNanos(minBidPrice),
        BuyNowPriceNanos: (checked && convertDESOToNanos(buyNowPrice)) || undefined,
        IsBuyNow: checked,
        AdditionalDESORoyaltiesMap: extraCreatorRoyalties || undefined,
        HasUnlockable: false,
        IsForSale: true,
        MinFeeRateNanosPerKB: 1000,
      };

      const response = await createNFT(request);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'You successfully minted this post!',
      });
    } catch (error) {
      console.log(error);
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
    }
  };
  return (
    <>
      <Text size="sm">
        Non-Fungible Tokens (NFTs) are a great way for Creators to monetize their content. Waves
        gives you full control to set your Price, Royalty Percentages, and more.
      </Text>
      <Space h="lg" />
      <Divider />
      <Space h="lg" />
      <NumberInput
        variant="filled"
        label="NFT Copies"
        description="Sell Single or Multiple Copies."
        defaultValue={1}
        min={1}
        allowDecimal={false}
        allowNegative={false}
        value={nftCopies}
        onChange={setNftCopies}
        thousandSeparator=","
      />
      <Space h="lg" />
      <Divider />
      <Space h="lg" />
      <Group justify="right">
        <Switch
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
          labelPosition="left"
          label="Set as Buy Now"
        />
      </Group>
      <Space h="xs" />
      {checked && (
        <>
          <NumberInput
            variant="filled"
            label="Buy Now Price"
            description="Set the buy now price for your NFT."
            placeholder="Enter Amount in $DESO"
            allowNegative={false}
            hideControls
            prefix="$DESO "
            value={buyNowPrice}
            onChange={setBuyNowPrice}
            thousandSeparator=","
          />
          {checked && buyNowPrice && <> ≈ {convertDESOToUSD(buyNowPrice)}</>}
          <Space h="xs" />
        </>
      )}
      <NumberInput
        variant="filled"
        label="Minimum Bid"
        description="Set the minimum bid price for your NFT."
        placeholder="Enter Amount in $DESO"
        allowNegative={false}
        hideControls
        prefix="$DESO "
        value={minBidPrice}
        onChange={setMinBidPrice}
        thousandSeparator=","
        error={
          checked &&
          buyNowPrice &&
          minBidPrice < buyNowPrice &&
          'Min Bid must be greater than or equal to Buy Now Price'
        }
      />
      {minBidPrice && <> ≈ {convertDESOToUSD(minBidPrice)}</>}
      <Space h="lg" />
      <Divider />
      <Space h="lg" />

      <NumberInput
        variant="filled"
        label="Your Royalty Percentage"
        description="This goes directly to you for secondary sales."
        placeholder="Percents"
        suffix="%"
        defaultValue={20}
        allowNegative={false}
        value={creatorRoyaltyPercentage}
        onChange={setCreatorRoyaltyPercentage}
        min={0}
        max={100}
        error={creatorRoyaltyPercentage > 100 && 'Cannot be greater than 100%'}
      />
      <Space h="lg" />
      <NumberInput
        variant="filled"
        label="Coin Holder Royalty Percentage"
        description="This will be distributed to your Creator Coin Holders."
        defaultValue={1}
        placeholder="Percents"
        suffix="%"
        allowNegative={false}
        min={0}
        max={100}
        value={coinHolderRoyaltyPercentage}
        onChange={setCoinHolderRoyaltyPercentage}
        error={coinHolderRoyaltyPercentage > 100 && 'Cannot be greater than 100%'}
      />

      <Space h="lg" />
      <Group>
        <Text fw={500} size="sm">
          Add More Creator Royalties
        </Text>
        <HoverCard width={280} closeDelay={700} shadow="md">
          <HoverCard.Target>
            <ActionIcon radius="xl" size="xs" variant="subtle">
              <TiInfoLargeOutline />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text fw={500} size="xs">
              Set up royalties for specific Creators. This enables partnered content for NFT Sales.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
      <Space h="xs" />

      <TextInput
        leftSection={<BiSearchAlt size="1.2rem" />}
        variant="filled"
        placeholder="Search for a creator by username"
        value={value}
        onChange={handleInputChange}
      />

      <Space h="xs" />
      {value && searchResults.length > 0 && (
        <Stack>
          {searchResults.map((profile) => (
            <UnstyledButton
              key={profile.PublicKeyBase58Check}
              onClick={() => handleAddCreator(profile.PublicKeyBase58Check)}
            >
              <Group>
                <Avatar
                  src={
                    `https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
                    null
                  }
                  radius="xl"
                />
                <div>
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
        </Stack>
      )}

      <Space h="xs" />
      {Object.entries(extraCreatorRoyalties).map(([publicKey, percentage], index) => (
        <>
          <Group key={index}>
            <Group grow>
              <Group>
                <Avatar
                  src={
                    `https://node.deso.org/api/v0/get-single-profile-picture/${publicKey}` || null
                  }
                  radius="xl"
                />
                <Box w={111}>
                  <Text size="sm" fw={500} truncate="end">
                    {publicKey}
                  </Text>
                </Box>
              </Group>

              <NumberInput
                variant="filled"
                defaultValue={percentage}
                placeholder="Percents"
                suffix="%"
                min={0}
                max={100}
                allowNegative={false}
                onChange={(updatedValue) => handleCreatorPercentageChange(publicKey, updatedValue)}
                error={percentage / 100 > 100 && 'Cannot be greater than 100%'}
              />
            </Group>
            <ActionIcon
              radius="xl"
              size="sm"
              color="red"
              variant="subtle"
              type="button"
              onClick={() => deleteExtraCreator(publicKey)}
            >
              <MdDeleteForever />
            </ActionIcon>
          </Group>
          <Space h="xs" />
        </>
      ))}

      <Space h="xs" />
      <Group justify="right">
        <Button disable={!minBidPrice || (checked && !minBidPrice)} onClick={() => handleMint()}>
          Mint
        </Button>
      </Group>
    </>
  );
}
