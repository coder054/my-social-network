$(function() {
  var socket = io()

  $(document).on("click", ".remove-icon", function(e) {
    // e.preventDefault();
    var confirmDeleteTweet = confirm(
      "Are you sure you want to delete this tweet?"
    )
    if (confirmDeleteTweet) {
      var tweetId = $(this).data("idtweet")
      $.ajax({
        type: "DELETE",
        url: "/tweet/" + tweetId,
        success: function(data) {
          socket.emit("delete-tweet", { tweetId })
          // console.log('success', data)
          $(".tweet-delete-success").addClass("show")
          setTimeout(() => {
            $(".tweet-delete-success").removeClass("show")
          }, 2000)
        },
        error: function(data) {
          // console.log(data)
        }
      })
    }
  })

  socket.on("delete-tweet-to-client", function(data) {
    var tweetIdDeleted = data.data.tweetId
    var idDom = "#tweet-" + tweetIdDeleted
    // console.log(idDom)
    $(idDom).remove()
  })
})
