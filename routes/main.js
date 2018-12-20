const router = require("express").Router()

const User = require("../models/user")
const Tweet = require("../models/tweet")
const Notification = require("../models/notifications")
const NotificationState = require("../models/notification-state.js")
const { fetchTweetsByOwners, checkLogin } = require("../helpers/helpers")

router.get("/", async (req, res, next) => {
  if (req.user) {
    try {
      var owners = [req.user._id, ...req.user.following]
      let tweets = await fetchTweetsByOwners(null, owners, req.user._id, next)

      let x = await NotificationState.find({ user: req.user._id })

      res.render("main/home", {
        tweets,
        showjointweeter: true
      })
    } catch (error) {
      next(error)
    }
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
  checkLogin(req)
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
  checkLogin(req)
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
  checkLogin(req)
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
  checkLogin(req)
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

    let isLikingTweetOfMySelf = false
    if (
      idCurrentUser === tweet[0].owner ||
      idCurrentUser.equals(tweet[0].owner)
    ) {
      isLikingTweetOfMySelf = true
    }

    let notification
    let notificationState

    if (!isLikingTweetOfMySelf) {
      notification = await Notification.create({
        sourceUser: idCurrentUser,
        targetUser: tweet[0].owner,
        tweet: idOfTweet
      })
      //current
      notificationState = await NotificationState.find({ user: tweet[0].owner })
      if (notificationState.length === 0) {
        notificationState = await NotificationState.create({
          user: tweet[0].owner
        })
      } else {
        await NotificationState.update(
          { user: tweet[0].owner },
          { $set: { new_notification: true } }
        )
      }
    }

    res.json({
      numberofLike: tweet[0].usersLike.length,
      tweetId: idOfTweet,
      idOfUserLikeTweet: idCurrentUser,
      nameOfUserLikeTweet: req.user.name,
      photoOfUserLikeTweet: req.user.photo,

      userThatHaveTweetLiked: tweet[0].owner,
      isLikingTweetOfMySelf,
      notificationId: notification._id
    })
  } catch (error) {
    next(error)
  }
})

// unlike a tweet
router.post("/unliketweet/:id", async (req, res, next) => {
  checkLogin(req)
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

    await Notification.deleteOne({
      tweet: idOfTweet,
      sourceUser: idCurrentUser
    })
  } catch (error) {
    next(error)
  }
})

// comment on a tweet
router.post("/comment/:id", async (req, res, next) => {
  checkLogin(req)
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
  let idOfTweet = req.params.id
  let tweets = await Tweet.findById(idOfTweet)
    .populate("usersLike")
    .exec()
  console.log("TWEETSSSS", tweets)
  res.json({ tweets })
})

router.post("/liketweet-notification/:id", async (req, res, next) => {
  // id of notification

  Notification.update({ _id: req.params.id }, { $set: { showed: true } })
  try {
    await Notification.update(
      { _id: req.params.id },
      { $set: { showed: true } }
    )
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

router.get("/notifications", async (req, res, next) => {
  // id of notification
  checkLogin(req)
  try {
    let notifications = await Notification.find({ targetUser: req.user._id })
      .sort("-created")
      .limit(100)
      .populate("tweet")
      .populate("sourceUser")
      .exec()
    console.log("notificationsssssssss", notifications)
    res.json({ data: notifications })
  } catch (error) {
    next(error)
  }
})

router.post("/notifications/setnonew-noti/:id", async (req, res, next) => {
  // id of current login user
  checkLogin(req)
  try {
    await NotificationState.update(
      { user: req.params.id },
      { $set: { new_notification: false } }
    )
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

router.get("/is-new-noti", async (req, res, next) => {
  // id of current login user
  checkLogin(req)
  let currentUserId = req.user._id
  let new_notification = false
  let number_of_noti = 0
  try {
    let x = await NotificationState.find({ user: currentUserId })
    console.log(x)
    if (x.length === 0 || !x[0].new_notification) {
    } else {
      new_notification = true
    }

    let y = await Notification.find({ targetUser: currentUserId })
    if (y.length === 0) {
    } else {
      number_of_noti = y.length
    }

    res.json({ new_notification, number_of_noti })
  } catch (error) {
    next(error)
  }
})

module.exports = router
