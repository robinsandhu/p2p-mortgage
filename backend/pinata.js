import dotenv from "dotenv";
dotenv.config()
import pinataSDK from '@pinata/sdk'

export default pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);