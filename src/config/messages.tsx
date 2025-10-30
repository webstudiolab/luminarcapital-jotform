import { eachWordToUpperCase } from '@/utils/string/eachWordToUpperCase'

type dataProps = {
  name: string
  email: string
  company_name?: string
  phone: string
  business_name?: string
  amount_of_financing_requested?: string
  average_of_monthly_sales?: string
  business_objectives?: string
}

// eslint-disable-next-line no-unused-vars
type MessageValue = (data?: dataProps) => string

export const messages: { [key: string]: MessageValue } = {
  admin: (data) => {
    let answers: string = ''
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        answers += `<li><b style="font-family: Arial, Helvetica, sans-serif; margin-bottom: 0;">${eachWordToUpperCase(key.split('_').join(' '))}:</b><p style="font-family: Arial, Helvetica, sans-serif; margin-top: 0;">${value}</p></li>`
      }
    }

    return `
    <h3 style="font-family: Arial, Helvetica, sans-serif;">Hello!</h3>
    <p style="font-family: Arial, Helvetica, sans-serif;">A new request has just been submitted through the website and has been successfully saved in the admin panel.</p>
    <h4 style="font-family: Arial, Helvetica, sans-serif;">Details of the Submitted Request:</h4>
    <ul>
    ${answers}
    </ul>
    <p style="font-family: Arial, Helvetica, sans-serif;">Please log in to the <a href="https://admin.luminarcapital.com/wp-admin/" target="_blank">admin dashboard</a> to review the details.</p>
    <p style="font-family: Arial, Helvetica, sans-serif;">Thank you!</p>
    <p style="font-family: Arial, Helvetica, sans-serif;">Best regards,</p>
    <p style="font-family: Arial, Helvetica, sans-serif;"><b>Luminar Capital Team</b></p>
`
  },
  user: () => {
    return `
  <h3 style="font-family: Arial, Helvetica, sans-serif; font-size: 1.3em;">Hello!</h3>
  <p style="font-family: Arial, Helvetica, sans-serif;">Thank you for completing the form on our website.</p>
  <p style="font-family: Arial, Helvetica, sans-serif;">We have successfully received your inquiry and it is being reviewed by our team.</p>
 
  <p style="font-family: Arial, Helvetica, sans-serif;">One of our financing specialists will reach out to discuss your request further and provide any necessary information.</p>
  <p style="font-family: Arial, Helvetica, sans-serif; ">We truly appreciate your interest in our services and we look forward to assisting you!</p>
  <p style="font-family: Arial, Helvetica, sans-serif;">Best regards,</p>
  <h3 style="font-family: Arial, Helvetica, sans-serif; font-size: 1.3em;"><b>Luminar Capital Team</b></h3>
  `
  },
}
