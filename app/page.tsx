import Link from 'next/link';
import { RotatingPrompts } from '@/components/landing/rotating-prompts';

export default function HomePage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-black p-10">
        <div className="text-lg font-semibold text-white">Foresight</div>
        <RotatingPrompts />
      </section>
      <section className="flex flex-col items-center justify-center gap-3 bg-[#0f1115] p-10 text-white">
        <h1 className="text-3xl font-semibold">Get started</h1>
        <Link href="/app" className="w-56 rounded-full bg-white px-5 py-2 text-center text-black">Log in</Link>
        <Link href="/app" className="w-56 rounded-full border border-white/50 px-5 py-2 text-center">Sign up</Link>
        <Link href="/app" className="text-sm text-zinc-300 underline">Try it first</Link>
      </section>
    </main>
  );
}
