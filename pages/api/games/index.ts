import type { NextApiRequest, NextApiResponse } from "next"
import { GameData, retrieveListOfGamesFromDatabase } from "src/prisma/database"

type Data = {
  listOfGames: GameData[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const listOfGames = await retrieveListOfGamesFromDatabase()
  res.status(200).json({ listOfGames })
}
