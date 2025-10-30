import { StylesConfig } from 'react-select'
import { IOption } from '@/types'

export const customStyles: StylesConfig<IOption> = {
  control: (styles, { isDisabled, isFocused }) => ({
    ...styles,
    backgroundColor: isDisabled ? 'var(--color-gray-10)' : 'var(--color-white)',
    height: '42rem',
    minHeight: '42rem',
    borderWidth: '1rem',
    borderColor: isDisabled
      ? 'var(--color-gray-10)'
      : isFocused
        ? 'var(--color-black)'
        : 'var(--color-gray-50)',
    borderRadius: '8px',
    padding: 0,
    transition:
      'border-color var(--transition-duration-button) var(--transition-easing-button)',
    boxShadow: 'none',
    '& > div': {
      padding: 0,
    },
    '&:hover': {
      borderColor: 'var(--color-black)',
    },
  }),
  input: (styles) => ({
    ...styles,
    padding: 0,
    margin: 0,
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: '14rem',
    color: 'var(--color-gray-70)',
    fontFamily: 'var(--font-primary-regular)',
    margin: 0,
    padding: '0 0 0 16rem',
  }),
  singleValue: (styles) => ({
    ...styles,
    color: 'var(--color-black)',
    fontSize: '14rem',
    fontFamily: 'var(--font-primary-regular)',
    margin: 0,
    padding: '0 16rem',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (styles, { isDisabled }) => ({
    ...styles,
    width: '18rem',
    height: '18rem',
    padding: 0,
    color: isDisabled ? 'var(--color-gray-70)' : 'var(--color-black)',
    marginRight: '16rem',
    '&:hover': {
      color: 'var(--color-black)',
    },
  }),
  menu: (styles) => ({
    ...styles,
    borderRadius: '8px',
    borderColor: 'var(--color-gray-50)',
    overflow: 'hidden',
  }),
  menuList: (styles) => ({
    ...styles,
    padding: 0,
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    fontSize: '14rem',
    color: isSelected
      ? 'var(--color-white)'
      : isFocused
        ? 'var(--color-black)'
        : 'var(--color-gray-70)',
    fontFamily: 'var(--font-primary-regular)',
    backgroundColor: isSelected
      ? 'var(--color-primary-dark-blue)'
      : isFocused
        ? 'var(--color-gray-10)'
        : 'var(--color-white)',
    padding: '0 16rem',
    height: '34rem',
    lineHeight: '34rem',
    transition:
      'background-color var(--transition-duration-button) var(--transition-easing-button), color var(--transition-duration-button) var(--transition-easing-button)',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
}
