import ip from 'ip'
import axios from "axios";
import config from "../load.config";
import { fsUtil } from "blockapps-rest";
import { util } from "../blockapps-rest-plus";

const { serverIP } = config
const port = 30303
const localIp = serverIP || ip.address()

const CACHED_DATA = {
  nodePublicKey : null, 
  nodeAddress : null,
}

export const getCurrentEnode = async () => {
  const publicKey = await getPublicKey()
  return `enode://${publicKey}@${localIp}:${port}`
}

const KEY_ENDPOINT = "/strato/v2.3/key";

async function getPublicKey(username = "nodekey") {
  if (CACHED_DATA.nodePublicKey) { return CACHED_DATA.nodePublicKey }
  try {
    const { token } = await util.getApplicationCredentials({ config });
    const url = `${config.nodes[0].url}${KEY_ENDPOINT}?username=${username}`;
    const response = await axios
      .get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((err) => {
        console.log(err)
      });
    CACHED_DATA.nodePublicKey = response.data.pubkey
    return response.data.pubkey;
  } catch (e) {
    console.log(`Failed to fetch this ${username} publickey`);
    // console.log(e); uncomment if you want the full error
    throw e;
  }
}

export const getNodeAddress = async (username = "nodekey") => {
  if (CACHED_DATA.nodePublicKey) { return CACHED_DATA.nodePublicKey }
  try {
    const { token } = await util.getApplicationCredentials({ config });
    const url = `${config.nodes[0].url}${KEY_ENDPOINT}?username=${username}`;
    const response = await axios
      .get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((err) => {
        console.log(err)
      });
    CACHED_DATA.nodeAddress = response.data.address
    return response.data.address;
  } catch (e) {
    console.log(`Failed to fetch this ${username} addresss`);
    // console.log(e); uncomment if you want the full error
    throw e;
  }
}