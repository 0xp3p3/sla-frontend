import { Loader } from "semantic-ui-react"


const CustomLoader = () => <Loader active inline='centered' />


const Button = (props) => {
  const { className, isWaiting, disabled, ...otherProps } = props
  return (
    <button 
      className={"button w-button" + " " + className} 
      style={disabled ? {boxShadow: "none", cursor: "not-allowed"} : {}}
      {...otherProps}
    >
      {isWaiting ? <CustomLoader /> : props.children}
    </button>
  )
}

export default Button