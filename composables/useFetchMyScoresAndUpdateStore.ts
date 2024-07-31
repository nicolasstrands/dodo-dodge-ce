import { useStorage } from "@vueuse/core"
import type { Score } from "~/types"

export default async function useFetchHighScoresAndUpdateStore() {
  // * Documentation: https://vueuse.org/core/useStorage/
  const email =
    (import.meta.client &&
      useStorage("email", localStorage.getItem("email"), localStorage)) ||
    ref("")

  console.warn(
    "Please remove the default email from useFetchMyScoresAndUpdateStore.ts"
  )

  if (!email.value) {
    return { data: [], error: "Please login first!" }
  }

  const { data } = await useFetchMyScores(10, email.value)
  if (!data) {
    alert("No data found!")
    return { data: [], error: `No data found for this user: ${email.value} ` }
  }

  const store = useScoreStore()
  store.personalHighScores = data
  return { data: store.personalHighScores || ([] as Score[]), error: null }
}
