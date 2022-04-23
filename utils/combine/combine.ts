import * as web3 from '@solana/web3.js';
import * as mpl from '@metaplex/js'
import { uploadToArweaveDevnet } from './utils/upload/devnetUpload';
import { fetchArweaveMetadata, udpateAvatarMetadata } from './metadata';
import { createNewAvatar } from './image';


interface NewData {
  avatarJson: mpl.MetadataJson,
  newImage: Buffer
}


export const buildNewImage = async (
  avatarMint: string,
  traitMint: string,
  connection: web3.Connection,
): Promise<Buffer> => {
  try {
    const data = await fetchArweaveMetadata(
      new web3.PublicKey(avatarMint), 
      new web3.PublicKey(traitMint), 
      connection
    )

    // Update the Avatar .json metadata
    data.avatarJson = udpateAvatarMetadata(data.avatarJson, data.traitJson)

    // Construct the new image layer by layer
    const newImage = await createNewAvatar(data.avatarJson.attributes)

    // // Upload new assets to Arweave
    // const [metadataLink, imageLink, uploadPrice] = await uploadToArweaveDevnet(assetsDir, arweaveWallet, connection)

    // // Send new links back to client
    // res.json({ 
    //   message: 'success', 
    //   metadataLink: metadataLink, 
    //   imageLink: imageLink, 
    //   uploadPrice: uploadPrice,
    //   error: null,
    // })
    return newImage

  } catch (error: any) {
    console.log('Error', error)
  }
}
