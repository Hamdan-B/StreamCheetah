declare module 'stream-chat' {
  interface MyCustomMessageData extends CustomMessageData {
    color?: string;
    isStreamer?: boolean;
  }
}
