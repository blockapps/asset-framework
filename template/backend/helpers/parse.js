import { fsUtil, parser } from 'blockapps-rest'

const getEnums = (filePath) => {
  const assetErrorSource = fsUtil.get(filePath)
  return parser.parseEnum(assetErrorSource)
}

const getEnumsCached = (filePath) => {
  let cachedEnum
  return () => {
    if (!cachedEnum) {
      cachedEnum = getEnums(filePath)
    }
    return cachedEnum
  }
}

export { getEnums, getEnumsCached }
