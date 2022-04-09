import Typewriter from 'typewriter-effect';


interface Props {
  text: string
}

const TypingEffect = (props: Props) => {
  return (
    <Typewriter
      options={{
        strings: props.text,
        autoStart: true,
        loop: false,
        delay: 55,
        cursor: "",
      }}
    />
  )
}

export default TypingEffect