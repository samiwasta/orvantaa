import { cache } from "react"

import { classService } from "../service/class.service"

export const loadClasses = cache(async () => {
  const classes = await classService.listClasses()
  return { classes, total: classes.length }
})
