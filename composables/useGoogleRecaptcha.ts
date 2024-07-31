import { useReCaptcha } from "vue-recaptcha-v3"
/**
 * The exported executeRecaptcha function allows
 * you to execute reCAPTCHA actions
 * and retrieve the reCAPTCHA token along with the header options
 * to be used in subsequent requests.
 */
export default () => {
  const recaptchaInstance = useReCaptcha()
  const executeRecaptcha = async (action: string) => {
    /**
     * Wait for the recaptchaInstance to be loaded
     * by calling the recaptchaLoaded method.
     * This ensures that the reCAPTCHA library is fully loaded
     * and ready to execute reCAPTCHA actions.
     */
    await recaptchaInstance?.recaptchaLoaded()
    const token = await recaptchaInstance?.executeRecaptcha(action)
    const headerOptions = {
      headers: {
        "google-recaptcha-token": token,
      },
    }
    return { token, headerOptions }
  }
  return { executeRecaptcha }
}
