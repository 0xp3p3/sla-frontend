
const SummaryItem = (props: { title: string, value: string }) => {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px", marginBottom: "20px", textAlign: "center"}}>
      <p className="p1"><strong>{props.title}</strong></p>
      <p className="p1">{props.value}</p>
    </div>
  )
}


export default SummaryItem