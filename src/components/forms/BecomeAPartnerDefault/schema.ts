import * as yup from 'yup'

export const schema = yup.object().shape({
  name: yup.string().required('Full Name is required.'),
  email: yup
    .string()
    .email('Email is in an invalid format.')
    .required('Email is required.')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email is in an invalid format.',
    ),
  company_name: yup.string().required('Company name is required.'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d+$/, 'Phone number must contain only digits.')
    .min(10, 'Phone number must be at least 10 characters')
    .max(10, 'Phone number must be at most 10 characters'),
})
