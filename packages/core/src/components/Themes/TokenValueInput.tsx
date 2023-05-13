import { Box } from '@chakra-ui/react'
import useMirrorfulStore from '@core/store/useMirrorfulStore'
import { assertToken, assertTokenGroup, TToken, TTokenGroup } from '@core/types'
import { SketchPicker } from '@hello-pangea/color-picker'
import { useMemo, useState } from 'react'
import Select, {
  components,
  InputProps,
  OptionProps,
  SingleValue,
} from 'react-select'
import tinycolor from 'tinycolor2'

import ColorPicker from '../ColorPalette/ColorPicker'

type TTokenOption = {
  id: string
  path: string
  value: string
}

const getTokenOptions = (colors: TTokenGroup) => {
  const options: TTokenOption[] = []

  const checkNode = (node: TTokenGroup | TToken, currentPath: string) => {
    if (assertToken(node)) {
      options.push({
        id: node.id,
        path: currentPath,
        value: node.value,
      })
    } else if (assertTokenGroup(node)) {
      Object.keys(node).forEach((key) => {
        checkNode(
          node[key],
          currentPath.length === 0 ? key : currentPath + '.' + key
        )
      })
    }
  }

  checkNode(colors, '')

  return options.map((option) => ({ ...option, path: `{${option.path}}` }))
}

export function TokenValueInput({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const { colors } = useMirrorfulStore()

  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [colorValue, setColorValue] = useState<string>('')
  const [selectedOption, setSelectedOption] =
    useState<SingleValue<TTokenOption> | null>(null)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const options = useMemo(() => getTokenOptions(colors), [colors])

  return (
    <Box css={{ width: '400px' }}>
      <Box css={{ display: 'flex', alignItems: 'center' }}>
        <Box
          css={{
            width: '38px',
            height: '38px',
            backgroundColor: colorValue,
            // border: isFocused ? '1px solid lightgray' : '2px solid blue',
            border: '1px solid lightgray',

            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
          }}
          _hover={{ border: '1px solid gray' }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />

        <Select
          isMulti={false}
          value={selectedOption}
          inputValue={value}
          onInputChange={(inputValue, { action }) => {
            if (action === 'input-change') {
              onValueChange(inputValue)
              if (inputValue === '') {
                setSelectedOption(null)
              }
              setColorValue(inputValue)
            }
          }}
          onChange={(option) => {
            setColorValue(option ? option.value : '')
            onValueChange(option ? option.path : '')
            setSelectedOption(option)
          }}
          options={options}
          getOptionLabel={(option) => option.path}
          getOptionValue={(option) => option.path}
          components={{
            Input: CustomInput,
            Option: CustomOption,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          styles={{
            container: (styles) => ({
              ...styles,
              flexGrow: 1,
            }),
            control: (styles) => ({
              ...styles,
              borderRadius: '0 8px 8px 0',
              borderColor: 'lightgray',
              borderLeft: 'none',
              outline: 'none',
            }),
            input: (styles) => ({
              ...styles,
              width: '100%',
            }),
          }}
        />
      </Box>
      {showColorPicker && (
        <Box>
          <ColorPicker
            colorPickerColor={colorValue}
            onChange={(color) => {
              const hex = tinycolor(color).toString()
              setColorValue(hex)
              onValueChange(hex)
            }}
          />
        </Box>
      )}
    </Box>
  )
}

function CustomInput(props: InputProps<TTokenOption, false>) {
  return <components.Input {...props} isHidden={false} />
}

function CustomOption(props: OptionProps<TTokenOption, false>) {
  return (
    <Box css={{ display: 'flex', alignItems: 'center' }}>
      <Box
        css={{
          padding: '12px',
          width: '25px',
          height: '25px',
          backgroundColor: props.data.value,
        }}
      />
      <components.Option {...props} />
    </Box>
  )
}