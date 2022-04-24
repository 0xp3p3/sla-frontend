import { useEffect, useState } from 'react';
import * as mpl from '@metaplex/js'
import LoadingSpinner from '../utils/LoadingSppiner';
import styles from "../../styles/CombinedImage.module.css";

interface Props {
  metadataOfImageToDisplay: mpl.MetadataJson | null,
  buildLayerByLayer: boolean,  // if false, we simply show the image given in the link of the metadata
}


const CombinedImage = (props: Props) => {
  const [imageUrl, setImageUrl] = useState<string>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!props.metadataOfImageToDisplay) {
      setImageUrl(null)
    } else if (!props.buildLayerByLayer) {
      setImageUrl(props.metadataOfImageToDisplay?.image)
    } else if (props.metadataOfImageToDisplay) {
      pushNewImageToS3().then(link => {setImageUrl(link)})
    }
  }, [props.metadataOfImageToDisplay, props.buildLayerByLayer])

  let pushNewImageToS3 = async (): Promise<string> => {
    setIsLoading(true)

    const data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ attributes: props.metadataOfImageToDisplay.attributes })
    }
    const response = await fetch("/api/combineTraits/createNewAgent", data)
    const responseBody = await response.json()
    
    setIsLoading(false)
    
    return responseBody.url
  }

  return (
    <>
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