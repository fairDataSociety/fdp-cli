import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'
import { application } from './application'
import { errorHandler } from './utils/error'

cli({
  rootCommandClasses,
  optionParameters,
  printer,
  application,
  errorHandler,
})
