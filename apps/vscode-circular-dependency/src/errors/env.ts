import { BaseError } from './base'

export const EnvError = BaseError.subclass('EnvError', {
  props: {
    isEnvError: true,
  },
})
