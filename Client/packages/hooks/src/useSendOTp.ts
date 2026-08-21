import { useState } from "react";
import type { AuthApi } from "@repo/api";

export interface SendOtpFormValues{
    email: string;
}

export function useSendOTp(
    authApi: AuthApi
) {
   const [isLoading, setIsLoading] =
    useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const sendOtp = async(
        values: SendOtpFormValues
    )=> {
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(true);

            const response = await authApi.sendOtp({
                email: values.email.trim().toLowerCase(),
            });

            if (!response.success){
                setError(response.message);
                return false;
            }

            setSuccess(true)
            return true;
        }catch (error){
            setError(
                error instanceof Error ? error.message : "Unable to send Otp."
            );
            return false
        } finally {
            setIsLoading(false);
        }
    };

    const reset
    = ()=> {
        setIsLoading(false)
        setError(null);
        setSuccess(false);
    };

    return {
        sendOtp,
        error,
        success,
        isLoading,
        reset,
    }

}