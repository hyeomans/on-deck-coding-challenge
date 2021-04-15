import React from 'react'
import styled from 'styled-components'

type Props = {
  children?: React.ReactNode 
}

const Filter = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 1rem 0;
`

export default function Filters({children}: Props) {
  return <Filter>
    {children}
  </Filter>
}