// var app = new Vue({
//   el: "#app",
//   data: {
//     message: "Hello Vue!"
//   }
// })

// var url = $(location).attr("href")
// alert("url", url)
// var hostname = $("<a>")
//   .prop("href", url)
//   .prop("hostname")
// alert("hostname", hostname)

$(function() {
  mymodal()
  scrollToComment()
  updateTime()
  $("textarea").autoResize()
  var socket = io()

  var idOfCurrentLoginUser = $("#idOfCurrentLoginUser").val()

  $("#sendTweet").submit(function() {
    var content = $("#tweet").val()
    if (content === "") return false
    socket.emit("tweet", { content: content })
    $("#tweet").val("")
    return false
  })

  socket.on("incomingTweet", function(data) {
    // we take infomation of user that make tweet from data.user
    // we take infomation of current logined user from input hidden
    // if idOfCurrentLoginUser == idOfUserMakeTweet or idOfUserMakeTweet in the list of following user of current logined user, show tweet
    // otherwise do nothing
    // console.log("on incomingTweet data:", data)
    var idOfUserMakeTweet = data.user._id
    var listOfFollowing = $("#listOfFollowing")
      .val()
      .split(",")

    // console.log("listOfFollowing", listOfFollowing)

    var inListOfFollowing = false
    listOfFollowing.forEach(element => {
      if (element == idOfUserMakeTweet) {
        inListOfFollowing = true
      }
    })
    //<span data-idtweet="{{_id}}" class="glyphicon glyphicon-remove remove-icon" aria-hidden="true"></span>
    if (inListOfFollowing || idOfCurrentLoginUser == idOfUserMakeTweet) {
      const {
        user: { _id, photo, name },
        data: { content },
        newTweetId,
        dateFormated,
        created
      } = data

      let removeTweet = ""
      if (idOfCurrentLoginUser == idOfUserMakeTweet) {
        removeTweet = `
          <span data-idtweet="${newTweetId}" class="glyphicon glyphicon-remove remove-icon" aria-hidden="true"></span>
        `
      }

      let html = `
    <div class="media" id="tweet-${newTweetId}">
      ${removeTweet}
      <div class="media-left">
        <a href="/user/${_id}">
          <img class="media-object" src="${photo}" />
        </a>
      </div>
      <div class="media-body dropdown">
        <a href="/user/${_id}"><h5 class="media-heading">${name}</h5> </a>
        <p class="tweet-time anhdt-time" data-dateString="${created}"> ${dateFormated} </p>
        <p> ${content} </p>
        <div data-idtweet="${newTweetId}" class="number-of-like-on-tweet hidden"> 
          <span class="glyphicon trangthailike"></span> 
          <span class="number">  0 </span> 
        </div>
        <div class="likes-and-retweet-wrapper">
          <span data-idtweet="${newTweetId}" class="glyphicon glyphicon-heart-empty notlike _${newTweetId}">  </span>
          <span data-idTweet="${newTweetId}" class="glyphicon glyphicon-comment _${newTweetId}">  </span>
        </div>


        <div class="comments-wrapper">
          <div class="list-comments">
          </div>
          <div class="add-comment">
            <div class="anh-nguoi-add-comment-wrapper"> 
        <img class="media-object" src="${photo}" />
            </div>
            <div class="form-add-comment-wr">
              <form class="add-comment">
                <textarea data-idTweet="${newTweetId}" row="1" placeholder="Write a comment..." 
               id="comment-content-${newTweetId}" class="comment-content _${newTweetId}"></textarea>
                <br />
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
      `
      ///

      $("#tweets").prepend(html)
    } else {
    }
  })

  socket.on("incomingComment", function(data) {
    //current
    const {
      user: { _id, name, photo },
      data: { content },
      tweetId,
      commentDate,
      commentDateOriginal
    } = data
    let html = `
    <div class="one-comment">
      <div class="image-user-comment">
        <a href="/user/${_id}">
          <img class="media-object" src="${photo}">
        </a>
      </div>
      <div class="benphai-comment">
        <span class="ten-nguoi-comment"> <a href="/user/${_id}"> ${name} </a> </span>
        <span class="noi-dung-comment"> ${content} </span>
      </div>
      <div data-datestring="${commentDateOriginal}" class="comment-time anhdt-time">
        ${commentDate}
      </div>

    </div>
    `
    $(`#list-comments-${tweetId}`).append(html)
  })

  socket.on("userLikedTweet", function(data) {
    //current
    const {
      numberofLike,
      tweetId,
      idOfUserLikeTweet,
      userThatHaveTweetLiked,
      nameOfUserLikeTweet,

      photoOfUserLikeTweet,
      isLikingTweetOfMySelf,
      notificationId
    } = data

    let self = $(`.glyphicon-heart-empty._${tweetId}`)

    if (idOfUserLikeTweet === idOfCurrentLoginUser) {
      self.removeClass("notlike")
      self.removeClass("glyphicon-heart-empty")
      self.addClass("glyphicon-heart")
      self.addClass("liked")
    } else {
    }

    if (
      userThatHaveTweetLiked === idOfCurrentLoginUser &&
      !isLikingTweetOfMySelf
    ) {
      updateNotificationStateClient()
      fetchNotifications()
      let html = `
        <a id="noti-${notificationId}" data-notificationid="${notificationId}" class="anhdt-notification-wr" target="_blank" href="/tweet/${tweetId}">
          <div class="anhdt-notification">
            <button type="button" class="close noti-close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <div class="left"> <img src="${photoOfUserLikeTweet}" alt="" /> </div>
            <div class="right">
              <div class="not-content"> <span class="username"> ${nameOfUserLikeTweet} </span> likes a tweet of you. </div>
              <div class="not-time"> <span class="not-type">  </span> <span class="time-content"> a few seconds ago </span> </div>
            </div>
          </div>
        </a>
      `

      $("body").append(html)
      $(".noti-close").click(function() {
        $(this)
          .parent()
          .remove()
      })
      setTimeout(function() {
        $(".anhdt-notification").fadeOut(3000, function() {
          $(".anhdt-notification").remove()
        })
      }, 10000)
    }

    // update number of likes
    let numberlikeHTML = $(`#tweet-${tweetId}`).find(".number")
    let numberLikeWrapperHTML = $(`#tweet-${tweetId}`).find(
      ".number-of-like-on-tweet"
    )

    numberlikeHTML.text(numberofLike.toString())
    if (numberofLike == 0) {
      numberLikeWrapperHTML.addClass("hidden")
    } else {
      numberLikeWrapperHTML.removeClass("hidden")
    }
  })

  socket.on("userUnLikedTweet", function(data) {
    const { numberofLike, tweetId, idOfUserUnLikeTweet } = data
    let self = $(`.glyphicon-heart._${tweetId}`)
    if (idOfUserUnLikeTweet === idOfCurrentLoginUser) {
      self.removeClass("glyphicon-heart")
      self.removeClass("liked")
      self.addClass("notlike")
      self.addClass("glyphicon-heart-empty")
    }

    let numberlikeHTML = $(`#tweet-${tweetId}`).find(".number")
    let numberLikeWrapperHTML = $(`#tweet-${tweetId}`).find(
      ".number-of-like-on-tweet"
    )

    numberlikeHTML.text(numberofLike.toString())
    if (numberofLike == 0) {
      numberLikeWrapperHTML.addClass("hidden")
    } else {
      numberLikeWrapperHTML.removeClass("hidden")
    }
  })
})

function scrollToComment() {
  $(".glyphicon-comment").click(function() {
    let self = $(this)
    let idtweet = self.data("idtweet")
    let targetSelector = `#comment-content-${idtweet}`
    $(targetSelector).focus()
  })
}

function updateTime() {
  setInterval(function() {
    $(".anhdt-time.tweet-time").each(function(index) {
      $(this).text(getdateAndTimeFromDateString($(this).data("datestring")))
    })

    $(".anhdt-time.comment-time").each(function(index) {
      $(this).text(
        getdateAndTimeFromDateString($(this).data("datestring"), true)
      )
    })
  }, 60000)
}

const getdateAndTimeFromDateString = (dateString, isTimeOfComment = false) => {
  if (isTimeOfComment) {
    return moment(dateString).fromNow(true)
  }

  let diffInHour = moment().diff(dateString, "hour")
  let result
  if (diffInHour >= 24) {
    result = moment(dateString).format("D MMMM YYYY [at] H:mm")
  } else {
    result = moment(dateString).fromNow()
  }
  return result
}

function mymodal() {
  var modal = document.querySelector("#modal")
  var modalOverlay = document.querySelector("#modal-overlay")
  var closeButton = document.querySelector("#close-button")
  var openButton = document.querySelector("#open-button")

  closeButton.addEventListener("click", function() {
    $(".modal-content-main").empty()
    $(".modal").removeClass("expanded")

    setTimeout(function() {
      modal.classList.toggle("closed")
    }, 240)

    setTimeout(function() {
      $(".anhdt-modal-header").addClass("hidden")
      modalOverlay.classList.toggle("closed")
      $(".modal-contenttt-wr .spinner").removeClass("hidden")
    }, 300)
  })

  openButton.addEventListener("click", function() {
    modal.classList.toggle("closed")
    modalOverlay.classList.toggle("closed")
  })
}

$(function() {
  var socket = io()
  updateNotificationStateClient()
  fetchNotifications()
  $(document).on("click", ".anhdt-notification-wr", function(e) {
    // e.preventDefault();
    let self = $(this)
    let notificationId = self.data("notificationid")

    $.ajax({
      type: "POST",
      url: "/liketweet-notification/" + notificationId,
      success: function(data) {
        console.log(data)
        self.remove()
      },
      error: function(data) {
        // console.log(data)
      }
    })
  })

  $(document).on("click", ".anhdt-dropdown", function(e) {
    // e.preventDefault();
    //current

    $(".anhdt-dropdown-toggle").removeClass("new-noti")
    $(".dropdown-wrapper").toggleClass("expanded")
    var idOfCurrentLoginUser = $("#idOfCurrentLoginUser").val()
    $.ajax({
      type: "POST",
      url: "/notifications/setnonew-noti/" + idOfCurrentLoginUser,
      success: function(data) {},
      error: function(data) {
        // console.log(data)
      }
    })
  })

  $(document).on("click", "#anhdt-dropdown-menu li", function(e) {
    e.preventDefault()

    let self = $(this)
    self.removeClass("showed")
    let notificationid = self.data("notificationid")
    let href = self.find("a").attr("href")
    var idOfCurrentLoginUser = $("#idOfCurrentLoginUser").val()
    $.ajax({
      type: "POST",
      url: "/liketweet-notification/" + notificationid,
      success: function(data) {
        console.log("data3333333333", data)
        if (data.success) {
          window.location.replace(href)
        } else {
          return
        }
      },
      error: function(data) {
        // console.log(data)
      }
    })
  })
})

function updateNotificationStateClient() {
  $.ajax({
    type: "GET",
    url: "/is-new-noti",
    success: function(data) {
      $(".number-of-noti").text(data.number_of_noti.toString())
      if (data.new_notification === true) {
        $(".anhdt-dropdown-toggle").addClass("new-noti")
      } else {
        $(".anhdt-dropdown-toggle").removeClass("new-noti")
      }
    },
    error: function(data) {
      // console.log(data)
    }
  })
}

function fetchNotifications() {
  $.ajax({
    type: "GET",
    url: "/notifications",
    success: function(data) {
      console.log(data)
      let notifications = data.data
      let html = ""
      for (let i = 0; i < notifications.length; i++) {
        let noti = notifications[i]
        let time = getdateAndTimeFromDateString(noti.created, true)
        let showed = noti.showed
        let tweetContent = noti.tweet.content.substring(0, 50)
        if (showed) {
          html += `<li data-notificationid="${noti._id}" class="showed">`
        } else {
          html += `<li data-notificationid="${noti._id}">`
        }

        html += `
                  <a href="/tweet/${noti.tweet._id}"> 
                    <img src="${noti.sourceUser.photo}">  
                    <div class="noti-content">
                      
                      <div class="main-content-noti"> <span class="username"> ${
                        noti.sourceUser.name
                      } </span> likes your tweet: " ${tweetContent} ..." </div>
                      <div class="time-noti"> <span class="iconlike"></span>  <span class="time-content-noti"> ${time} </span> </div>
                    </div>
                </a>
              </li>
        `
      }

      $("#anhdt-dropdown-menu").empty()
      $("#anhdt-dropdown-menu").append(html)
    },
    error: function(data) {
      // console.log(data)
    }
  })
}
