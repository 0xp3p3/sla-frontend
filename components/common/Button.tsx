import { Loader } from "semantic-ui-react"


const CustomLoader = () => <Loader active inline='centered' />


const Button = (props) => {
  const { className, isWaiting, ...otherProps } = props
  return (
    <button 
      className={"button w-button" + " " + className} 
      {...otherProps}
    >
      {isWaiting ? <CustomLoader /> : props.children}
    </button>
  )
}

export default Button