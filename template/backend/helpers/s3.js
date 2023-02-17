import aws from 'aws-sdk'

export const uploadFileToS3 = async function (fileKey, fileBuffer, s3Options) {
  const s3 = new aws.S3(s3Options)
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: s3Options.bucket.Bucket,
        Key: fileKey,
        Body: fileBuffer,
      },
      (err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      },
    )
  })
}

export const getFileStreamFromS3 = function (fileKey, s3Options) {
  const s3 = new aws.S3(s3Options)
  const fileStream = s3
    .getObject({
      Bucket: s3Options.bucket.Bucket,
      Key: fileKey,
    })
    .createReadStream()
  return fileStream
}
