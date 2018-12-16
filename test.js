const moment = require("moment")
console.log(moment("2018-11-20T10:10:18.626Z").format("D MMMM YYYY [at] H:mm")) // December 12th 2018, 12:15:48 pm

console.log(moment("2018-10-10T05:24:24.818Z").fromNow())

console.log(moment().diff("2018-12-11T04:41:23.818Z", "hour"))

// setInterval(function() {
// 	console.log(1)
// }, 2000)

const user = { info: { address: "hanoi" } }

let {
	info: { addressss }
} = user

addressss = addressss || "vn"
console.log(addressss)
