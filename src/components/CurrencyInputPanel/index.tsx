import { Pair } from '@uniswap/v2-sdk'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { useState, useCallback, ReactNode } from 'react'
import styled from 'styled-components/macro'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { ButtonGray } from '../Button'
import { RowBetween, RowFixed } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useActiveWeb3React } from '../../hooks/web3'
import { Trans } from '@lingui/macro'
import useTheme from '../../hooks/useTheme'
import { Lock } from 'react-feather'
import { AutoColumn } from 'components/Column'
import { FiatValue } from './FiatValue'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 128px;
  background-color: transparent;
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled.div<{ hideInput: boolean, minBorderRadius: boolean }>`
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  border: 1px solid #ea6ce2;
  border-radius: ${({ minBorderRadius }) => (minBorderRadius ? '8px' : '128px')};
  :focus,
  :hover {
    box-shadow: 0px 0px 16px 0px rgba(234, 108, 225, 0.33);
  }
`

const CurrencySelect = styled(ButtonGray)<{ selected: boolean; hideInput?: boolean }>`
  align-items: center;
  font-size: 24px;
  font-weight: 500;
  color: #000000;
  background-color: #ebebeb;
  border: 1px dashed #ea6ce2;
  border-radius: 128px;
  outline: none;
  cursor: pointer;
  user-select: none;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: #d6d6d6;
  }
`

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 16px;
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  background: pink;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const FiatRow = styled(LabelRow)<{ visible: boolean }>`
  justify-content: flex-end;
  background: #ebebeb;
  margin-left: ${({ visible }) => (visible ? '16px' : '0px')};
  margin-right: ${({ visible }) => (visible ? '16px' : '0px')};
  margin-bottom: ${({ visible }) => (visible ? '16px' : '0px')};
  padding: ${({ visible }) => (visible ? '4px' : '0px')};
  border-radius: ${({ visible }) => (visible ? '4px' : '0px')};
  height: ${({ visible }) => (visible ? '' : '0px !important')};
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: #999999;
    stroke-width: 1.5px;
  }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  margin: 0 16px 0 8px;
  font-weight: 500;
  font-size: 16px;
  color: #999999;
`

const StyledBalanceMax = styled.button<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.primaryText1};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};
  margin-left: 0.25rem;

  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  fiatValue?: CurrencyAmount<Token> | null
  priceImpact?: Percent
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode
  locked?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer>
          <AutoColumn gap="sm" justify="center">
            <Lock />
            <TYPE.label fontSize="12px" textAlign="center" padding="0 12px">
              <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
            </TYPE.label>
          </AutoColumn>
        </FixedContainer>
      )}

      <Container hideInput={hideInput} minBorderRadius={(renderBalance || fiatValue || selectedCurrencyBalance) ? true : false}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!onCurrencySelect}>
          <CurrencySelect
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <RowFixed>
                {pair ? (
                  <span style={{ marginRight: '0.5rem' }}>
                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                  </span>
                ) : currency ? (
                  <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size={'24px'} />
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {(currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol) || <Trans>Select a token</Trans>}
                  </StyledTokenName>
                )}
              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={(val) => {
                  onUserInput(val)
                }}
              />
            </>
          )}
        </InputRow>
        {!hideInput && !hideBalance && (
          <FiatRow visible={(renderBalance || fiatValue || selectedCurrencyBalance) ? true : false}>
            <RowBetween>
              {account ? (
                <RowFixed style={{ height: '17px' }}>
                  <TYPE.body
                    onClick={onMax}
                    color={theme.text2}
                    fontWeight={400}
                    fontSize={14}
                    style={{ display: 'inline', cursor: 'pointer' }}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      renderBalance ? (
                        renderBalance(selectedCurrencyBalance)
                      ) : (
                        <Trans>
                          Balance: {formatCurrencyAmount(selectedCurrencyBalance, 4)} {currency.symbol}
                        </Trans>
                      )
                    ) : null}
                  </TYPE.body>
                  {showMaxButton && selectedCurrencyBalance ? (
                    <StyledBalanceMax onClick={onMax}>
                      <Trans>(Max)</Trans>
                    </StyledBalanceMax>
                  ) : null}
                </RowFixed>
              ) : (
                <span />
              )}
              <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
            </RowBetween>
          </FiatRow>
        )}
      </Container>

      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
        />
      )}
    </InputPanel>
  )
}
