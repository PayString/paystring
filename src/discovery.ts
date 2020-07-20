import * as fs from 'fs'
import * as path from 'path'

import config from './config'

/**
 * Represents a Link in a JRD (JSON Resource Descriptor) which can be returned as part of a PayID Discovery
 * response.
 */
interface JrdLink {
  rel: string
  template?: string
  href?: string
}

/**
 * Loads a collection of PayID Discovery Links from a json file located at fileLocation.
 *
 * @param fileLocation - A string containing the relative path of the json file containing the Links.
 * @returns A collection of JrdLinks.
 */
async function loadDiscoveryLinks(fileLocation: string): Promise<JrdLink[]> {
  const fileContents = await fs.promises.readFile(
    path.join(__dirname, fileLocation),
  )

  return JSON.parse(fileContents.toString())
}

const discoveryLinks = loadDiscoveryLinks(config.discovery.fileLocation)
export default discoveryLinks
