import { Paper, Space, Container } from '@mantine/core';
import { useState } from 'react';
import { SignAndSubmitTx } from '../components/SignAndSubmit/SubmitPost';
import { HomeTabs } from '@/components/HomeTabs/HomeTabs';

export default function HomePage() {
  return (
    <>
      <Container size="30rem" px={0}>
        <SignAndSubmitTx close={undefined} />
      </Container>
      <Space h="xl" />

      <HomeTabs />

      <Space h="md" />
    </>
  );
}
