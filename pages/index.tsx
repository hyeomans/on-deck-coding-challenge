import Head from 'next/head'
import Layout from 'components/Layout'
import FeedCard from 'components/FeedCard'
import { useQuery, gql } from '@apollo/client'
import { FeedRow, PageInfo } from 'graphql/resolvers/Query/feed'
import { useState } from 'react'
import Filters from 'components/Filters'
import Button from 'components/Button'
import LoadMore from 'components/LoadMore'


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
      <h1>Welcome to your On Deck newsfeed!</h1>
      
      <div>
        <p>
          Here is a list of interesting things happening: new people joining, announcements, published projects.
        </p>
        <p>Also you can filter given your interests:</p>
      </div>

      <Filters>
        <Button onClick={() => setUserType('writers')}>Writer🖋</Button>
        <Button onClick={() => setUserType('founders')}>Founder ⚙️</Button>
        <Button onClick={() => setUserType('angels')}>Angel 🚀</Button>
        <Button onClick={() => setUserType('')}>Everyone 🤗</Button>
      </Filters>

      <div id="list">
        {data && data.feed.edges.map(f => (
          <FeedCard key={f.cursor} feedRow={f.node} />
        ))}

        {loading && <div>loading...</div>}

        {hasNextPage && (
          <LoadMore>
          <Button
            id="buttonLoadMore"
            disabled={isRefetching}
            onClick={() => {
              fetchMore({
                variables: {
                  after: data?.feed.pageInfo.endCursor
                }
              })
            }}
          >Load more...</Button>
          </LoadMore>
        )}
      </div>
    </Layout>
  )
}
