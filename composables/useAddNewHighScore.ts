export const useAddNewHighScore = async ({
  highscore,
  playername,
  time,
  startTime,
  session_id,
}: {
  highscore: number
  playername: string
  time: number
  startTime: Date
  session_id: string
}): Promise<any> => {
  try {
    const { addData, getDataByProperty, clearStore } = useIndexedDB()

    // get the session logs
    const logs = (await getDataByProperty(
      "gameLogs",
      "session_id",
      session_id
    )) as any[]

    console.log(logs)

    if (logs.length == 0) {
      throw new Error("Invalid session")
    }

    // check if logs contain a start and end
    const start = logs.find((log) => log.session_event_type == "START")

    if (!start) {
      throw new Error("Invalid session")
    }

    const end = logs.find((log) => log.session_event_type == "END")

    if (!end) {
      throw new Error("Invalid session")
    }

    const correctAmountOfRows = Math.floor(time / 60) + 2

    if (logs.length !== correctAmountOfRows) {
      throw new Error("Invalid session")
    }

    await clearStore("gameLogs")

    return await addData("highScores", {
      id: session_id,
      highscore,
      playername,
      time,
      startTime,
    })
  } catch (err) {
    console.error(err)
    return { success: false, error: err }
  }
}
