import { FeedRow } from "graphql/resolvers/Query/feed"
import Link from 'next/link'
import styled from 'styled-components'
import Markdown from './Markdown'


type Props = {
  feedRow: Omit<FeedRow, 'created_ts'>;
}

export default function FeedCard({feedRow}: Props) {
  return (
    <Card>
      <Columns>
        <ColumnLeft>
          <Avatar src={feedRow.avatar_url}/>
        </ColumnLeft>
        <ColumnRight>
          <h2>{feedRow.type}</h2>
          <h3>{feedRow.name}</h3>
          <Markdown>{feedRow.desc}</Markdown>
        </ColumnRight>
      </Columns>
    </Card>
  )
}

const Card = styled.div`
  padding: 1.5rem;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  margin-bottom: 3rem;
`

const Avatar = styled.img`
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  min-width: 21rem;
`

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  flex-basis: 7rem;
  flex-grow: 0;
  flex-shrink: 0;
  margin-right: 1.5rem;
`


const ColumnRight = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 14rem;
`