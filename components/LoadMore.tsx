import React from 'react'
import styled from 'styled-components'

type Props = {
  children?: React.ReactNode 
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`

export default function LoadMore({children}: Props) {
  return <Container>
    {children}
  </Container>
}