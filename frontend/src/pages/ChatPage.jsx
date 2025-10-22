import React from 'react';
import { useSelector } from 'react-redux';
import Chat from '../components/Chat.jsx';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { user } = useSelector((state) => state.auth);
  const { chatId } = useParams();
  const chats = useSelector((state) => state.chat.chats);
  const chat = chats.find((c) => c._id === chatId);

  if (!user || !chat) return <div>Loading chat...</div>;

  const otherUserId = chat.participants.find((p) => p._id !== user._id)._id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <Chat userId={user._id} otherUserId={otherUserId} />
    </div>
  );
}
