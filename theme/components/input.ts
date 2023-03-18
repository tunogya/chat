import { defineStyleConfig } from '@chakra-ui/react'
import {Montserrat} from '@next/font/google';

const montserrat = Montserrat({ subsets: ['latin'] });

const Input = defineStyleConfig({
  baseStyle: {},
  variants: {
    filled: {
      field: {
        fontFamily: montserrat.style.fontFamily,
        borderRadius: '6px',
        borderWidth: '1px',
        fontSize: 'sm',
        fontWeight: '500',
        _focus: {
        },
        _hover: {
        },
      },
    },
    outline: {
      field: {
        fontFamily: montserrat.style.fontFamily,
        borderRadius: '6px',
        borderWidth: '1px',
        fontSize: 'sm',
        fontWeight: '500',
        _focus: {
        },
        _hover: {
        },
      }
    }
  },
  defaultProps: {
    size: 'md',
    variant: 'filled',
  }
})

export default Input