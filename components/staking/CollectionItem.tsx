import React from "react"
import styled from "styled-components"
import { NFT } from "../../hooks/useWalletNFTs"

type Props = {
  item: NFT
  additionalOptions?: React.ReactElement
  onClick?: (item: NFT) => void
  className?: string,
  isSelected: boolean,
}

const ImageWrapper = styled.div`
  &:hover {
    opacity: 0.7;
  };
`

const CollectionItem = (props: Props) => {
  const { item, onClick } = props
  if (!item) return null

  const { externalMetadata } = item

  const handleOnClick = (item: NFT) => () => {
    return onClick ? onClick(item) : true 
  }

  return (
    <div style={{display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", maxWidth: "150px", marginRight: "15px"}}>
      <ImageWrapper style={{ cursor: onClick ? "pointer" : "auto", }} onClick={handleOnClick(item)}>
        <img src={externalMetadata.image} style={{maxHeight: "150px", maxWidth: "150px", border: props.isSelected ? "4px solid" : "1.5px solid"}} />
      </ImageWrapper>
      <p className="p1" style={{overflow: "hidden", fontSize: "18px" }}>{externalMetadata.name}</p>
    </div>
  )
}

export default CollectionItem
