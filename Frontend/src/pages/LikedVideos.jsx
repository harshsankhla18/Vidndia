import { useEffect, useState } from "react"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import VideoCard from "@/components/VideoCard"

function LikedVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await api.get(
          "/likes/videos"
        )

        console.log(
          "LIKED VIDEOS:",
          response.data
        )

        const data = response.data?.data || []

        setVideos(
          data.map((item) => item.video || item)
        )
      } catch (error) {
        console.log(
          error.response?.data || error.message
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLikedVideos()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="p-6">

          <h1 className="mb-8 text-2xl font-bold">
            Liked videos
          </h1>

          {loading ? (
            <p className="text-[#aaaaaa]">
              Loading liked videos...
            </p>
          ) : videos.length === 0 ? (
            <p className="text-[#aaaaaa]">
              No liked videos
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default LikedVideos