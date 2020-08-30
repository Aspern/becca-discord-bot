const moment = require('moment')



let now = moment()
let target = moment('22:00', 'HH:mm')
let rallyTimer = moment('05:00', 'HH:mm')
let marchDuration = moment('01:23', 'HH:mm')
let speechDuration = moment('00:12', 'HH:mm')

const duration = moment.duration({
  minutes: 6,
  seconds: 35
})

const start = target.subtract(duration.asSeconds(), 'seconds')

console.log(duration.asSeconds())
console.log(target.format())
console.log(start.format())
