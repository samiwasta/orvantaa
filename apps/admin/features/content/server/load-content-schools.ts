import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentSchools = cache(async () => {
  const schools = await contentService.listSchools()
  return { schools, total: schools.length }
})
