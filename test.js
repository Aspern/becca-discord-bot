const axios =  require('axios')

axios.get('https://www.mejoress.com/en/state-of-survival-code-redeem-codes', {
  headers: {
    'User-Agent': 'test/1.0.0'
  }
}).then(response => {
  console.log(response.data)
}).catch(error => {
  console.error(error)
  console.log(error.response.data)
})
