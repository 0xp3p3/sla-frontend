import { useEffect, useState } from 'react';

const useCountdown = (targetDate: Date | null): (number | null)[] => {
  
  const countDownDate = targetDate ? new Date(targetDate).getTime() : null

  const [countDown, setCountDown] = useState<number | null>(
    countDownDate ? countDownDate - new Date().getTime() : null
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate ? countDownDate - new Date().getTime() : null)
    }, 1000)

    return () => clearInterval(interval);
  }, [countDownDate])

  return countDown ? getReturnValues(countDown) : [null, null, null, null]
}

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
  const [days, hours, minutes, seconds] = useCountdown(targetDate)

  if (targetDate && (days + hours + minutes + seconds <= 0)) {
    return <h1 className="h1 countdown">WHITELIST MINTING NOW</h1>
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