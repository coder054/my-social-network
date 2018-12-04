// var app = new Vue({
//   el: "#app",
//   data: {
//     message: "Hello Vue!"
//   }
// })

$(function() {
  var socket = io()

  $("#sendTweet").submit(function() {
    var content = $("#tweet").val()
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
    var idOfCurrentLoginUser = $("#idOfCurrentLoginUser").val()
    // console.log("listOfFollowing", listOfFollowing)

    var inListOfFollowing = false
    listOfFollowing.forEach(element => {
      if (element == idOfUserMakeTweet) {
        inListOfFollowing = true
      }
    })
    //<span data-idtweet="{{_id}}" class="glyphicon glyphicon-remove remove-icon" aria-hidden="true"></span>
    if (inListOfFollowing || idOfCurrentLoginUser == idOfUserMakeTweet) {
      let html = ""
      html += '<div class="media" id="tweet-' + data.newTweetId + '">'
      if (idOfCurrentLoginUser == idOfUserMakeTweet) {
        html +=
          '<span data-idtweet="' +
          data.newTweetId +
          '" class="glyphicon glyphicon-remove remove-icon" aria-hidden="true"></span>'
      }
      html += '<div class="media-left">'
      html += '<a href="/user/' + data.user._id + '">'
      html += '<img class="media-object" src=" ' + data.user.photo + ' " />'
      html += "</a>"
      html += "</div>"
      html += '<div class="media-body">'
      html += '<h4 class="media-heading">' + data.user.name + "</h4>"
      html += "<p>" + data.data.content + "</p>"
      html += "</div>"
      html += "</div>"
      $("#tweets").prepend(html)
    } else {
    }
  })
})
