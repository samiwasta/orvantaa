import { cache } from "react"

import { classService } from "../service/class.service"

export const loadClasses = cache(async () => {
  const [classes, schoolOptions] = await Promise.all([
    classService.listCatalogClasses(),
    classService.listSchoolOptions(),
  ])
  return { classes, schoolOptions, total: classes.length }
})
