import { useState } from 'react'
import { Form, Input, Label } from 'semantic-ui-react'


interface Props {
  setNameCallback: (name: string) => void,
}


const AliasInput = (props: Props) => {
  const [newAlias, setNewAlias] = useState("")
  const [label, setLabel] = useState("")
  const [isError, setIsError] = useState(false)
  const [isValidating, setIsValidating] = useState(false)


  const onChange = (event: any) => {
    const name = event.target.value

    try {
      setIsValidating(true)
      const error = validateAlias(name, [])
      if (!error) {
        setIsError(false)
        setLabel("This alias is available.")
        setNewAlias(name)
        props.setNameCallback(name)
      } else {
        setLabel(error)
        setIsError(true)
        setNewAlias(null)
        props.setNameCallback(null)
      }
    } catch (error: any) {
      console.log(error)
      setIsError(true)
      setLabel("Something went wrong. Please refresh the page.")
      setNewAlias(null)
      props.setNameCallback(null)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Form>
      <Form.Field width={7}>
        <Input 
          placeholder='New alias' 
          error={isError} 
          loading={isValidating} 
          onChange={onChange}
        />
        <Label pointing prompt >
          {label ? label : "15 characters maximum"}
        </Label>
      </Form.Field>
    </Form>
  )
}


function validateAlias(name: string, existingNames: string[]): string | null {

  const maxChars = 20
  if (name.length > maxChars) {
    return `Your alias must be <= ${maxChars} characters.`
  }

  const validAlias = new RegExp('^[a-zA-Z0-9!@#\$\&\?\)\(._-][a-zA-Z0-9\\s!@#\$\&\?\)\(._-]*$')
  if (!validAlias.test(name)) {
    return "This alias in invalid."
  }

  if (existingNames.includes(name)) {
    return "This alias is already taken."
  }

  return null 
}


export default AliasInput