import { useEffect, useState } from "react"
import * as mpl from '@metaplex/js'
import AgentSelectionDropdown from "../utils/AgentSelectionDropdown"
import TraitSelectionDropdown from "../utils/TraitSelectionDropdown"
import CombinedImage from "./CombinedImage"
import { createNewAvatarMetadata, downloadMetadataFromArweave } from "../../utils/metadata"
import { PublicKey } from "@solana/web3.js"
import { useConnection } from '@solana/wallet-adapter-react';


const Combine = () => {
  const { connection } = useConnection()
  
  const [llamaMint, setLlamaMint] = useState<PublicKey>(null)
  const [traitMint, setTraitMint] = useState<PublicKey>(null)

  const [llamaMetadata, setLlamaMetadata] = useState<mpl.MetadataJson>(null)
  const [traitMetadata, setTraitMetadata] = useState<mpl.MetadataJson>(null)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)

  const [bothLlamaAndTraitSelected, setBothLlamaAndTraitSelected] = useState(false)

  // Update the Llama Metadata
  useEffect(() => {
    if (llamaMint && connection) {
      downloadMetadataFromArweave(llamaMint, connection).then(
        data => setLlamaMetadata(data)
      )
    }
  }, [llamaMint])

  // Update the Trait Metadata
  useEffect(() => {
    if (traitMint && connection) {
      downloadMetadataFromArweave(traitMint, connection).then(
        data => setTraitMetadata(data)
      )
    }
  }, [traitMint])

  // Update the combination of Llama & Trait
  useEffect(() => {
    if (llamaMetadata && traitMetadata) {
      const newMetadata = createNewAvatarMetadata(llamaMetadata, traitMetadata)
      setMetadataToDisplay(newMetadata)
      setBothLlamaAndTraitSelected(true)
    } else if (llamaMetadata && !traitMetadata) {
      setMetadataToDisplay(llamaMetadata)
      setBothLlamaAndTraitSelected(false)
    } else if (!llamaMetadata && traitMetadata) {
      setMetadataToDisplay(traitMetadata)
      setBothLlamaAndTraitSelected(false)
    } else {
      setMetadataToDisplay(null)
      setBothLlamaAndTraitSelected(false)
    }
  }, [llamaMetadata, traitMetadata])

  return (
    <div className="w-layout-grid grid-2">
      <div data-hover="false" data-delay={0} id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a266193-faba1442" data-w-id="5fabc8b3-0684-a61b-e57d-11de5a266193" className="dropdown-2 w-dropdown">
        <AgentSelectionDropdown />
        <nav className="dropdown-list-2 relative w-dropdown-list" />
      </div>
      <div data-hover="false" data-delay={0} id="w-node-_3b4f53e1-655f-3fe7-b1a9-62dbca4e746e-faba1442" className="dropdown-2 mob w-dropdown">
        <TraitSelectionDropdown />
        <nav className="dropdown-list-2 w-dropdown-list" />
      </div>
      <div id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a2661aa-faba1442" className="vert-left">
        <div className="hor-cen m-100-perc vert-mob">
          <div className="vert-cent">
            <CombinedImage metadataOfImageToDisplay={metadataToDisplay} buildLayerByLayer={bothLlamaAndTraitSelected} />
            <div className="form-block-2 mob w-form">
              <form id="email-form" name="email-form" data-name="Email Form" method="get">
                <input type="text" className="text-field _2 w-input" maxLength={256} name="name-2" data-name="Name 2" placeholder="Alias" id="name-2" />
                <input type="email" className="text-field _2 w-input" maxLength={256} name="email-2" data-name="Email 2" placeholder="Confirm alias" id="email-2" required />
              </form>
              <div className="w-form-done">
                <div>Thank you! Your submission has been received!</div>
              </div>
              <div className="w-form-fail">
                <div>Oops! Something went wrong while submitting the form.</div>
              </div>
            </div>
            <a href="#" className="button combine w-button">combine</a>
          </div>
          <div className="form-block-2 desk w-form">
            <form id="email-form" name="email-form" data-name="Email Form" method="get"><input type="text" className="text-field _2 w-input" maxLength={256} name="name" data-name="Name" placeholder="Alias" id="name" />
              <input type="email" className="text-field _2 w-input" maxLength={256} name="email" data-name="Email" placeholder="Confirm alias" id="email" required />
            </form>
            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
        <div className="error-message">
          <div className="tb-24 red">You cannot combine traits at this time. please come back later.</div>
        </div>
      </div>
      <div data-hover="false" data-delay={0} id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a2661af-faba1442" data-w-id="5fabc8b3-0684-a61b-e57d-11de5a2661af" className="dropdown-2 desk w-dropdown">
        <div style={{ backgroundColor: 'rgb(255,255,255)', color: 'rgba(0,0,0,0.5)' }} className="dropdown-toggle w-dropdown-toggle">
          <div>select your trait</div>
          <div className="dd-arrow-wrap"><img src="images/Vector-20.svg" loading="lazy" style={{ filter: 'invert(0%)' }} alt="" className="dd-arrow" /></div>
        </div>
        <nav className="dropdown-list-2 w-dropdown-list" />
      </div>
    </div>
  )
}

export default Combine