import { useState } from 'react';
import * as mpl from '@metaplex/js'
import LoadingSpinner from '../utils/LoadingSppiner';
import styles from "../../styles/CombinedImage.module.css";

interface Props {
  llamaAttributes: mpl.MetadataJsonAttribute[],
  traitAttributes: mpl.MetadataJsonAttribute[],
}


const CombinedImage = (props: Props) => {
  const [imageUrl, setImageUrl] = useState<string>(null)
  const [isLoading, setIsLoading] = useState(false)

  let upload = async () => {
    setIsLoading(true)
    const response = await (await fetch("/api/combineTraits/createNewAgent")).json()
    setIsLoading(false)
    setImageUrl(response.url)
  }

  return (
    <>
      <button onClick={upload}>Click me</button>
      <div className={"llama-img select"}>
        <div className={styles.container}>
          {isLoading ? <LoadingSpinner /> : (
            <img src={imageUrl ? imageUrl : "images/Group-36.png"} loading="lazy" alt="" />
          )}
        </div>
      </div>
    </>
  )
}

export default CombinedImage