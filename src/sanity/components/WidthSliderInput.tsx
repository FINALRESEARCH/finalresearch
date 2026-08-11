import { Box, Flex, Text } from '@sanity/ui'
import type { NumberInputProps } from 'sanity'
import { set, unset } from 'sanity'

export function WidthSliderInput(props: NumberInputProps) {
  const { value = 100, onChange, elementProps } = props

  return (
    <Flex align="center" gap={3}>
      <Box flex={1}>
        <input
          {...elementProps}
          type="range"
          min={10}
          max={100}
          step={5}
          value={value}
          onChange={(event) => {
            const next = Number(event.currentTarget.value)
            onChange(next ? set(next) : unset())
          }}
          style={{ width: '100%' }}
        />
      </Box>
      <Text size={1} muted style={{ minWidth: '3em', textAlign: 'right' }}>
        {value}%
      </Text>
    </Flex>
  )
}
