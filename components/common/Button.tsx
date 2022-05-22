

const Button = (props) => {
  const { className, ...otherProps } = props
  return (
    <button 
      className={"button w-button" + " " + className} 
      {...otherProps}
    >
      {props.children}
    </button>
  )
}

export default Button