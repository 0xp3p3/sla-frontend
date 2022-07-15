import { SlaCollection } from "../../utils/constants"


interface Props {
  collection: SlaCollection
}


const TraitViewOnME = (props: Props) => {
  return (
    <>
      <>
        <h3 className="h3 h-white mrg-d-34">Supply: {props.collection.supply}</h3>
        <a style={{ width: "300px" }} href={props.collection.magicEdenUrl} target="_blank" rel="noreferrer" className="button w-button">View on ME</a>
      </>
    </>
  )
}

export default TraitViewOnME