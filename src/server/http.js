import fetch from 'node-fetch'

export async function $http(config) {
  return fetch(config.url, {
    headers: {
      'X-API-Key': process.env.BUNGIE_API_KEY,
    }
  })
}

export async function $json(config) {
  const response = await $http(config)

  return response.json()
}
