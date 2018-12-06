const router = require("express").Router()

const User = require("../models/user")
const Tweet = require("../models/tweet")

router.get("/", async (req, res, next) => {
  if (req.user) {
    var listt = [req.user._id, ...req.user.following]
    try {
      let tweets = await Tweet.find({ owner: listt })
        .sort("-created")
        .populate("owner")
        .populate("usersLike")
        .populate({
          path: "comments",
          // Get friends of friends - populate the 'friends' array for every friend
          populate: { path: "userId" }
        })
        .lean()
        .exec()

      let currentUserId = req.user._id
      console.log("currentUserId", currentUserId)
      tweets.forEach(function(val, index) {
        console.log(val.comments)

        val.liked = false
        if (typeof val.usersLike === "undefined") {
        } else {
          val.usersLike.forEach(item => {
            if (item._id === currentUserId || item._id.equals(currentUserId)) {
              val.liked = true
            }
          })
        }

        if (
          val.owner._id == currentUserId ||
          val.owner._id.equals(currentUserId)
        ) {
          val.isTweetOfCurrentUser = true
        } else {
          val.isTweetOfCurrentUser = false
        }
      })

      console.log("TWEETS", tweets)
      res.render("main/home", { tweets })
    } catch (error) {
      next(error)
    }
  } else {
    res.render("main/landing")
  }
})

router.get("/user/:id", async (req, res, next) => {
  try {
    let tweets = await Tweet.find({ owner: req.params.id })
      .sort("-created")
      .populate("owner")
      .exec()
    let user = await User.findById(req.params.id)
      .populate("following")
      .populate("followers")
      .populate("tweet")
      .exec()

    let pageOfHimself = false
    if (req.params.id == req.user._id) {
      // user access the profile page of himself
      pageOfHimself = true
    }

    let followerList = user.followers

    let inFollowerList = followerList.some(follower => {
      return follower._id.equals(req.user._id) // == not work xxxx
    })

    // // console.log(tweets)
    // // console.log('user', user)

    res.render("main/user", {
      foundUser: user,
      tweets,
      pageOfHimself,
      inFollowerList
    })
  } catch (error) {
    next(error)
  }
})

router.get("/tweet/:id", async (req, res, next) => {
  try {
    let tweet = await Tweet.findById(req.params.id)
      .populate("owner")
      .exec() // lam sao de populate owner

    let user = await //  // console.log('tweet', tweet)
    res.render("main/tweet", { tweet })
  } catch (error) {
    next(error)
  }
})

router.post("/follow/:id", async (req, res, next) => {
  // id nay la cua thang can follow
  try {
    let dsfds = await User.update(
      {
        _id: req.params.id,
        followers: { $ne: req.user._id }
      },
      { $push: { followers: req.user._id } }
    )

    let fdsfds = await User.update(
      {
        _id: req.user._id,
        following: { $ne: req.params.id }
      },
      { $push: { following: req.params.id } }
    )

    res.json("success")
  } catch (error) {
    next(error)
  }
})

router.post("/unfollow/:id", async (req, res, next) => {
  // id nay la cua thang can follow
  try {
    let dsfds = await User.update(
      {
        _id: req.params.id
      },
      { $pull: { followers: req.user._id } }
    )

    let fdsfds = await User.update(
      {
        _id: req.user._id
      },
      { $pull: { following: req.params.id } }
    )

    res.json("success")
  } catch (error) {
    next(error)
  }
})

router.delete("/tweet/:id", async (req, res, next) => {
  // console.log('current user id:', req.user._id)
  // console.log('tweet need delete id:', req.params.id)

  try {
    let tweet = await Tweet.findById(req.params.id)
      .populate("owner")
      .exec()
    // console.log('tweet', tweet)

    if (tweet.owner._id.equals(req.user._id)) {
      // the tweet need delete belong to the logined user

      // delete the tweet
      let deletedTweet = await Tweet.findByIdAndRemove(req.params.id)

      // remove reference on user collection
      let updatedUser = await User.update(
        { _id: req.user._id },
        {
          $pull: {
            tweets: { tweet: deletedTweet._id }
          }
        }
      )
    }
  } catch (error) {
    next(error)
  }

  res.json("delete success")
})

// like a tweet
router.post("/liketweet/:id", async (req, res, next) => {
  let idCurrentUser = req.user._id
  let idOfTweet = req.params.id

  try {
    let dsfds = await User.update(
      {
        _id: idCurrentUser,
        likedTweets: { $ne: idOfTweet } // trong array likedTweets khong chua idOfTweet
      },
      { $push: { likedTweets: idOfTweet } }
    )

    let dsfdsfdsfds = await Tweet.update(
      {
        _id: idOfTweet,
        usersLike: { $ne: idCurrentUser } // trong array usersLike khong chua idCurrentUser
      },
      { $push: { usersLike: idCurrentUser } }
    )
  } catch (error) {
    next(error)
  }

  res.json("like success")
})

// unlike a tweet
router.post("/unliketweet/:id", async (req, res, next) => {
  let idCurrentUser = req.user._id
  let idOfTweet = req.params.id

  try {
    let updatedUser = await User.update(
      { _id: req.user._id },
      {
        $pull: {
          likedTweets: idOfTweet._id
        }
      }
    )

    let updatedTweet = await Tweet.update(
      { _id: idOfTweet },
      {
        $pull: {
          usersLike: idCurrentUser
        }
      }
    )
  } catch (error) {
    next(error)
  }

  res.json("unlike success")
})

// comment on a tweet
router.post("/comment/:id", async (req, res, next) => {
  let idCurrentUser = req.user._id
  let idOfTweet = req.params.id

  try {
    let updatedUser = await User.update(
      { _id: req.user._id },
      {
        $pull: {
          likedTweets: idOfTweet._id
        }
      }
    )

    let updatedTweet = await Tweet.update(
      { _id: idOfTweet },
      {
        $pull: {
          usersLike: idCurrentUser
        }
      }
    )
  } catch (error) {
    next(error)
  }

  res.json("add comment success")
})

module.exports = router
