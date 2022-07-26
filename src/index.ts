import { cli } from 'furious-commander'
import { optionParameters, rootCommandClasses } from './config'
import { printer } from './printer'

cli({
  rootCommandClasses,
  optionParameters,
  printer,
})
