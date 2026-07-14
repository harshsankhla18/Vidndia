import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Playlists() {
  const navigate = useNavigate()

  const [playlists, setPlaylists] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchPlaylists = async () => {
    try {
      const userResponse = await api.get(
        "/users/current-user"
      )

      const userId =
        userResponse.data?.data?._id

      const response = await api.get(
        `/playlists/user/${userId}`
      )

      console.log("PLAYLISTS:", response.data)

      setPlaylists(response.data?.data || [])
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!name.trim()) return

    try {
      await api.post("/playlists/create", {
        name,
        description,
      })

      setName("")
      setDescription("")

      await fetchPlaylists()
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="p-6">

          <h1 className="text-2xl font-bold">
            Playlists
          </h1>

          <form
            onSubmit={handleCreate}
            className="mt-6 flex max-w-3xl gap-3"
          >
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Playlist name"
              className="flex-1 rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3 outline-none"
            />

            <input
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Description"
              className="flex-1 rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3 outline-none"
            />

            <button className="rounded-full bg-white px-6 font-semibold text-black">
              Create
            </button>
          </form>

          {loading ? (
            <p className="mt-8 text-[#aaaaaa]">
              Loading playlists...
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() =>
                    navigate(
                      `/playlist/${playlist._id}`
                    )
                  }
                  className="cursor-pointer rounded-xl bg-[#272727] p-5 hover:bg-[#3f3f3f]"
                >
                  <h2 className="text-lg font-semibold">
                    {playlist.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#aaaaaa]">
                    {playlist.description}
                  </p>

                  <p className="mt-4 text-sm text-[#aaaaaa]">
                    {playlist.videos?.length || 0} videos
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Playlists