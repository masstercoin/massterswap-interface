import React from 'react'
import styled from 'styled-components/macro'

export const BodyWrapper = styled.div<{ margin?: string; maxWidth?: string }>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? '0px'};
  max-width: ${({ maxWidth }) => maxWidth ?? '480px'};
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  border-radius: 24px 32px 48px 48px;
  box-shadow: 0px 0px 64px 0px #ffffff;
  margin-top: 1rem;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  return <BodyWrapper {...rest}>{children}</BodyWrapper>
}
