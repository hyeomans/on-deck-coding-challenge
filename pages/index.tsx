import Head from 'next/head'
import Link from 'next/link'
import Layout from 'components/Layout'
import FeedCard from 'components/FeedCard'
import { useQuery, gql } from '@apollo/client'
import { FeedRow, PageInfo } from 'graphql/resolvers/Query/feed'
import { useRef, useState, useEffect } from 'react'


const FEED_QUERY = gql`
  query feed($userType: String, $after: String) {
    feed(userType: $userType, after: $after) {
      edges {
        node {
          id
          name 
          desc
          type
          avatar_url
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

type Edge = {
  node: Omit<FeedRow, 'created_ts'>;
  cursor: string;
}

type QueryData = {
  feed: {
    edges: Edge[]
    pageInfo: PageInfo
  }
}

type QueryVars = {
  userType: string
  after?: string
}

export default function Home() {
  const [userType, setUserType] = useState('')
  const { data, error, loading, networkStatus, fetchMore } = useQuery<QueryData, QueryVars>(
    FEED_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
      variables: {
        userType
      }
    }
  )

  if (error) {
    return (
      <Layout>
        <Head>
          <title>On Deck Newsfeed</title>
        </Head>
        <div>
          <h1>An error ocurred</h1>
          <span>Try reloading the page</span>
        </div>
      </Layout>
    )
  }

  const hasNextPage = data?.feed.pageInfo.hasNextPage
  const isRefetching = networkStatus === 3

  return (
    <Layout>
      <Head>
        <title>On Deck Newsfeed</title>
      </Head>
      <h1>Hello there!</h1>
      <p>Your future newsfeed goes to this page. Or not, you decide 🤷</p>
      <span>Check out these pages:</span>

      <div>
        
        <button onClick={() => setUserType('writers')}>Writer🖋</button>
        <button onClick={() => setUserType('founders')}>Founder ⚙️</button>
        <button onClick={() => setUserType('angels')}>Angel 🚀</button>
      </div>

      <div id="list">
        {data && data.feed.edges.map(f => (
          <FeedCard key={f.cursor} feedRow={f.node} />
        ))}

        {loading && <div>loading...</div>}

        {hasNextPage && (
          <button
            id="buttonLoadMore"
            disabled={isRefetching}
            onClick={() => {
              fetchMore({
                variables: {
                  after: data?.feed.pageInfo.endCursor
                }
              })
            }}
          >Load more...</button>
        )}
      </div>
    </Layout>
  )
}
