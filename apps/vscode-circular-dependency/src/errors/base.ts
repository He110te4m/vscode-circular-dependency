import ModernError, { type InstanceOptions } from 'modern-errors'

export const BaseError = ModernError.subclass('BaseError', {
  props: {
    isVSCodeError: true,
  },

  custom: class extends ModernError {
    #suggest?: string
    constructor(message: string, options?: InstanceOptions, suggest?: string) {
      super(message, options)
      this.#suggest = suggest
    }

    get suggest() {
      return this.#suggest
    }
  },
})
