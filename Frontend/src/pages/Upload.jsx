import { useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Upload() {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [video, setVideo] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!video || !thumbnail) {
      setMessage("Video and thumbnail are required")
      return
    }

    const formData = new FormData()

    formData.append("title", title)
    formData.append("description", description)
    formData.append("video", video)
    formData.append("thumbnail", thumbnail)

    try {
      setProgress(0)
      setUploading(true)
      setMessage("Uploading video...")

      const response = await api.post(
        "/videos/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return

            const percent = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            )

            setProgress(percent)
          },
        }
      )

      console.log("UPLOAD:", response.data)

      navigate("/home")
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )

      setMessage(
        error.response?.data?.message ||
          error.message
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-bold">
            Upload video
          </h1>

          <p className="mt-1 text-sm text-[#aaaaaa]">
            Share a new video on Vidndia
          </p>

          <form
            onSubmit={handleUpload}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Add a title"
                required
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3 outline-none focus:border-[#aaaaaa]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tell viewers about your video"
                rows={6}
                required
                className="w-full resize-none rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3 outline-none focus:border-[#aaaaaa]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Video file
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setVideo(e.target.files[0])
                }
                required
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Thumbnail
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files[0])
                }
                required
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] p-3"
              />
            </div>

            {message && (
              <p className="text-sm text-[#aaaaaa]">
                {message}
              </p>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#272727]">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-[#aaaaaa]">
                  Uploading {progress}%
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="rounded-full bg-white px-6 py-2.5 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Upload