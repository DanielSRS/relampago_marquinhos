import React, { useEffect, useMemo } from 'react';
import { setupMouseEvents } from '../../utils/mouse-events.js';

const ENABLED = true;

const enterAltScreenCommand = '\x1b[?1049h';
const leaveAltScreenCommand = '\x1b[?1049l';
const enterAltScreen = () => {
  if (ENABLED) {
    // eslint-disable-next-line no-console
    console.log(enterAltScreenCommand);
  }
};
const leaveAltScreen = () => {
  if (ENABLED) {
    // eslint-disable-next-line no-console
    console.log(leaveAltScreenCommand);
  }
};

interface ScreenProps {
  children: React.ReactNode;
}

export const Screen = (props: ScreenProps) => {
  const { children } = props;
  useMemo(() => {
    enterAltScreen();
  }, []);

  useEffect(() => {
    const disableMouse = setupMouseEvents(process.stdin, process.stdout);
    return () => {
      leaveAltScreen();
      disableMouse();
    };
  }, []);

  return children;
};
