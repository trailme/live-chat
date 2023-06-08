const axios = require('axios')

async function sendnoti(noti) {
  const response = await axios.post(
    'https://hooks.slack.com/services/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',
    {
      text: noti,
    },
    {
      headers: {
        'Content-type': 'application/json',
      },
    },
  )
  return response.data
}

exports.sendnoti = sendnoti
