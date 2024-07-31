import * as v from "valibot"
import type { Color, GameObj, TextComp } from "kaplay"
import { REGISTRATION_SUBMITTED } from "../event-names"

const eventEmitter = useEventEmitter()

export const REGISTRATION_SCENE = "registration-scene"

export default async function setRegistrationScene() {
  scene(REGISTRATION_SCENE, () => setScene())
}

let nameInputObj: null | GameObj
let counterObj: null | GameObj
let nameLabelObj: null | GameObj
let nameUnderlineObj: null | GameObj
let nameErrorMessageObj: null | GameObj<TextComp | any>

let submitButtonObj: null | GameObj
let submitButtonBgObj: null | GameObj

let activeItem: "name" | "submit" = "name"

const bgColor = [0.5, 0.5, 1]

function setScene() {
  addTitle()
  const {
    name,
    counter,
    nameLabel,
    nameUnderline,
    nameErrorMessage,

    submitButton,
    submitButtonBg,
  } = doTheFirstMainThing()

  nameInputObj = name
  counterObj = counter
  nameLabelObj = nameLabel
  nameUnderlineObj = nameUnderline
  nameErrorMessageObj = nameErrorMessage

  // emailInputObj = email
  // emailCounterObj = emailCounter
  // emailLabelObj = emailLabel
  // emailUnderlineObj = emailUnderline
  // emailErrorMessageObj = emailErrorMessage

  submitButtonObj = submitButton
  submitButtonBgObj = submitButtonBg

  // put all the input objects in an array of objects
  const inputObjects = [
    [
      nameInputObj,
      nameLabelObj,
      counterObj,
      nameErrorMessageObj,
      nameUnderlineObj,
    ],

    [],
  ]

  // paint first item as active by default
  paintActiveItem("name")
  setErrorItems([])

  doTheOptionalOtherThing()
  addGoBackButton()

  const options = ["name", "submit"] as const
  const maxIndex = options.length - 1
  onKeyPress("tab", () => {
    paintActiveItem(getNextItem())
  })

  // loop through input objects and add handling for mobile
  inputObjects.forEach((inputObject, index) => {
    let itemName: "name" | "submit" = "name"

    switch (index) {
      case 0:
        itemName = "name"
        break
      case 1:
        itemName = "submit"
        break
    }

    for (const obj of inputObject) {
      obj.onTouchStart((pos, t) => {
        console.log("Touch start", itemName)
        if (obj.isHovering()) {
          console.log("Touched", itemName)
          handleMobileInput(itemName)
          paintActiveItem(itemName)
        }
      })
    }
  })

  function getActiveItemIndex() {
    return options.indexOf(activeItem)
  }

  function getNextIndex() {
    const activeIndex = getActiveItemIndex()
    return activeIndex === maxIndex ? 0 : activeIndex + 1
  }

  function getPreviousIndex() {
    const activeIndex = getActiveItemIndex()
    return activeIndex === 0 ? maxIndex : activeIndex - 1
  }

  function getPreviousItem() {
    return options[getPreviousIndex()]
  }

  function getNextItem() {
    return options[getNextIndex()]
  }

  onKeyPress("up", () => {
    paintActiveItem(getPreviousItem())
  })

  onKeyPress("down", () => {
    paintActiveItem(getNextItem())
  })

  onKeyPress("escape", () => {
    go("splash")
  })
}

const MIN_LENGTH = 2
const MAX_LENGTH = 30
const MAX_EMAIL_LENGTH = 50
import.meta.client &&
  window.addEventListener("keydown", (e) => {
    if (!nameInputObj) {
      return
    }

    if (e.key === "Enter") {
      const { isValid, errorKeys } = validateForm(nameInputObj)
      if (!isValid) {
        setErrorItems(errorKeys)
        return
      }

      emitRegistrationSubmittedAndGoToSplash(nameInputObj.text)
      return
    }

    if (activeItem === "name") {
      handleNameInput(e, nameInputObj, counterObj!)
    }

    paintActiveItem(activeItem)
    clearError()
    const { isValid, errorKeys } = validateForm(nameInputObj)
    if (!isValid) {
      setErrorItems(errorKeys)
    }
  })

function handleNameInput(e: KeyboardEvent, name: GameObj, counter: GameObj) {
  if ((e.metaKey || e.ctrlKey || e.altKey) && e.key === "Backspace") {
    name.text = ""
    counter!.text = `${name.text.length}/${MAX_LENGTH}`
    return
  }

  if (e.key === "Backspace") {
    name.text = name.text.slice(0, -1)
    counter!.text = `${name.text.length}/${MAX_LENGTH}`
    return
  }

  if (name.text.length >= MAX_LENGTH) {
    return
  }

  if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
    name.text += e.key
    counter!.text = `${name.text.length}/${MAX_LENGTH}`
  }
}

function handleEmailInput(e: KeyboardEvent, email: GameObj, counter: GameObj) {
  if ((e.metaKey || e.ctrlKey || e.altKey) && e.key === "Backspace") {
    email.text = ""
    counter!.text = `${email.text.length}/${MAX_EMAIL_LENGTH}`
    return
  }

  if (e.key === "Backspace") {
    email.text = email.text.slice(0, -1)
    counter!.text = `${email.text.length}/${MAX_EMAIL_LENGTH}`
    return
  }

  if (email.text.length >= MAX_EMAIL_LENGTH) {
    return
  }

  if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9._%+-@]/)) {
    email.text += e.key
    counter!.text = `${email.text.length}/${MAX_EMAIL_LENGTH}`
  }
}

function addTitle() {
  add([
    text("Registration", {
      font: "arcade",
      size: 48,
    }),
    pos(width() / 2, 64),
    anchor("center"),
  ])
}

function doTheFirstMainThing() {
  console.log("Doing the first main thing")

  addFormBG()

  const {
    name,
    counter,
    label: nameLabel,
    underline: nameUnderline,
    errorMessage: nameErrorMessage,
  } = addNameInput()

  const { submitButton, submitButtonBg } = addSumbitButton(80, name)

  return {
    name,
    counter,
    nameLabel,
    nameUnderline,
    nameErrorMessage,

    submitButton,
    submitButtonBg,
  }
}

function addFormBG(formHeight: number = 360) {
  const [r, g, b] = bgColor
  add([
    rect(width(), (height() / 3) * 2),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(r, g, b),
  ])
}

function addNameInput() {
  const label = add([
    text("Enter your name", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() / 2 - 64),
    anchor("center"),
    area(),
  ])

  const name = add([
    text(localStorage.getItem("name") || "", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() / 2 - 32),
    anchor("center"),
    area(),
    {
      value: "",
    },
  ])

  const underline = add([
    text("_".repeat(MAX_LENGTH + 12), {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() / 2 - 32),
    anchor("center"),
    area(),
  ])

  const counter = add([
    text(`${name.text.length}/30`, {
      font: "arcade",
      size: 24,
      width: width(),
      align: "right",
    }),
    pos(width() - 10, height() / 2 + 10),
    anchor("botright"),
    "counter",
    area(),
  ])

  const errorMessage = add([
    text(`Name must be between 2 and 30 characters.`, {
      font: "arcade",
      size: 16,
    }),
    pos(width() / 2, height() / 2 - 2),
    anchor("center"),
    "counter",
    area(),
    color(0, 0, 0),
    opacity(1),
  ])

  label.onClick(() => paintActiveItem("name"))
  name.onClick(() => paintActiveItem("name"))
  counter.onClick(() => paintActiveItem("name"))

  return { name, counter, label, underline, errorMessage }
}

function addSumbitButton(offset: number, name: GameObj) {
  const submitButtonBg = add([
    rect(200, 24 * 1.5),
    pos(width() / 2, height() / 2 + 64 + offset),
    anchor("center"),
  ])

  const submitButton = add([
    text("Submit", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() / 2 + 64 + offset),
    anchor("center"),
    area(),
    color(0.5, 0.5, 1),
  ])

  submitButton.onClick(() => {
    const { isValid, errorKeys } = validateForm(name)
    if (!isValid) {
      setErrorItems(errorKeys)
      return
    }

    emitRegistrationSubmittedAndGoToSplash(name.text)
  })

  return { submitButtonBg, submitButton }
}

function validateForm(name: GameObj) {
  let isValid = true
  let errorKeys: "name"[] = []

  const LoginSchema = v.object({
    name: v.pipe(v.string(), v.minLength(MIN_LENGTH), v.maxLength(MAX_LENGTH)),
  })

  try {
    v.parse(LoginSchema, {
      name: name.text,
    })
  } catch (error) {
    // @ts-expect-error
    const issue = error.issues[0].path[0]
    console.log(
      "Error:",
      issue.key,
      "value:",
      issue.value,
      "message:",
      // @ts-expect-error
      error.message
    )

    console.log(JSON.stringify(error, null, 2))

    // @ts-expect-error
    errorKeys = error.issues.map((issue: any) => {
      return issue.path[0].key
    })

    setErrorItems(errorKeys)

    isValid = false
  }

  return { isValid, errorKeys }
}

function emitRegistrationSubmittedAndGoToSplash(name: string) {
  eventEmitter.emit(REGISTRATION_SUBMITTED, { name })
  // go("splash")
}

function doTheOptionalOtherThing() {
  console.log("Doing the optional other thing")
}

function addGoBackButton() {
  const button = add([
    text("Go back or press Esc", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() - 64),
    anchor("center"),
    area(),
    // color(0.5, 0.5, 1),
  ])

  button.onClick(() => {
    go("splash")
  })
}

function paintActiveItem(item: "name" | "submit") {
  const activeColor = rgb(250, 250, 250)
  const inactiveColor = rgb(100, 100, 100)

  activeItem = item

  if (!nameInputObj) {
    console.log("No input objects")
    return
  }

  resetActiveState(inactiveColor)

  if (item === "name") {
    nameInputObj.color = activeColor
    nameLabelObj!.color = activeColor
    nameUnderlineObj!.color = activeColor
    counterObj!.color = activeColor
  }

  if (item === "submit") {
    submitButtonObj!.color = rgb(255, 255, 255)
    submitButtonBgObj!.color = rgb(86, 184, 250)
  }

  // handleMobileInput(item)
}

function resetActiveState(inactiveColor: Color) {
  if (!nameInputObj) {
    console.log("No input objects")
    return
  }

  nameInputObj.color = inactiveColor
  nameLabelObj!.color = inactiveColor
  nameUnderlineObj!.color = inactiveColor
  counterObj!.color = inactiveColor

  submitButtonObj!.color = rgb(0, 0, 0)
  submitButtonBgObj!.color = rgb(255, 255, 255)
}

function clearError() {
  if (!nameInputObj) {
    return
  }

  const [r, g, b] = bgColor
  nameErrorMessageObj!.color = rgb(r, g, b)
}

function setErrorItems(items: ("name" | "submit")[]) {
  const errorColor = rgb(255, 0, 0)

  if (items.includes("name")) {
    nameInputObj!.color = errorColor
    nameLabelObj!.color = errorColor
    nameUnderlineObj!.color = errorColor
    counterObj!.color = errorColor
    nameErrorMessageObj!.color = errorColor
    nameErrorMessageObj!.opacity = 1
  } else {
    const [r, g, b] = bgColor
    nameErrorMessageObj!.color = rgb(r, g, b)
    nameErrorMessageObj!.opacity = 0
  }
}

function handleMobileInput(item: "name" | "email" | "submit") {
  const check = isPlatformMobile()
  console.log("Is platform mobile?", check)
  if (!check) {
    return
  }

  if (item === "name") {
    nameInputObj!.text =
      prompt("Enter your name", nameInputObj!.text || "") || nameInputObj!.text
  }

  if (item === "submit") {
    //
  }
}