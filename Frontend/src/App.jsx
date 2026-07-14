import { Routes, Route } from "react-router-dom"

import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

import Home from "@/pages/Home"
import Video from "@/pages/Video"
import Upload from "@/pages/Upload"
import History from "@/pages/History"
import LikedVideos from "@/pages/LikedVideos"
import Playlists from "@/pages/Playlists"
import Playlist from "@/pages/Playlist"
import Dashboard from "@/pages/Dashboard"
import Profile from "@/pages/Profile"
import Settings from "@/pages/Settings"
import Tweets from "@/pages/Tweets"
function App() {
  return (
    <div className="dark">
      <Routes>

        <Route
          path="/"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
              </div>
            </div>
          }
        />

        <Route
          path="/register"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10">
              <div className="w-full max-w-sm md:max-w-4xl">
                <SignupForm />
              </div>
            </div>
          }
        />

        <Route path="/home" element={<Home />} />

        <Route
          path="/video/:videoId"
          element={<Video />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/liked"
          element={<LikedVideos />}
        />

        <Route
          path="/playlists"
          element={<Playlists />}
        />

        <Route
          path="/playlist/:playlistId"
          element={<Playlist />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile" 
          element={<Profile />} 
         />

        <Route 
          path="/settings" 
          element={<Settings />} 
        />
        <Route path="/community" element={<Tweets />} />
      </Routes>
    </div>
  )
}

export default App