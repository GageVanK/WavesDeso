import {
  Switch,
  useMantineTheme,
  useMantineColorScheme,
  ActionIcon,
  useComputedColorScheme,
} from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import cx from 'clsx';
import classes from './ColorScheme.module.css';

export function ColorSchemeToggle() {
  const theme = useMantineTheme();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      <IconSun
        color={theme.colors.yellow[4]}
        className={cx(classes.icon, classes.light)}
        stroke={1.5}
      />
      <IconMoonStars
        color={theme.colors.blue[6]}
        className={cx(classes.icon, classes.dark)}
        stroke={1.5}
      />
    </ActionIcon>
  );
}
