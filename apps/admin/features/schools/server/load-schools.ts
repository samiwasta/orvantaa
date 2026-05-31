import { cache } from "react"

import { schoolService } from "../service/school.service"

export const loadSchools = cache(async () => {
  const schools = await schoolService.listSchools()
  return { schools, total: schools.length }
})
