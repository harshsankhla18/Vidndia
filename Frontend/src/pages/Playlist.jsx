import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import VideoCard from "@/components/VideoCard"

function Playlist() {
  const { playlistId } = useParams()

  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await api.get(
          `/playlists/${playlistId}`
        )

        console.log("PLAYLIST:", response.data)

        setPlaylist(response.data?.data)
      } catch (error) {
        console.log(
          error.response?.data || error.message
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylist()
  }, [playlistId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-10 text-white">
        Loading playlist...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="p-6">

          <h1 className="text-2xl font-bold">
            {playlist?.name}
          </h1>

          <p className="mt-2 text-[#aaaaaa]">
            {playlist?.description}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {playlist?.videos?.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
              />
            ))}

          </div>

        </div>
      </main>
    </div>
  )
}

export default Playlist