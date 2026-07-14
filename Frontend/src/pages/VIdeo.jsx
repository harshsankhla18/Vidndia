import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Video() {
  const { videoId } = useParams()

  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)

  const historyAdded = useRef(false)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [videoResponse, commentResponse] = await Promise.all([
          api.get(`/videos/${videoId}`),
          api.get(`/comments/${videoId}`),
        ])

        console.log("VIDEO:", videoResponse.data)
        console.log("COMMENTS:", commentResponse.data)

        setVideo(videoResponse.data.data)

        setComments(
          commentResponse.data.data?.docs ||
          commentResponse.data.data ||
          []
        )
      } catch (error) {
        console.log(error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }

    historyAdded.current = false

    fetchPageData()
  }, [videoId])

  const handleVideoPlay = async () => {
    if (historyAdded.current) return

    historyAdded.current = true

    try {
      const response = await api.post(
        `/users/history/${videoId}`
      )

      console.log("WATCH HISTORY:", response.data)
    } catch (error) {
      historyAdded.current = false

      console.log(
        error.response?.data || error.message
      )
    }
  }

  const handleLike = async () => {
    try {
      const response = await api.post(
        `/likes/toggle/v/${videoId}`
      )

      console.log("LIKE:", response.data)
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await api.post(
        `/subscriptions/c/${video.owner._id}`
      )

      console.log("SUBSCRIBE:", response.data)
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()

    if (!comment.trim()) return

    try {
      const response = await api.post(
        `/comments/${videoId}`,
        {
          content: comment,
        }
      )

      console.log("COMMENT:", response.data)

      setComment("")

      const commentResponse = await api.get(
        `/comments/${videoId}`
      )

      setComments(
        commentResponse.data.data?.docs ||
        commentResponse.data.data ||
        []
      )
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-10 text-white">
        Loading video...
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-10 text-white">
        Video not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="mx-auto max-w-7xl p-6">

          <video
            src={video.videoFile?.url}
            controls
            autoPlay
            onPlay={handleVideoPlay}
            className="aspect-video w-full rounded-xl bg-black"
          />

          <h1 className="mt-4 text-xl font-bold">
            {video.title}
          </h1>

          <div className="mt-4 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <img
                src={video.owner?.avatar?.url}
                alt={video.owner?.username}
                className="h-10 w-10 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold">
                  {video.owner?.username}
                </p>

                <p className="text-xs text-[#aaaaaa]">
                  Channel
                </p>
              </div>

              <button
                onClick={handleSubscribe}
                className="ml-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
              >
                Subscribe
              </button>
            </div>

            <button
              onClick={handleLike}
              className="rounded-full bg-[#272727] px-5 py-2 hover:bg-[#3f3f3f]"
            >
              👍 Like
            </button>

          </div>

          <div className="mt-4 rounded-xl bg-[#272727] p-4">

            <p className="font-semibold">
              {video.views || 0} views
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm">
              {video.description}
            </p>

          </div>

          <div className="mt-8">

            <h2 className="text-xl font-bold">
              Comments
            </h2>

            <form
              onSubmit={handleComment}
              className="mt-5 flex gap-3"
            >
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border-b border-[#555] bg-transparent px-2 py-2 outline-none focus:border-white"
              />

              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2 font-semibold text-black"
              >
                Comment
              </button>
            </form>

            <div className="mt-8 space-y-6">

              {comments.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3"
                >
                  <img
                    src={item.owner?.avatar?.url}
                    alt={item.owner?.username}
                    className="h-9 w-9 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      @{item.owner?.username}
                    </p>

                    <p className="mt-1 text-sm text-[#f1f1f1]">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>
      </main>
    </div>
  )
}

export default Video