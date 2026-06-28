export default function () {
  const startDate = new Date("2024-07-18 00:00:00")

  const endDate = new Date("2024-07-20 23:59:59")

  const today = new Date()


  return today >= startDate && today <= endDate
}
