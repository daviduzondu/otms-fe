import { ExternalToast, toast } from "sonner"

export const errorToast = (message: string, data?: ExternalToast) => toast.error(message, data)
export const successToast = (message: string, data?: ExternalToast) => toast.success(message, data)
export const infoToast = (message: string, data?: ExternalToast) => toast.info(message, data)