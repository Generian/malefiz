import type { NextApiRequest, NextApiResponse } from "next"
import { GameData, retrieveSpecificGameFromDatabase } from "src/prisma/database"

import { useRouter } from "next/router"

type Data = {
  gameData: GameData | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { lid },
  } = req

  // const router = useRouter()
  let gameData = null
  if (typeof lid == "string") {
    console.log(lid)
    gameData = await retrieveSpecificGameFromDatabase(lid)
  }
  res.status(200).json({ gameData })
}
