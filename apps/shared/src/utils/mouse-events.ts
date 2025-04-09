/**
 * Mouse Events Module.
 *
 * This module provides functionality for handling mouse events in terminal applications.
 */

import { Logger } from './utils.js';

/**
 * Interface for MouseEvent properties
 */
export interface MouseEvent {
  name: 'mouse';
  sequence: string;
  x: number;
  y: number;
  scroll: number;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  release: boolean;
  // Add the new properties for movement tracking
  isMotion: boolean;
  isHover: boolean;
  button?: number;
}

let MostRecentMouseEventEmitedTime = 100000;

/**
 * Chege if mouse event was emitted in the last 10ms
 *
 * @returns true if a mouse event was emitted recently
 */
export function hasMouseEventEmitedRecently(): boolean {
  return Date.now() - MostRecentMouseEventEmitedTime < 10;
}

/**
 * Extended interface for streams that have mousepress listeners
 */
export interface MouseAwareStream extends NodeJS.ReadableStream {
  encoding?: BufferEncoding;
  emit(event: 'mousepress', data: MouseEvent): boolean;
  emit(event: 'data', data: Buffer | string): boolean;
  on(event: 'mousepress', listener: (data: MouseEvent) => void): this;
  on(event: 'data', listener: (data: Buffer | string) => void): this;
}

/**
 * Mouse tracking modes
 */
export enum MouseMode {
  /**
   * Basic mouse button events only (press and release)
   */
  BUTTON = 1000,

  /**
   * Mouse movement while buttons are pressed
   */
  MOTION = 1002,

  /**
   * All mouse movement (including hovering without buttons)
   */
  ANY = 1003,
}

/**
 * Enables specific mouse event tracking mode on the output stream.
 *
 * @param stream writable stream instance
 * @param mode tracking mode to enable
 */
export function enableMouseMode(
  stream: NodeJS.WritableStream,
  mode: MouseMode,
): void {
  stream.write(`\x1b[?${mode}h`);
}

/**
 * Disables specific mouse event tracking mode on the output stream.
 *
 * @param stream writable stream instance
 * @param mode tracking mode to disable
 */
export function disableMouseMode(
  stream: NodeJS.WritableStream,
  mode: MouseMode,
): void {
  stream.write(`\x1b[?${mode}l`);
}

/**
 * Enables "mousepress" events on the *input* stream. Note that `stream` must be
 * an *output* stream (i.e. a Writable Stream instance), usually `process.stdout`.
 *
 * @param stream writable stream instance
 */
export function enableMouse(stream: NodeJS.WritableStream): void {
  // Default to button events only for backward compatibility
  enableMouseMode(stream, MouseMode.BUTTON);
}

/**
 * Enables mouse motion tracking (movement while buttons are pressed)
 *
 * @param stream writable stream instance
 */
export function enableMouseMotion(stream: NodeJS.WritableStream): void {
  enableMouseMode(stream, MouseMode.MOTION);
}

/**
 * Enables all mouse movement tracking, including hover (movement without buttons)
 *
 * @param stream writable stream instance
 */
export function enableMouseAny(stream: NodeJS.WritableStream): void {
  enableMouseMode(stream, MouseMode.ANY);
}

/**
 * Disables "mousepress" events from being sent to the *input* stream.
 * Note that `stream` must be an *output* stream (i.e. a Writable Stream instance),
 * usually `process.stdout`.
 *
 * @param stream writable stream instance
 */
export function disableMouse(stream: NodeJS.WritableStream): void {
  // Disable all mouse tracking modes
  disableMouseMode(stream, MouseMode.BUTTON);
  disableMouseMode(stream, MouseMode.MOTION);
  disableMouseMode(stream, MouseMode.ANY);
}

/**
 * Parses mouse events from input stream and emits them as 'mousepress' events.
 *
 * @param stream readable stream instance
 * @param input input data to parse
 * @returns true if a mouse event was detected and emitted, false otherwise
 */
export function parseMouseEvents(
  stream: MouseAwareStream,
  input: string | Buffer,
): boolean {
  if (Buffer.isBuffer(input)) {
    input = input.toString(stream.encoding || 'utf-8');
  }

  // Check if this is a mouse sequence (ESC [ M)
  if (input.length >= 3 && input.substring(0, 3) === '\x1b[M') {
    const key: MouseEvent = {
      name: 'mouse',
      sequence: input,
      x: 0,
      y: 0,
      scroll: 0,
      ctrl: false,
      meta: false,
      shift: false,
      release: false,
      isMotion: false,
      isHover: false,
    };

    if (input.length < 6) {
      // Incomplete mouse event sequence
      return false;
    }

    const b = input.charCodeAt(3);
    key.x = input.charCodeAt(4) - 0o40;
    key.y = input.charCodeAt(5) - 0o40;

    // Control keys
    key.ctrl = !!((1 << 4) & b);
    key.meta = !!((1 << 3) & b);
    key.shift = !!((1 << 2) & b);

    // Bits 0-1: button (0=left, 1=middle, 2=right, 3=release)
    // Bit 2: shift
    // Bit 3: meta (alt)
    // Bit 4: control
    // Bit 5: motion flag
    // Bit 6: scroll flag (wheel up/down or fifth/sixth button)

    // Detect motion events (bit 5 set)
    key.isMotion = !!((1 << 5) & b);

    // Determine button state (bits 0-1)
    const buttonState = b & 3;
    key.release = buttonState === 3;

    // For motion events:
    // - If button state is 3 (no button pressed) and motion flag is set,
    //   it's a hover event (MOUSE_ANY mode)
    key.isHover = key.isMotion && buttonState === 3;

    // Handle scroll events (bit 6)
    if ((1 << 6) & b) {
      // Bit 0 determines scroll direction
      key.scroll = 1 & b ? 1 : -1;
    }

    // Set button number only if it's a press or motion with button pressed
    if (!key.release && !key.scroll) {
      key.button = buttonState;
    }

    // Emit the mouse event
    stream.emit('mousepress', key);
    MostRecentMouseEventEmitedTime = Date.now();
    return true;
  }

  // Not a mouse event, return quietly without logging
  return false;
}

/**
 * Debug function to log details about a mouse event
 *
 * @param event The mouse event to debug
 */
export function debugMouseEvent(event: MouseEvent): void {
  if (!event) return;

  const details = {
    x: event.x,
    y: event.y,
    button: event.button,
    release: event.release,
    isMotion: event.isMotion,
    isHover: event.isHover,
    scroll: event.scroll,
    modifiers: {
      ctrl: event.ctrl,
      meta: event.meta,
      shift: event.shift,
    },
  };

  Logger.debug('Mouse event:', details);

  // Human-readable description of event type
  let eventType = '';
  if (event.scroll !== 0) {
    eventType = `Scroll ${event.scroll > 0 ? 'up' : 'down'}`;
  } else if (event.isHover) {
    eventType = 'Hover motion';
  } else if (event.isMotion) {
    eventType = `Motion with button ${event.button} pressed`;
  } else if (event.release) {
    eventType = 'Button release';
  } else {
    eventType = `Button ${event.button} press`;
  }

  Logger.debug(`  Type: ${eventType}`);
  Logger.debug(`  Position: (${event.x}, ${event.y})`);
}

/**
 * Testing function to check if a particular mouse mode works in the current terminal
 *
 * @param output writable stream instance (e.g., process.stdout)
 * @param mode mouse mode to test
 * @returns Promise that resolves to true if the mode works, false otherwise
 */
export function testMouseMode(
  output: NodeJS.WritableStream,
  mode: MouseMode,
): Promise<boolean> {
  return new Promise(resolve => {
    const input = process.stdin as unknown as MouseAwareStream;
    // let detected = false;

    // Set a timeout to consider the test failed after 3 seconds
    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 3000);

    // Set up a listener for mouse events
    const mouseHandler = () => {
      // detected = true;
      cleanup();
      resolve(true);
    };

    // Set up the mode
    enableMouseMode(output, mode);
    input.on('mousepress', mouseHandler);

    // Log instructions
    Logger.warn(`Testing mouse mode ${mode}...`);
    Logger.warn(
      'Please move your mouse or click anywhere in the terminal window.',
    );
    Logger.warn('Waiting 3 seconds for mouse event...');

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeout);
      input.removeListener('mousepress', mouseHandler);
      disableMouseMode(output, mode);
    };
  });
}

/**
 * Sets up mouse event handling on a stream with specified mouse tracking mode.
 *
 * @example
 * import { setupMouseEvents, MouseEvent, MouseAwareStream, MouseMode } from './mouse-events';
 *
 * const stdin = process.stdin as MouseAwareStream;
 * // Track all mouse movements including hover
 * const cleanup = setupMouseEventsWithMode(stdin, process.stdout, MouseMode.ANY);
 *
 * stdin.on('mousepress', (mouseEvent: MouseEvent) => {
 *   if (mouseEvent.isHover) {
 *     console.log('Mouse hovering at:', mouseEvent.x, mouseEvent.y);
 *   } else if (mouseEvent.isMotion) {
 *     console.log('Mouse moving with button pressed:', mouseEvent.button);
 *   } else if (mouseEvent.release) {
 *     console.log('Mouse button released');
 *   } else {
 *     console.log('Mouse button pressed:', mouseEvent.button);
 *   }
 * });
 *
 * @param input readable stream to receive mouse events
 * @param output writable stream to enable mouse events on
 * @param mode mouse tracking mode to enable
 * @returns a cleanup function that disables mouse events and removes listeners
 */
export function setupMouseEventsWithMode(
  input: MouseAwareStream,
  output: NodeJS.WritableStream,
  mode: MouseMode = MouseMode.BUTTON,
): () => void {
  // Enable specified mouse tracking mode
  enableMouseMode(output, mode);

  // Set up handler for data events on input
  const onData = (data: Buffer | string): void => {
    parseMouseEvents(input, data);
  };

  input.on('data', onData);

  // Return a cleanup function
  return function cleanup(): void {
    input.removeListener('data', onData);
    disableMouse(output);
  };
}

/**
 * Sets up mouse event handling on a stream.
 *
 * @param input readable stream to receive mouse events
 * @param output writable stream to enable mouse events on
 * @returns a cleanup function that disables mouse events and removes listeners
 */
export function setupMouseEvents(
  input: MouseAwareStream,
  output: NodeJS.WritableStream,
): () => void {
  return setupMouseEventsWithMode(input, output, MouseMode.BUTTON);
}

export function setupAnyMouseEvents(
  input: MouseAwareStream,
  output: NodeJS.WritableStream,
): () => void {
  return setupMouseEventsWithMode(input, output, MouseMode.ANY);
}

// Example usage:
/*
import { setupMouseEvents, MouseEvent, MouseAwareStream } from './mouse-events';

// Cast process.stdin to MouseAwareStream to add mousepress event support
const stdin = process.stdin as MouseAwareStream;
const cleanup = setupMouseEvents(stdin, process.stdout);

stdin.on('mousepress', (mouseEvent: MouseEvent) => {
  console.log('Mouse event:', mouseEvent);
  // { name: 'mouse', x: 10, y: 20, button: 0, ctrl: false, meta: false, shift: false, ... }
});

// To clean up when done
// cleanup();
*/

//  ---------

export function isMouseEscapeSequence(input: string): boolean {
  return input.length >= 3 && input.substring(0, 3) === '\x1b[M';
}

// Add helper function to detect mouse motion events
export function isMouseMotion(event: MouseEvent): boolean {
  return event.isMotion === true;
}

// Add helper function to detect mouse hover events
export function isMouseHover(event: MouseEvent): boolean {
  return event.isHover === true;
}

// The commented out code remains unchanged
// function isMouseButton(input: string): boolean {
//   return input.length >= 3 && input.charCodeAt(3) >= 0o40 && input.charCodeAt(3) <= 0o43;
// }
// function isMouseCoordinates(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(4) >= 0o40 && input.charCodeAt(4) <= 0o60;
// }
// function isMouseScroll(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(5) >= 0o40 && input.charCodeAt(5) <= 0o60;
// }
// function isMouseRelease(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o43;
// }
// function isMousePress(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o42;
// }
// function isMouseMove(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o41;
// }
// function isMouseScrollUp(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o40;
// }
// function isMouseScrollDown(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o41;
// }
// function isMouseScrollLeft(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o42;
// }
// function isMouseScrollRight(input: string): boolean {
//   return input.length >= 6 && input.charCodeAt(3) === 0o43;
// }
// function isMouseScrollUpOrDown(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41);
// }
// function isMouseScrollLeftOrRight(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43);
// }
// function isMouseScrollUpOrDownOrLeftOrRight(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43);
// }
// function isMouseReleaseOrPress(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o42);
// }
// function isMouseMoveOrPress(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42);
// }
// function isMouseMoveOrRelease(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o43);
// }
// function isMouseMoveOrScroll(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40);
// }
// function isMouseMoveOrScrollUp(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40);
// }
// function isMouseMoveOrScrollDown(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o41);
// }
// function isMouseMoveOrScrollLeft(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42);
// }
// function isMouseMoveOrScrollRight(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o43);
// }
// function isMouseMoveOrScrollUpOrDown(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41);
// }
// function isMouseMoveOrScrollLeftOrRight(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43);
// }
// function isMouseMoveOrScrollUpOrDownOrLeftOrRight(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43);
// }
// function isMouseMoveOrScrollUpOrDownOrLeftOrRightOrRelease(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o43);
// }
// function isMouseMoveOrScrollUpOrDownOrLeftOrRightOrPress(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o42);
// }
// function isMouseMoveOrScrollUpOrDownOrLeftOrRightOrReleaseOrPress(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o42);
// }
// function isMouseMoveOrScrollUpOrDownOrLeftOrRightOrReleaseOrPressOrButton(input: string): boolean {
//   return input.length >= 6 && (input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o40 || input.charCodeAt(3) === 0o41 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o43 || input.charCodeAt(3) === 0o42 || input.charCodeAt(3) === 0o42);
// }

// NEEDS REVISION

/**
 * Common terminal types that are known to support mouse events
 */
export const MOUSE_SUPPORTING_TERMS = [
  'xterm',
  'xterm-256color',
  'screen',
  'screen-256color',
  'tmux',
  'tmux-256color',
  'rxvt-unicode',
  'rxvt-unicode-256color',
  'linux',
  'vt100',
  'konsole',
  'iTerm.app',
  'iTerm2.app',
];

/**
 * Check if the current terminal type is likely to support mouse events
 * based on the TERM environment variable
 *
 * @returns boolean indicating if the terminal likely supports mouse events
 */
export function isMouseSupported(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  const termEnv = process.env['TERM'];
  if (!termEnv) {
    return false;
  }

  return MOUSE_SUPPORTING_TERMS.some(term =>
    termEnv.toLowerCase().includes(term.toLowerCase()),
  );
}

/**
 * Check if the terminal supports basic mouse button events
 *
 * @returns boolean indicating if basic mouse events are likely supported
 */
export function isButtonModeSupported(): boolean {
  return isMouseSupported();
}

/**
 * Check if the terminal supports mouse motion events
 *
 * @returns boolean indicating if mouse motion events are likely supported
 */
export function isMotionModeSupported(): boolean {
  // Most terminals that support mouse events also support motion tracking
  // Some older terminals might not
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  const termEnv = process.env['TERM'];
  if (!termEnv) {
    return false;
  }

  // Exclude known terminals with limited mouse support
  const limitedMouseSupport = ['linux', 'vt100'];
  if (limitedMouseSupport.some(term => termEnv.toLowerCase() === term)) {
    return false;
  }

  return isMouseSupported();
}

/**
 * Check if the terminal supports any mouse mode (hover tracking)
 *
 * @returns boolean indicating if any mouse mode is likely supported
 */
export function isAnyModeSupported(): boolean {
  // Any mouse mode is the most advanced and not supported by all terminals
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  const termEnv = process.env['TERM'];
  if (!termEnv) {
    return false;
  }

  // Only modern terminal emulators support ANY mode
  const anyModeSupportingTerms = [
    'xterm',
    'xterm-256color',
    'screen',
    'screen-256color',
    'tmux',
    'tmux-256color',
    'iTerm.app',
    'iTerm2.app',
  ];

  return anyModeSupportingTerms.some(term =>
    termEnv.toLowerCase().includes(term.toLowerCase()),
  );
}

/**
 * Try to detect the best supported mouse mode for the current terminal
 *
 * @returns the highest supported MouseMode or undefined if mouse events aren't supported
 */
export function detectBestSupportedMouseMode(): MouseMode | undefined {
  if (isAnyModeSupported()) {
    return MouseMode.ANY;
  }

  if (isMotionModeSupported()) {
    return MouseMode.MOTION;
  }

  if (isButtonModeSupported()) {
    return MouseMode.BUTTON;
  }

  return undefined;
}

/**
 * Setup the best available mouse mode for the terminal automatically
 *
 * @param input readable stream to receive mouse events
 * @param output writable stream to enable mouse events on
 * @returns a cleanup function that disables mouse events and removes listeners, or undefined if no mouse mode is supported
 */
export function setupBestAvailableMouseMode(
  input: MouseAwareStream,
  output: NodeJS.WritableStream,
): (() => void) | undefined {
  const bestMode = detectBestSupportedMouseMode();

  if (bestMode === undefined) {
    return undefined;
  }

  return setupMouseEventsWithMode(input, output, bestMode);
}

// END NEEDS REVISION
