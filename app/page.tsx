'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  // ---------- AUTH ----------
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ---------- STATE ----------
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<any[]>([])

  // ---------- FETCH ----------
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  // ---------- REALTIME ----------
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel('dashboard-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        fetchBookmarks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // ---------- ADD ----------
  const addBookmark = async () => {
    if (!title || !url) return

    const temp = {
      id: crypto.randomUUID(),
      title,
      url,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }

    setBookmarks((prev) => [temp, ...prev])
    setTitle('')
    setUrl('')

    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: user.id,
    })
  }

  // ---------- DELETE ----------
  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    await supabase.from('bookmarks').delete().eq('id', id)
  }

// ---------- LOGIN ----------

if (!user) {
  return (
    <main className="min-h-screen flex items-center justify-center 
      bg-slate-950 
      
      text-white px-6"
    >
      <div className="bg-slate-900 border border-slate-800 backdrop-blur 
        border border-white/10 
        p-10 rounded-2xl 
        shadow-2xl

        text-center w-full max-w-md"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="text-white">Smart</span>{" "}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Bookmarks
          </span>
        </h1>
        

        <p className="text-slate-400 mb-8">
          Save your important links securely
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 
            bg-white text-black 
            py-3 rounded-xl font-medium 
            shadow hover:shadow-md 
            hover:bg-gray-100 
            transition active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-6 h-6"
          >
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.4 35 24 35c-6.1 0-11-4.9-11-11S17.9 13 24 13c2.7 0 5.2 1 7.1 2.6l6-6C33.5 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.8-8.5 19.8-20 0-1.3-.1-2.3-.2-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.7 0 5.2 1 7.1 2.6l6-6C33.5 6.1 29 4 24 4 16 4 9.1 8.7 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.2l-6.4-5.3C29.5 35 26.9 36 24 36c-5.4 0-9.9-3.6-11.5-8.5l-6.5 5C8.8 39.5 15.9 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3 5.1-5.8 6.5l6.4 5.3C39.6 36.6 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>

          Continue with Google
        </button>
      </div>
    </main>
  )
}




// ---------- DASHBOARD ----------
return (
  <main className="min-h-screen bg-slate-950 text-white">
    {/* HEADER */}
    <header className="border-b border-white/10 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <span className="text-3xl mt-1">🔖</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Smart Bookmarks
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Save and manage your important links
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="text-sm text-gray-400 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </header>

    {/* CONTENT */}
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* ADD CARD */}
      <div className="bg-slate-900/70 backdrop-blur border border-white/10 rounded-2xl p-6 mb-10 shadow-xl">
        <h2 className="text-lg font-semibold mb-5 tracking-wide">
          Add new bookmark
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            className="flex-1 bg-slate-800/70 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="flex-1 bg-slate-800/70 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            disabled={!title || !url}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition px-6 py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* LIST */}
      {bookmarks.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-10 text-center text-gray-400">
          <p className="text-lg mb-2">No bookmarks yet</p>
          <p className="text-sm">
            Add your first bookmark above to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="group bg-slate-900/70 border border-white/10 rounded-2xl p-5 flex justify-between items-center hover:bg-slate-800 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex flex-col">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 group-hover:underline text-lg font-medium"
                >
                  {b.title}
                </a>
                <span className="text-sm text-gray-400 truncate max-w-xs">
                  {b.url}
                </span>
              </div>

              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-sm text-red-400 opacity-70 hover:opacity-100 hover:text-red-500 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </main>
)
}