/**
 * Mouse Events Module.
 *
 * This module provides functionality for handling mouse events in terminal applications.
 */

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
 * Enables "mousepress" events on the *input* stream. Note that `stream` must be
 * an *output* stream (i.e. a Writable Stream instance), usually `process.stdout`.
 *
 * @param stream writable stream instance
 */
export function enableMouse(stream: NodeJS.WritableStream): void {
  stream.write('\x1b[?1000h');
}

/**
 * Disables "mousepress" events from being sent to the *input* stream.
 * Note that `stream` must be an *output* stream (i.e. a Writable Stream instance),
 * usually `process.stdout`.
 *
 * @param stream writable stream instance
 */
export function disableMouse(stream: NodeJS.WritableStream): void {
  stream.write('\x1b[?1000l');
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
    };

    const b = input.charCodeAt(3);
    key.x = input.charCodeAt(4) - 0o40;
    key.y = input.charCodeAt(5) - 0o40;

    key.ctrl = !!((1 << 4) & b);
    key.meta = !!((1 << 3) & b);
    key.shift = !!((1 << 2) & b);

    key.release = (3 & b) === 3;

    if ((1 << 6) & b) {
      // scroll
      key.scroll = 1 & b ? 1 : -1;
    }

    if (!key.release && !key.scroll) {
      key.button = b & 3;
    }

    stream.emit('mousepress', key);
    MostRecentMouseEventEmitedTime = Date.now();
    return true;
  }

  return false;
}

/**
 * Sets up mouse event handling on a stream.
 * 
 * @example
 * import { setupMouseEvents, MouseEvent, MouseAwareStream } from './mouse-events';

  // Cast process.stdin to MouseAwareStream to add mousepress event support
  const stdin = process.stdin as MouseAwareStream;
  const cleanup = setupMouseEvents(stdin, process.stdout);

  stdin.on('mousepress', (mouseEvent: MouseEvent) => {
    console.log('Mouse event:', mouseEvent);
    // { name: 'mouse', x: 10, y: 20, button: 0, ctrl: false, meta: false, shift: false, ... }
  });

  // To clean up when done
  // cleanup();
 *
 * @param input readable stream to receive mouse events
 * @param output writable stream to enable mouse events on
 * @returns a cleanup function that disables mouse events and removes listeners
 */
export function setupMouseEvents(
  input: MouseAwareStream,
  output: NodeJS.WritableStream,
): () => void {
  // Enable mouse events on the output
  enableMouse(output);

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
