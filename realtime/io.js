const async = require("async")
const Tweet = require("../models/tweet")
const User = require("../models/user")
const Comment = require("../models/comment")
const { getdateAndTimeFromDateString } = require("../helpers/helpers")

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
        let dateFormated = getdateAndTimeFromDateString(newTweet.created)

        let updatedUser = await User.update(
          { _id: user._id },
          {
            $push: {
              tweets: { tweet: newTweet._id }
            }
          }
        )

        io.emit("incomingTweet", {
          data,
          user,
          newTweetId: newTweet._id,
          dateFormated,
          created: newTweet.created
        })
      } catch (error) {
        // console.log(error)
      }
    })

    socket.on("comment", async function(data) {
      try {
        const comment = new Comment({
          content: data.content,
          tweetId: data.tweetId,
          userId: user._id
        })

        let newComment = await comment.save()

        let updatedUser = await User.update(
          { _id: user._id },
          {
            $push: {
              comments: newComment._id
            }
          }
        )

        let updatedTweet = await Tweet.update(
          { _id: data.tweetId },
          {
            $push: {
              comments: newComment._id
            }
          }
        )
        //current
        io.emit("incomingComment", {
          data,
          user,
          newCommentId: newComment._id,
          commentDate: getdateAndTimeFromDateString(newComment.created, true),
          commentDateOriginal: newComment.created,
          tweetId: data.tweetId
        })
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("delete-tweet", async function(data) {
      io.emit("delete-tweet-to-client", { data })
    })

    socket.on("like-tweet", async function(data) {
      io.emit("userLikedTweet", data)
    })

    socket.on("unlike-tweet", async function(data) {
      io.emit("userUnLikedTweet", data)
    })
  })
}
