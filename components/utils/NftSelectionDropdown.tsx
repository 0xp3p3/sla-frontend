import { Dropdown } from 'semantic-ui-react'
import { useEffect, useState } from 'react'

import { NFT } from "../../hooks/useWalletNFTs"
import styles from "../../styles/NftSelectionDropdown.module.css"


interface Props {
  text: string,
  // className: string,
  nfts: NFT[],
  onChange: (nft: NFT) => void,
}

interface Option {
  key: string,
  text: string,
  value: string,
  image: { avatar: boolean, src: string },
}

const NftSelectionDropdown = (props: Props) => {

  const [options, setOptions] = useState<Option[]>([])
  const [selectedNft, setSelectedNft] = useState<NFT>(null)

  const handleOnChange = (e, { value }) => {
    const nft = props.nfts.filter(nft => nft.mint.toString() === value)[0]
    setSelectedNft(nft)
    props.onChange(nft)
  }

  const shortenNftName = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.startsWith("llama agent #")) {
      return name.substring(6)
    }
    
    if (lowerName.startsWith("sla legendary")) {
      return name.substring(14)
    }

    if (lowerName.startsWith("sla")) {
      return name.substring(4)
    }

    return name.substring(0, 25)
  }

  useEffect(() => {
    const dropdownOptions = props.nfts.map(nft => {
      const mint = nft.mint.toString()
      return {
        key: mint,
        text: shortenNftName(nft.externalMetadata.name),
        value: mint,
        image: { avatar: false, src: nft.externalMetadata.image }
      }
    })
    setOptions(dropdownOptions)
  }, [props.nfts])

  return (
    <Dropdown
      placeholder={props.text}
      fluid
      clearable
      scrolling
      selectOnBlur={false}
      className={styles.dropdown}
      onChange={handleOnChange}
      options={options}
    />
  )
}

export default NftSelectionDropdown