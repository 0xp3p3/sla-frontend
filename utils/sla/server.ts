import { NODE_SERVER_URL } from "../constants";


interface MergeRequestResponse {
  message: string | null,
  metadataLink: string | null,
  imageLink: string | null,
  uploadPrice: number | null,
  error: string | null
}

export async function requestMerge(tx: string): Promise<MergeRequestResponse> {
  const request = NODE_SERVER_URL + 'api/merge-trait/' + tx
  return fetch(request)
    .then((res) => res.json())
}