import S3 from 'aws-sdk/clients/s3';
import fs from "fs";


const uploadToS3 = async (
  name: string,
  filepath: string,
  endpoint: string,
) => {

  let filename = encodeURIComponent(name);
  let res = await fetch(`${endpoint}?filename=${filename}`);
  let data = await res.json();  

  if (data.error) {
    console.error(data.error);
    throw data.error;
  } else {
    let s3 = new S3({
      accessKeyId: data.token.Credentials.AccessKeyId,
      secretAccessKey: data.token.Credentials.SecretAccessKey,
      sessionToken: data.token.Credentials.SessionToken,
      region: data.region,
    });
    
    const fileStream = fs.createReadStream(filepath)

    let params = {
      Bucket: data.bucket,
      Key: data.key,
      Body: fileStream,
      CacheControl: 'max-age=630720000, public',
      ContentType: "image/png",
    };

    let s3Upload = s3.upload(params);
    let uploadResult = await s3Upload.promise();

    return {
      url: uploadResult.Location,
      bucket: uploadResult.Bucket,
      key: uploadResult.Key,
    };
  }
};
