const async = require("async")
const Tweet = require("../models/tweet")
const User = require("../models/user")

const { promisify } = require("util")

module.exports = function(io) {
  io.on("connection", function(socket) {
    // console.log('connected')
    var user = socket.request.user
    if (user) {
      // // console.log(user.name) // third
    }
    socket.on("tweet", async function(data) {
      // console.log('on tweet data:', data)

      // save tweet content (with owner info) to to tweet collection
      // push tweet Id to field: tweets of user collection
      // emit
      try {
        const tweet = new Tweet({
          owner: user._id,
          content: data.content
        })

        let newTweet = await tweet.save()

        let updatedUser = await User.update(
          { _id: user._id },
          {
            $push: {
              tweets: { tweet: newTweet._id }
            }
          }
        )

        io.emit("incomingTweet", { data, user, newTweetId: newTweet._id })
      } catch (error) {
        // console.log(error)
      }
    })

    socket.on("delete-tweet", async function(data) {
      io.emit("delete-tweet-to-client", { data })
    })
  })
}
