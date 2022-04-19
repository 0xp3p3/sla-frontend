import { withFormik } from 'formik'
import Axios from 'axios'
import { useField } from 'formik'


const FormField = (props) => {
  const [field] = useField(props)
  return <input {...field} {...props} spellCheck={false} />
}


const ContactForm = ({ handleSubmit, handleReset }) => {
  return (
    <form onSubmit={handleSubmit} className="form">
      <FormField type="email" name="email" className="text-field w-input" maxLength={256} placeholder="E-MAIL" id="email"  />
      <button type="submit" defaultValue="sign up" data-wait="Please wait..." className="button blue form w-button">Submit</button>
    </form>
  )
}

const SignupForm = withFormik({
  mapPropsToValues: () => ({ name: '', email: '' }),

  handleSubmit: async (values, { resetForm }) => {
    Axios({
      method: 'POST',
      url: '/api/newsletterSignup',
      data: {
        ...values
      }
    })
    resetForm()
  },

  displayName: 'ContactForm'
})(ContactForm)

export default SignupForm