import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setIo = (io: SocketIOServer) => {
  ioInstance = io;
};

export const getIo = (): SocketIOServer | null => {
  return ioInstance;
};
