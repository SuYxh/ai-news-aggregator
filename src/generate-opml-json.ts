import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { parseStringPromise } from 'xml2js'

interface OpmlOutline {
  $: {
    text: string
    title?: string
    type?: string
    xmlUrl?: string
  }
  outline?: OpmlOutline[]
}

interface OpmlGroup {
  name: string
  feeds: {
    name: string
    url: string
  }[]
}

async function generateOpmlJson() {
  const opmlPath = resolve('./feeds/follow.opml')
  
  if (!existsSync(opmlPath)) {
    console.log('No OPML file found, skipping...')
    return
  }

  const opmlContent = readFileSync(opmlPath, 'utf-8')
  const result = await parseStringPromise(opmlContent)
  
  const groups: OpmlGroup[] = []
  
  const body = result.opml?.body?.[0]
  if (!body?.outline) return

  for (const group of body.outline) {
    if (!group.$ || !group.outline) continue
    
    const groupName = group.$.text || group.$.title || 'Unknown'
    const feeds: OpmlGroup['feeds'] = []
    
    for (const feed of group.outline) {
      if (feed.$.xmlUrl) {
        feeds.push({
          name: feed.$.text || feed.$.title || 'Unknown',
          url: feed.$.xmlUrl
        })
      }
    }
    
    if (feeds.length > 0) {
      groups.push({ name: groupName, feeds })
    }
  }

  const outputPath = resolve('./data/opml-feeds.json')
  writeFileSync(outputPath, JSON.stringify(groups, null, 2))
  console.log(`Generated ${outputPath} with ${groups.length} groups`)
}

generateOpmlJson().catch(console.error)
