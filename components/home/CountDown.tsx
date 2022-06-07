import { useEffect, useState } from 'react';
import useCountdown from '../../hooks/useCountdown';


const getReturnValues = (countDown: number): number[] => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24))
  const hours = Math.floor((countDown / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((countDown / 1000 / 60) % 60)
  const seconds = Math.floor((countDown / 1000) % 60)

  return [days, hours, minutes, seconds];
}

const CountDownBlock = (props: { interval: string, amount: number | null }) => {
  return (
    <div className="countdown-wrap">
      <h2 id={props.interval} className="h3">{props.amount !== null ? props.amount : 'TBD'}</h2>
      <div className="p1">{props.interval.toUpperCase()}</div>
    </div>
  )
}

const CountDown = ({ targetDate }: { targetDate: Date | null }) => {  
  const { countDown } = useCountdown()

  const [countDownTimes, setCountdownTimes] = useState<(number | null)[]>([null, null, null, null])
  const [days, hours, minutes, seconds] = countDownTimes

  useEffect(() => {
    setCountdownTimes(countDown ? getReturnValues(countDown) : [null, null, null, null])
  }, [countDown])

  if (targetDate && (days + hours + minutes + seconds <= 0)) {
    return <h1 className="h1 countdown" style={{marginBottom: "50px"}}>WHITELIST MINTING NOW</h1>
  } else {
    return (
      <>
        <h1 className="h1 countdown">COMING SOON</h1>
        <div className="w-layout-grid counter-grid">
          <CountDownBlock interval="DAYS" amount={days} />
          <CountDownBlock interval="HOURS" amount={hours} />
          <CountDownBlock interval="MINUTES" amount={minutes} />
          <CountDownBlock interval="SECONDS" amount={seconds} />
        </div>
      </>
    );
  }
};

export default CountDown