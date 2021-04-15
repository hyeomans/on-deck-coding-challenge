import db from '../../db'

type Args = {
  after: string;
  userType: string;
}

export type FeedRow = {
  id: number;
  name: string;
  desc: string;
  type: string;
  avatar_url: string;
  created_ts: Date;
}

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
}

export type Edge = {
  cursor: string;
  node: FeedRow;
}

export type Response = {
  edges: Edge[]
  pageInfo: PageInfo
}

const writerFeed = async (decodedCursor: string | null): Promise<FeedRow[]> => {

  const query = `
  select *
  FROM (
    select id, name, bio as desc, created_ts, avatar_url, 'User' AS type
    from users
    where fellowship = 'writers'
    union all
    select id, title, body as desc, created_ts, 'https://avatars.dicebear.com/api/bottts/announcements.svg' as avatar_url, 'Announcement' AS type
    from announcements
    where fellowship = 'writers' or fellowship = 'all'
  )
  ${decodedCursor ? " where (created_ts) < (?)" : ''}
  order by created_ts desc, id desc
  limit 5;
  `

  return decodedCursor ?  db.getAll(query, [decodedCursor]) : db.getAll(query)
}

const foundersAngelsFeed = async (decodedCursor: string | null): Promise<FeedRow[]> => {
  const query = `
  select *
  FROM (
    select id, name, bio as desc, created_ts, avatar_url, 'User' AS type
    from users
    where fellowship = 'founders'
        or fellowship = 'angels'
    union all
    select id, name, description as desc, created_ts, icon_url as avatar_url, 'Project' AS type
    from projects
    union all
    select id, title, body as desc, created_ts, 'https://avatars.dicebear.com/api/bottts/announcements.svg' as avatar_url, 'Announcement' AS type
    from announcements
    where fellowship != 'writers'
  )
  ${decodedCursor ? " where (created_ts) < (?)" : ''}
  order by created_ts desc, id desc
  limit 5;
  `

  return decodedCursor ?  db.getAll(query, [decodedCursor]) : db.getAll(query)
}

const generalFeed = async (decodedCursor: string | null): Promise<FeedRow[]> => {
  const query = `
  select *
  FROM (
    select id, name, bio as desc, created_ts, avatar_url, 'User' AS type
    from users
    union all
    select id, name, description as desc, created_ts, icon_url as avatar_url, 'Project' AS type
    from projects
    union all
    select id, title, body as desc, created_ts, 'https://avatars.dicebear.com/api/bottts/announcements.svg' as avatar_url, 'Announcement' AS type
    from announcements
  )
  ${decodedCursor ? " where (created_ts) < (?)" : ''}
  order by created_ts desc, id desc
  limit 5;
  `

  return decodedCursor ?  db.getAll(query, [decodedCursor]) : db.getAll(query)
}

export default async function feed(parent: unknown, { after, userType }: Args): Promise<Response> {
  let next: string | null = null
  let hasMore = false
  let decodedCursor: string | null = after ? Buffer.from(after, 'base64').toString('ascii') : null

  let feedRows: FeedRow[]
  if(userType && userType === 'writers') {
    feedRows = await writerFeed(decodedCursor)
  }else if(userType && (userType === 'founders' || userType === 'angels')) {
    feedRows = await foundersAngelsFeed(decodedCursor)
  } else {
    feedRows = await generalFeed(decodedCursor)
  }

  // If there are less than 5 rows it means that we are near the end or the end of the list.
  // If second to last is 5, last will be empty
  if (feedRows.length === 5) {
    hasMore = true
    const last = feedRows[feedRows.length - 1].created_ts
    next = Buffer.from(last).toString('base64')
  }

  return {
    pageInfo: {
      endCursor: next,
      hasNextPage: hasMore
    },
    edges: feedRows.map(fr => {
      const cursor = Buffer.from(`${fr.id}:${fr.name}:${fr.type}`).toString('base64')
      return {
        cursor,
        node: fr
      }
    })
  }
}
