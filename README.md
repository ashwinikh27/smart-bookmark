# Smart Bookmark App

This is a simple bookmark management app built using Next.js and Supabase. The goal of this project was to implement Google authentication, private user data, real-time updates, and deploy the app on Vercel.

## Features
- Login using Google OAuth
- Add bookmarks with title and URL
- Bookmarks are private to each user
- Real-time updates without page refresh
- Delete bookmarks
- Deployed on Vercel with a live URL

## Tech Stack
- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel (Deployment)

## Challenges Faced & How I Solved Them

### Google Authentication
I implemented Google login using Supabase OAuth. Initially, handling the user session correctly was a bit confusing, but I used `supabase.auth.getUser()` to check if a user is logged in and conditionally render the login or app screen.

### Private User Data
To make sure users can only see their own bookmarks, I used a `user_id` column and applied Row Level Security (RLS) policies in Supabase. This ensures that one user cannot access another's data.

### Real-time Update
I wanted the bookmark list to update instantly without refreshing the page. For this, I used Supabase Realtime subscriptions so changes appear automatically, even across multiple tabs. 

### Delete Experience
Initially, deleting a bookmark felt slow. To improve the user experience, I updated the UI immediately and handled the database deletion in the background.

### Deployment on Vercel
During deployment, I worked with environment variables and learned how to manage them safely. I made sure `.env.local` was ignored by GitHub and added the required Supabase keys in Vercel's environment variables section.

## Live Demo
https://smart-bookmark-pi-seven.vercel.app

## GitHub Repo 
https://github.com/ashwinikh27/smart-bookmark

