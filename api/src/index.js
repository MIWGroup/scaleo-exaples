const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

const getAccessToken = async scope => {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
        ).toString('base64')
    }
  }

  const body = `grant_type=client_credentials&${scope}`

  try {
    const accessTokenResponse = await axios.post(
      process.env.AWS_COGNITO_TOKEN_ENDPOINT,
      body,
      config
    )

    return accessTokenResponse.data.access_token
  } catch (error) {
    console.log({ error })
  }
}

const exampleApi = async () => {
  const driversReadToken = await getAccessToken('scope=drivers/read')
  const driversReadResponse = await axios.get(
    `${process.env.SCALEO_ADDRESS}/api/external/drivers/csv`,
    {
      headers: {
        Authorization: 'Bearer ' + driversReadToken,
        customer_id: process.env.CUSTOMER_ID
      }
    }
  )
  fs.writeFileSync('drivers.csv', driversReadResponse.data)

  const driversWriteToken = await getAccessToken('scope=drivers/write')
  const driversWriteResponse = await axios.post(
    `${process.env.SCALEO_ADDRESS}/api/external/drivers/csv`,
    {
      data: `drivers.firstName;drivers.lastName;drivers.email;drivers.phone;drivers.personalId;drivers.idCard;drivers.street;drivers.zip;drivers.city;drivers.taxId\nMati;Janduła;mateusz.jandula@saasnative.com;123456789;;;;;;`
    },
    {
      headers: {
        Authorization: 'Bearer ' + driversWriteToken,
        customer_id: process.env.CUSTOMER_ID
      }
    }
  )
  console.log({ drivers: driversWriteResponse.data })

  const weighingsReadToken = await getAccessToken('scope=weighings/read')
  const weighingssReadResponse = await axios.post(
    `${process.env.SCALEO_ADDRESS}/api/external/weighings/new-or-updated`,
    {
      duration: 24 // last 24 hours
    },
    {
      headers: {
        Authorization: 'Bearer ' + weighingsReadToken,
        customer_id: process.env.CUSTOMER_ID
      }
    }
  )

  console.log({ weighings: weighingssReadResponse.data })
}

exampleApi()
