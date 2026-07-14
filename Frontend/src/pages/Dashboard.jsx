import { useEffect, useState } from "react"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsResponse, videosResponse] =
          await Promise.all([
            api.get("/dashboard/stats"),
            api.get("/dashboard/videos"),
          ])

        console.log(
          "STATS:",
          statsResponse.data
        )

        console.log(
          "CHANNEL VIDEOS:",
          videosResponse.data
        )

        setStats(statsResponse.data?.data)

        setVideos(
          videosResponse.data?.data || []
        )
      } catch (error) {
        console.log(
          error.response?.data || error.message
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-10 text-white">
        Loading dashboard...
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
            Channel dashboard
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            <StatCard
              title="Total Views"
              value={
                stats?.totalViews || 0
              }
            />

            <StatCard
              title="Subscribers"
              value={
                stats?.totalSubscribers || 0
              }
            />

            <StatCard
              title="Total Likes"
              value={
                stats?.totalLikes || 0
              }
            />

          </div>

          <h2 className="mt-10 text-xl font-bold">
            Your videos
          </h2>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#272727]">

            {videos.map((video) => (
              <div
                key={video._id}
                className="flex items-center gap-4 border-b border-[#272727] p-4"
              >

                <img
                  src={video.thumbnail?.url}
                  alt={video.title}
                  className="h-20 w-36 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <p className="font-semibold">
                    {video.title}
                  </p>

                  <p className="text-sm text-[#aaaaaa]">
                    {video.views || 0} views
                  </p>
                </div>

                <p className="text-sm text-[#aaaaaa]">
                  {video.isPublished
                    ? "Published"
                    : "Private"}
                </p>

              </div>
            ))}

          </div>

        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-[#272727] p-6">
      <p className="text-sm text-[#aaaaaa]">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  )
}

export default Dashboard