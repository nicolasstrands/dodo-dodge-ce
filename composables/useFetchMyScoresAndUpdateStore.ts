import { useStorage } from "@vueuse/core"
import type { Score } from "~/types"
import { measureAsync } from "~/utils/measureAsync"

export default async function useFetchHighScoresAndUpdateStore() {
  // * Documentation: https://vueuse.org/core/useStorage/
  const email =
    (import.meta.client &&
      useStorage("email", localStorage.getItem("email"), localStorage)) ||
    ref("")
  const emailValue = email.value ?? ""

  if (!emailValue) {
    return { data: [], error: "Please login first!" }
  }

  const { data } = await measureAsync("my-scores:fetch", async () =>
    useFetchMyScores(10, emailValue)
  )
  if (!data) {
    alert("No data found!")
    return { data: [], error: `No data found for this user: ${emailValue} ` }
  }

  const store = useScoreStore()
  await measureAsync("my-scores:store-update", async () => {
    store.personalHighScores = data
    return null
  })
  return { data: store.personalHighScores || ([] as Score[]), error: null }
}
