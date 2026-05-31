import { cache } from "react"

import { contentService } from "../service/content.service"

export const loadContentClasses = cache(async () => {
  const classes = await contentService.listContentClassesByGrade()
  return { classes, total: classes.length }
})
