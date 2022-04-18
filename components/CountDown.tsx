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


interface Props {
  date: Date | null,
}

const CountDown = (props: Props) => {
  const [isCountdownLive, setIsCountdownLive] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(computeTimeLeft(props.date))
  const [isLive, setIsLive] = useState(isTimerFinished(timeLeft))

  // Start the countdown when the `date` is no longer `null`
  useEffect(() => {
    if (props.date) {
      setIsCountdownLive(true)
    }
  }, [props.date])

  // Upddate the countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (isCountdownLive && props.date && !isLive) {        
        // Re-compute the time left
        const t = computeTimeLeft(props.date)
        setTimeLeft(t)

        // Check whether the countdown has ended
        setIsLive(isTimerFinished(t))
      } 
    }, 1000)  // update the countdown every 1000ms

    return () => clearInterval(timer)
  }, [props.date])

  return (
    <>
      {isLive ? <h1 className="h1">minting now</h1> : <h1 className="h-big">coming soon</h1>}
      <div className="w-layout-grid counter-grid">
        {Object.keys(timeLeft).map((interval) => {
          return (
            <div className="countdown-wrap" key={interval}>
              <h2 id={interval} className="h3">{timeLeft[interval] !== null ? timeLeft[interval] : 'TBD'}</h2>
              <div className="p1">{interval.toUpperCase()}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default CountDown