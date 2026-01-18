import { ChatUI } from "@/components/chat/ChatUI";

;

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ChatUI/>
    </div>
  );
}
