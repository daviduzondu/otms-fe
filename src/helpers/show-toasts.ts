import { ExternalToast, toast } from "sonner"

export const errorToast = (message: string, data?: ExternalToast) => toast.error(message, data)
export const successToast = (message: string, data?: ExternalToast) => toast.success(message, data)