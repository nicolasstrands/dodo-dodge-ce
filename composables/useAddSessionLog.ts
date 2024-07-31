import { useIndexedDB } from "./useIndexedDB"

export const useAddSessionLog = async ({
  playername,
  score,
  time,
  session_id,
  session_event_type,
}: {
  playername: string
  score: number
  time: number
  session_id?: string
  session_event_type?: string
}): Promise<any> => {
  try {
    const { addData } = useIndexedDB()

    if (!session_id) {
      session_id = crypto.randomUUID()
      session_event_type = "START"
    }

    await addData("gameLogs", {
      id: session_id + "_" + session_event_type + "_" + time,
      playername,
      score,
      time,
      session_id,
      session_event_type,
    })

    return {
      success: true,
      data: "ok",
      session_id,
    }
  } catch (err) {
    console.error(err)
  }
}
