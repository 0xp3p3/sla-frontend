import { SLA_COLLECTIONS } from "../../utils/constants"
import TraitMintingButton from "./TraitMintintButton"

const TraitMingintMain = () => {
  return (
    <div>
      <div className="w-layout-grid grid-2">
        <div data-hover="false" data-delay={0} id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815dd-faba1442" data-w-id="c51ac5e2-ed2e-9254-8fc8-bd71e7d815dd" className="dropdown-2 w-dropdown">
          <nav className="dropdown-list-2 w-dropdown-list" />
        </div>
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f4-faba1442" />
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f5-faba1442" className="none-mob" />
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f6-faba1442" className="vert-left space-btw h-472">
          <div className="vert-left">
            <div className="img-bg" style={{ marginBottom: '30px' }}>
              <img src="images/Skin-15---Tiger.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Skin-15---Tiger-p-500.png 500w, images/Skin-15---Tiger-p-800.png 800w, images/Skin-15---Tiger.png 1000w" alt="" className="llama-img select" />
            </div>
            <h3 className="h3 h-white mrg-d-34">Supply: 6,000</h3>
          </div>
          <TraitMintingButton collection={SLA_COLLECTIONS.skin}/>
        </div>
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d81601-faba1442" className="vert-left space-btw h-472">
          <div className="vert-left">
            <div className="img-bg" style={{ marginBottom: '30px' }}>
              <img src="images/Eyes-34---Green-Frame.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Eyes-34---Green-Frame-p-500.png 500w, images/Eyes-34---Green-Frame-p-800.png 800w, images/Eyes-34---Green-Frame.png 1000w" alt="" className="llama-img select dis" />
            </div>
            <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
          </div>
          <TraitMintingButton collection={SLA_COLLECTIONS.eyes}/>
        </div>
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d8160e-faba1442" className="vert-left space-btw h-472">
          <div className="vert-left">
            <div className="img-bg" style={{ marginBottom: '30px' }}>
              <img src="images/Mouth-06---Smoking-Marijuana.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Mouth-06---Smoking-Marijuana-p-500.png 500w, images/Mouth-06---Smoking-Marijuana-p-800.png 800w, images/Mouth-06---Smoking-Marijuana.png 1000w" alt="" className="llama-img select dis" />
            </div>
            <h3 className="h3 h-white mrg-d-34">Supply: 6,000</h3>
          </div>
          <TraitMintingButton collection={SLA_COLLECTIONS.mouth} />
        </div>
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d8161b-faba1442" className="vert-left space-btw h-472">
          <div className="vert-left">
            <div className="img-bg" style={{ marginBottom: '30px' }}>
              <img src="images/Clothing-13---Cowboy.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Clothing-13---Cowboy-p-500.png 500w, images/Clothing-13---Cowboy-p-800.png 800w, images/Clothing-13---Cowboy.png 1000w" alt="" className="llama-img select dis" />
            </div>
            <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
          </div>
          <TraitMintingButton collection={SLA_COLLECTIONS.clothing} />
        </div>
        <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d81628-faba1442" className="vert-left space-btw h-472">
          <div className="vert-left">
            <div className="img-bg" style={{ marginBottom: '30px' }}>
              <img src="images/Hat-05---Crown.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Hat-05---Crown-p-500.png 500w, images/Hat-05---Crown-p-800.png 800w, images/Hat-05---Crown.png 1000w" alt="" className="llama-img select dis" />
            </div>
            <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
          </div>
          <TraitMintingButton collection={SLA_COLLECTIONS.hat} />
        </div>
      </div>
    </div>
  )
}

export default TraitMingintMain