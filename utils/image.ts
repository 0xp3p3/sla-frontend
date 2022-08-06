import * as mpl from '@metaplex/js';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import { imageSize } from './constants';


export async function createNewAvatar(attributes: mpl.MetadataJsonAttribute[] | null): Promise<Buffer> {
  if (!attributes) { return }

  const layersDirectory = process.env.S3_LAYER_STORE 

  // Create the new Avatar and return it as a buffer
  return await makeCreateImageWithCanvas(attributes, imageSize.width, imageSize.height, layersDirectory)
}

async function makeCreateImageWithCanvas(
  attributes: mpl.MetadataJsonAttribute[],
  width: number, 
  height: number, 
  layersDirectory: string
): Promise<any> {
  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')

  let newAttributes: mpl.MetadataJsonAttribute[] = JSON.parse(JSON.stringify(attributes))

  // Add the original Ears if they're not specified
  if (newAttributes.filter(a => a.trait_type === 'Ears').length === 0) {
    newAttributes.push({"trait_type": "Ears", "value": "Original"})
  }

  const skin = newAttributes.filter(a => a.trait_type === "Skin")[0]
  if (skin.value === "Original") {
    skin.value = "Original_no_ears"
  }

  const addLayer = async (context: CanvasRenderingContext2D, imageLocation: string) => {
    const loadedImage = await loadImage(imageLocation)
    context.patternQuality = 'best'
    context.quality = 'best'
    context.drawImage(loadedImage, 0, 0, width, height)
  }

  const extractTraitPair = (trait: string): mpl.MetadataJsonAttribute | null => {
    const pairs = newAttributes.filter(a => a.trait_type === trait)
    return pairs.length > 0 ? pairs[0] : null
  }

  const getImageLocation = (traitPair: mpl.MetadataJsonAttribute): string => {
    const url = `${layersDirectory}/${traitPair.trait_type}/${traitPair.value}.png`
    const encodedUrl = encodeURI(url)
    console.log(`Fetching layer image from: ${encodedUrl}`)
    return encodedUrl
  }

  let imageLocation
  let traitPair

  // Add [Skin, Eyes, Mouth, Hat, Clothing] traits
  const traits = ["Background", "Vignette", "Ears", "Skin", "Mouth", "Eyes", "Hat", "Clothing", "Badge"]
  for (const trait of traits) {
    traitPair = extractTraitPair(trait)
    if (traitPair) {
      imageLocation = getImageLocation(traitPair)
      await addLayer(context, imageLocation)
    }
  }

  const buffer = canvas.toBuffer('image/png')
  context.clearRect(0, 0, width, height)

  const optimizedImage = await imagemin.buffer(buffer, {
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.95],
      }),
    ],
  })

  return optimizedImage
}
