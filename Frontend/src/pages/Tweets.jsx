import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Tweets() {
  const [tweets, setTweets] = useState([])
  const [content, setContent] = useState("")

  const fetchTweets = async () => {
    try {
      const response = await api.get("/tweets")

      setTweets(response.data?.data || [])
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [])

  const createTweet = async (e) => {
    e.preventDefault()

    if (!content.trim()) return

    try {
      await api.post("/tweets/create", {
        content,
      })

      setContent("")

      await fetchTweets()
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )
    }
  }

  const likeTweet = async (tweetId) => {
    try {
      await api.post(
        `/likes/toggle/t/${tweetId}`
      )

      await fetchTweets()
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
        <div className="mx-auto max-w-2xl p-6">

          <h1 className="text-2xl font-bold">
            Community
          </h1>

          <form
            onSubmit={createTweet}
            className="mt-6 rounded-xl border border-[#303030] bg-[#181818] p-5"
          >
            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Share something with the community..."
              className="w-full resize-none bg-transparent outline-none"
              rows={4}
            />

            <div className="mt-4 flex justify-end">
              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black">
                Post
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">

            {tweets.map((tweet) => (
              <div
                key={tweet._id}
                className="rounded-xl border border-[#303030] bg-[#181818] p-5"
              >
                <div className="flex items-center gap-3">

                  <img
                    src={tweet.owner?.avatar?.url}
                    alt={tweet.owner?.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold">
                      {tweet.owner?.fullName}
                    </p>

                    <p className="text-sm text-[#aaaaaa]">
                      @{tweet.owner?.username}
                    </p>
                  </div>

                </div>

                <p className="mt-4 whitespace-pre-wrap">
                  {tweet.content}
                </p>

                <button
                  onClick={() =>
                    likeTweet(tweet._id)
                  }
                  className="mt-5 flex items-center gap-2 text-[#aaaaaa] hover:text-white"
                >
                  <Heart size={20} />

                  Like
                </button>

              </div>
            ))}

          </div>

        </div>
      </main>
    </div>
  )
}

export default Tweets