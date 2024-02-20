import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import {
  AppShell,
  MantineProvider,
  Button,
  ActionIcon,
  Group,
  Space,
  Container,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { configure } from 'deso-protocol';
import { DeSoIdentityProvider } from 'react-deso-protocol';
import { LivepeerConfig, createReactClient, studioProvider } from '@livepeer/react';
import { Notifications } from '@mantine/notifications';
import { MantineAppShell } from '@/components/MantineAppShell/MantineAppShell';
import { theme } from '../theme';
import '@mantine/notifications/styles.css';

configure({
  spendingLimitOptions: {
    GlobalDESOLimit: 1000000000,
    TransactionCountLimitMap: {
      UPDATE_PROFILE: 'UNLIMITED',
      CREATE_NFT: 'UNLIMITED',
      UPDATE_NFT: 'UNLIMITED',
      SUBMIT_POST: 'UNLIMITED',
      NEW_MESSAGE: 'UNLIMITED',
      BASIC_TRANSFER: 'UNLIMITED',
      FOLLOW: 'UNLIMITED',
      LIKE: 'UNLIMITED',
      CREATOR_COIN: 'UNLIMITED',
      CREATOR_COIN_TRANSFER: 'UNLIMITED',
      ACCEPT_NFT_BID: 'UNLIMITED',
      BURN_NFT: 'UNLIMITED',
      CREATE_USER_ASSOCIATION: 'UNLIMITED',
      CREATE_POST_ASSOCIATION: 'UNLIMITED',
      ACCESS_GROUP: 'UNLIMITED',
      ACCESS_GROUP_MEMBERS: 'UNLIMITED',
    },
    CreatorCoinOperationLimitMap: {
      '': { any: 'UNLIMITED' },
    },
    AssociationLimitMap: [
      {
        AssociationClass: 'Post',
        AssociationType: '',
        AppScopeType: 'Any',
        AppPublicKeyBase58Check: '',
        AssociationOperation: 'Any',
        OpCount: 'UNLIMITED',
      },
      {
        AssociationClass: 'User',
        AssociationType: '',
        AppPublicKeyBase58Check: '',
        AppScopeType: 'Any',
        AssociationOperation: 'Any',
        OpCount: 'UNLIMITED',
      },
    ],
  },
});

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: 'a300ff16-01de-4ac9-afbd-0a883f0dccf6',
  }),
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={livepeerClient}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Head>
          <title>Waves</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        <DeSoIdentityProvider>
          <MantineAppShell>
            <Component {...pageProps} />
            <Notifications />
          </MantineAppShell>
        </DeSoIdentityProvider>
      </MantineProvider>
    </LivepeerConfig>
  );
}
