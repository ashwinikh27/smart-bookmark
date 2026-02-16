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
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
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

  // ---------- REALTIME (FIXES YOUR ISSUE) ----------
  useEffect(() => {
    if (!user) return

    // initial fetch
    fetchBookmarks()

    // realtime subscription
    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks()
        }
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

  // ✅ show instantly
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
  // ✅ remove instantly from UI
  setBookmarks((prev) => prev.filter((b) => b.id !== id))

  // background delete
  await supabase.from('bookmarks').delete().eq('id', id)
}


  // ---------- UI ----------
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          onClick={signInWithGoogle}
          className="rounded bg-black px-6 py-3 text-white"
        >
          Sign in with Google
        </button>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="mb-4 text-xl font-bold">
        Welcome, {user.email}
      </h1>

      {/* ADD FORM */}
      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          className="bg-blue-600 px-4 py-2 text-white"
        >
          Add
        </button>
      </div>

      {/* BOOKMARK LIST */}
      <ul>
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="mb-2 flex justify-between items-center"
          >
            <a
              href={b.url}
              target="_blank"
              className="text-blue-700 underline"
            >
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
