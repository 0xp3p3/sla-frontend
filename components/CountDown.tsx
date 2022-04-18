import { useEffect, useState } from "react"


interface TimeLeft {
  days: number | null,
  hours: number | null,
  minutes: number | null,
  seconds: number | null,
}

const computeTimeLeft = (target: Date | null): TimeLeft => {
  if (!target) { return  {
    days: null, hours: null, minutes: null, seconds: null
  } }

  let timeLeft = {
    days: 0, hours: 0, minutes: 0, seconds: 0
  }

  const difference = +target - Date.now()
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  return timeLeft
}

const isTimerFinished = (t: TimeLeft): boolean => {
  return t.days == 0 && t.hours == 0 && t.minutes == 0 && t.seconds == 0
}


const CountDownBlock = (props: {interval: string, amount: number | null}) => {

  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => { setTimeLeft(props.amount) }, [props.amount])

  return (
    <div className="countdown-wrap">
      <h2 id={props.interval} className="h3">{timeLeft !== null ? timeLeft : 'TBD'}</h2>
      <div className="p1">{props.interval.toUpperCase()}</div>
    </div>
  )
}

interface Props {
  date: Date | null,
}

const CountDown = (props: Props) => {
  const [isCountdownLive, setIsCountdownLive] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(computeTimeLeft(props.date))
  const [isLive, setIsLive] = useState(isTimerFinished(timeLeft))
  const [title, setTitle] = useState('coming soon')

  // Start the countdown when the `date` is no longer `null`
  useEffect(() => { setIsCountdownLive(props.date ? true : false) }, [props.date])

  useEffect(() => {setTitle(isLive ? 'minting now' : 'coming soon')}, [isLive])

  // Update the countdown every second
  useEffect(() => {
    console.log('useEffect called')
    const timer = setTimeout(() => {
      console.log('timeout starting')
      if (isCountdownLive && !isLive) {
        console.log('update bit entered')
        // Re-compute the time left
        const t = computeTimeLeft(props.date)
        setTimeLeft(t)

        // Check whether the countdown has ended
        setIsLive(isTimerFinished(t))
      } 
    }, 1000)  // update the countdown every 1000ms

    return () => clearTimeout(timer)
  }, [props.date, timeLeft])

  return (
    <>
      <h1 className="h1">{title}</h1>
      <h3 className="h3">{isCountdownLive ? 'yes' : 'no'} {isLive ? 'yes' : 'no'}</h3>
      <div className="w-layout-grid counter-grid">
        <CountDownBlock interval="DAYS" amount={timeLeft.days} />
        <CountDownBlock interval="HOURS" amount={timeLeft.hours} />
        <CountDownBlock interval="MINUTES" amount={timeLeft.minutes} />
        <CountDownBlock interval="SECONDS" amount={timeLeft.seconds} />
      </div>
    </>
  )
}

export default CountDown