export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
}

<<<<<<< HEAD
export interface FileAttachment {
  name: string;
  type: string;
  url: string;
}

=======
>>>>>>> a33004e48aff2727052893d65efad48b7b8eaad0
export interface Message {
  id: string;
  text: string;
  sender: Sender;
<<<<<<< HEAD
  file?: FileAttachment;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
=======
}
>>>>>>> a33004e48aff2727052893d65efad48b7b8eaad0
