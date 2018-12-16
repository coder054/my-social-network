const router = require("express").Router()

const User = require("../models/user")
const Tweet = require("../models/tweet")
const Notification = require("../models/notifications")
const { fetchTweetsByOwners } = require("../helpers/helpers")

router.get("/", async (req, res, next) => {
  if (req.user) {
    var owners = [req.user._id, ...req.user.following]
    let tweets = await fetchTweetsByOwners(null, owners, req.user._id, next)

    res.render("main/home", { tweets, showjointweeter: true })
  } else {
    res.render("main/landing")
  }
})

router.get("/user/:id", async (req, res, next) => {
  try {
    let tweets = await fetchTweetsByOwners(
      null,
      req.params.id,
      req.user._id,
      next
    )

    let user = await User.findById(req.params.id)
      .populate("following")
      .populate("followers")
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
  let idOfTweet = req.params.id
  let currentUserId = req.user._id
  let tweets = await fetchTweetsByOwners(idOfTweet, null, currentUserId, next) // call it tweets because we reuse template with route get("/")
  res.render("main/tweet", { tweets })
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

    let tweet = await Tweet.find({
      _id: idOfTweet
    })

    let result = await Notification.create({
      sourceUser: idCurrentUser,
      targetUser: tweet[0].owner,
      tweet: idOfTweet
    })

    let isLikingTweetOfMySelf = false
    if (
      idCurrentUser === tweet[0].owner ||
      idCurrentUser.equals(tweet[0].owner)
    ) {
      isLikingTweetOfMySelf = true
    }

    res.json({
      numberofLike: tweet[0].usersLike.length,
      tweetId: idOfTweet,
      idOfUserLikeTweet: idCurrentUser,
      nameOfUserLikeTweet: req.user.name,
      photoOfUserLikeTweet: req.user.photo,

      userThatHaveTweetLiked: tweet[0].owner,
      isLikingTweetOfMySelf
    })
  } catch (error) {
    next(error)
  }
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

    let tweet = await Tweet.find({
      _id: idOfTweet
    })

    res.json({
      numberofLike: tweet[0].usersLike.length,
      tweetId: idOfTweet,
      idOfUserUnLikeTweet: idCurrentUser
    })
  } catch (error) {
    next(error)
  }
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

router.get("/usersThatLikeTweet/:id", async (req, res, next) => {
  //current
  let idOfTweet = req.params.id
  let tweets = await Tweet.findById(idOfTweet)
    .populate("usersLike")
    .exec()
  console.log("TWEETSSSS", tweets)
  res.json({ tweets })
})

module.exports = router
