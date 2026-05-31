import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentSchoolClasses = cache(async (schoolId: string) => {
  const [school, classes] = await Promise.all([
    contentService.getSchoolRef(schoolId),
    contentService.listClassesForSchool(schoolId),
  ])
  if (!school) return null
  return { school, classes }
})
