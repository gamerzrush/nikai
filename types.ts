export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
}

export interface FileAttachment {
  name: string;
  type: string;
  url: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  file?: FileAttachment;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
