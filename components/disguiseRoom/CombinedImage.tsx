import LoadingSpinner from '../utils/LoadingSppiner';
import styles from "../../styles/CombinedImage.module.css";



interface Props {
  previewImageUrl: string | null,
  isPreviewLoading: boolean,
}


const CombinedImage = (props: Props) => {
  return (
    <>
      <div className={"llama-img select"}>
        <div className={styles.container}>
          {props.isPreviewLoading ? <LoadingSpinner /> : (
            <img src={props.previewImageUrl ? props.previewImageUrl : "images/Group-36.png"} loading="lazy" alt="" />
          )}
        </div>
      </div>
    </>
  )
}

export default CombinedImage