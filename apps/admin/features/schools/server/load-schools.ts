import { cache } from "react"

import { schoolService } from "../service/school.service"

export const loadSchools = cache(async () => {
  const [schools, boardOptions] = await Promise.all([
    schoolService.listSchools(),
    schoolService.listBoardOptions(),
  ])
  return { schools, boardOptions, total: schools.length }
})
