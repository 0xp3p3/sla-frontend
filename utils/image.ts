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

  const addLayer = async (context: CanvasRenderingContext2D, imageLocation: string) => {
    const loadedImage = await loadImage(imageLocation)
    context.patternQuality = 'best'
    context.quality = 'best'
    context.drawImage(loadedImage, 0, 0, width, height)
  }

  const extractTraitPair = (trait: string): mpl.MetadataJsonAttribute | null => {
    const pairs = attributes.filter(a => a.trait_type === trait)
    return pairs.length > 0 ? pairs[0] : null
  }

  const getImageLocation = (traitPair: mpl.MetadataJsonAttribute): string => {
    const url = `${layersDirectory}/${traitPair.trait_type}/${traitPair.value}.png`
    console.log(`Fetching layer image from: ${url}`)
    return url
  }

  let imageLocation
  let traitPair

  // Add the Background layer 
  traitPair = extractTraitPair('Background')
  if (traitPair) {
    imageLocation = getImageLocation(traitPair)
    await addLayer(context, imageLocation)
  }

  // Add the Ears 
  imageLocation = `${layersDirectory}/Ears/Original.png`
  await addLayer(context, imageLocation)

  // Add [Skin, Eyes, Mouth, Hat, Clothing] traits
  const traits = ["Skin", "Eyes", "Mouth", "Hat", "Clothing",]
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
