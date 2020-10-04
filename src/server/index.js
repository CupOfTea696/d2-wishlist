import { $http, $json } from './http'
import { getDestinyEntityDefinition, getDestinyManifest, getDestinyManifestSlice } from 'bungie-api-ts/destiny2'

(async () => {
  const destinyManifest = await getDestinyManifest($json)
  const manifestTables = await getDestinyManifestSlice($json, {
    destinyManifest: destinyManifest.Response,
    tableNames: ['DestinyPlugSetDefinition'],
    language: 'en',
  })

  // for (const hash in manifestTables.DestinyPlugSetDefinition) {
  //   const set = manifestTables.DestinyPlugSetDefinition[hash]
  //   console.log(set.reusablePlugItems.map(plugItem => {
  //     return plugItem.plugItemHash
  //   }))
  // }

  const response = await getDestinyEntityDefinition($http, {
    entityType: 'DestinyInventoryItemDefinition',
    hashIdentifier: '4095896073',
  })
  const json = await response.json()
  //let plugItems = {}

  for (const socket of json.Response.sockets.socketEntries) {
    if (socket.singleInitialItemHash) {
      const response = await getDestinyEntityDefinition($http, {
        entityType: 'DestinyInventoryItemDefinition',
        hashIdentifier: socket.singleInitialItemHash,
      })
      const json = await response.json()

      console.log(json.Response.displayProperties)
    } else if (socket.randomizedPlugSetHash) {
      const set = manifestTables.DestinyPlugSetDefinition[socket.randomizedPlugSetHash]
      let plugItemRequests = []

      for (const plugItem of set.reusablePlugItems) {
        plugItemRequests.push(getDestinyEntityDefinition($json, {
          entityType: 'DestinyInventoryItemDefinition',
          hashIdentifier: plugItem.plugItemHash,
        }))
      }

      let plugItems = await Promise.all(plugItemRequests)

      console.log(plugItems.map(item => item.Response.displayProperties))
    }
  }
})()
